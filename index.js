// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;//a nivel de clase para log y out de login de la BD

// Add Firebase project configuration object here
const firebaseConfig = { // var firebaseConfig = {};
    apiKey: "AIzaSyA1f6nzZMXrCSObZ_zN03udHtI9UvjXFNA",
    authDomain: "fir-web-codelab-456e1.firebaseapp.com",
    databaseURL: "https://fir-web-codelab-456e1.firebaseio.com",
    projectId: "fir-web-codelab-456e1",
    storageBucket: "fir-web-codelab-456e1.appspot.com",
    messagingSenderId: "124995105714",
    appId: "1:124995105714:web:34f2be5aaad7b8b3612aab"
  };

//apenas se agrega la configuracion de fireBase se descomenta esta linea
firebase.initializeApp(firebaseConfig);

// FirebaseUI config
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl){
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};
//esta linea le dice que vamos a utilizar la autenticacion
const ui = new firebaseui.auth.AuthUI(firebase.auth());
//evento del boton para autenticar
startRsvpButton.addEventListener("click", ()=>{
  if(firebase.auth().currentUser){
    firebase.auth().signOut();
  } else {
    ui.start("#firebaseui-auth-container", uiConfig);
  }
});

firebase.auth().onAuthStateChanged((user)=>{
 if(user){
   startRsvpButton.textContent = "LOGOUT";
   guestbookContainer.style.display = "block";
   subscribeGuestbook();
   subscribeCurrentRSVP(user);
 }else{
   startRsvpButton.textContent = "RSVP";
   guestbookContainer.style.display = "none";
   unubscribeGuestbook();
   unsubscribeCurrentRSVP();
 }
});

// ..
// Listen to the form submission
form.addEventListener("submit", (e) => {
 // Prevent the default form redirect
 e.preventDefault();
 // Write a new message to the database collection "guestbook"
 firebase.firestore().collection("guestbook").add({
   text: input.value,
   timestamp: Date.now(),
   name: firebase.auth().currentUser.displayName,
   userId: firebase.auth().currentUser.uid
 })
 // clear message input field
 input.value = ""; 
 // Return false to avoid redirect
 return false;
});

/*
firebase.firestore().collection("guestbook").orderBy("timestamp","desc").onSnapshot((snaps) => {
  guestbook.innerHTML = "";
  snaps.forEach((doc)=>{
    const entry = document.createElement("p");
    entry.textContent = doc.data().name + ": " + doc.data().text;
    guestbook.appendChild(entry);
  });
});
*/

function subscribeGuestbook(){
  guestbookListener=firebase.firestore().collection("guestbook").orderBy("timestamp","desc").onSnapshot((snaps) => {
  guestbook.innerHTML = "";
  snaps.forEach((doc)=>{
    const entry = document.createElement("p");
    entry.textContent = doc.data().name + ": " + doc.data().text;
    guestbook.appendChild(entry);
  });
});
}

function unubscribeGuestbook(){
  if(guestbookListener != null){
    guestbookListener();
    guestbookListener = null;
  }
}

rsvpYes.onclick = () => {
  const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);
  userDoc.set({
    attending: true
  }).catch(console.error);
}

 rsvpNo.onclick = () => {
  const userDoc = firebase.firestore().collection('attendees')
  .doc(firebase.auth().currentUser.uid);
  userDoc.set({
    attending: false
  }).catch(console.error);
 }

firebase.firestore().collection('attendees')
.where("attending","==",true).onSnapshot((snap) => {
  const newAttendeeCount = snap.docs.length;
  numberAttending.innerHTML = newAttendeeCount + " people going";
});

function subscribeCurrentRSVP(user){
 rsvpListener = firebase.firestore()
 .collection('attendees')
 .doc(user.uid)
 .onSnapshot((doc) => {
   if (doc && doc.data()){
     const attendingResponse = doc.data().attending;
     // Update css classes for buttons
     if (attendingResponse){
       rsvpYes.className="clicked";
       rsvpNo.className="";
     }
     else{
       rsvpYes.className="";
       rsvpNo.className="clicked";
     }
   }
 });

function unsubscribeCurrentRSVP() {
  if (rsvpListener != null) {
    rsvpListener();
    rsvpListener = null;
  }
  rsvpYes.className = "";
  rsvpNo.className = "";
}

}

