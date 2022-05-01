
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { doc, deleteDoc } from "firebase/firestore";
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useRef, useState } from 'react';
import { dblClick } from '@testing-library/user-event/dist/click';

firebase.initializeApp({
  apiKey: "AIzaSyDHCNrPRFSZVLeA3bPNJbfg5578jb_Yo4M",
  authDomain: "chat-app77.firebaseapp.com",
  projectId: "chat-app77",
  storageBucket: "chat-app77.appspot.com",
  messagingSenderId: "244716559938",
  appId: "1:244716559938:web:20d35b970edc898c6c57db",
  measurementId: "G-H4QN3N88BR"
})

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <div className='header'>
        <SignOut />
      </div>
      <section>
          {user ? <ChatRoom/> : <SignIn/>} 
      </section>
    </div>
  );
}

function SignIn(){
  const signInGoogle = (e) =>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
    <button className='sign-in' onClick={signInGoogle}>Sign In</button>
  )
}

function SignOut(){

  return auth.currentUser && (
    <button className='sign-out' onClick={()=>auth.signOut()}>Sign Out</button>
    )
    
}
function ChatRoom(){
  const lastmsg = useRef();


  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt');
//listen to any updates in data in real time
  const [messages] = useCollectionData(query, {idField: 'id'});
  //returns array of object, each object is the message you write, and React reacts to changes in real time
  const [inputValue, setInputValue] = useState('');

  const sendMessage = async(e) =>{

    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    //add document with input in the field
    await messagesRef.add({
      text: inputValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })
    setInputValue('');

    lastmsg.current.scrollIntoView({ behavior: 'smooth'})
  }
  return (
    <>
      <div className='main'> 
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={lastmsg}></div>
      </div>
      <form onSubmit={sendMessage}>
        <input 
          value={inputValue}
          onChange={(e)=>setInputValue(e.target.value)}
          placeholder="Write a message.."
        />
        <button type='submit'>send</button>
      </form>
    </>
  )
}
function ChatMessage(props){
  const {text, uid, photoURL} = props.message;
  const msgClass = uid === auth.currentUser.uid ? 'sent' : 'received';
  return (
    <div className={`message ${msgClass}`}>
      <img src={photoURL} alt="img"/>
      <p>{text}</p>
    </div>
    )
}

export default App;
