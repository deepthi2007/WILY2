import firebase from 'firebase';
require('@firebase/firestore')

 var firebaseConfig = {
    apiKey: "AIzaSyB1h4X-no-ATrGHQd7_KFFs-vta4qM-ikE",
    authDomain: "wireless-library-app-fc0a3.firebaseapp.com",
    projectId: "wireless-library-app-fc0a3",
    storageBucket: "wireless-library-app-fc0a3.appspot.com",
    messagingSenderId: "456663470516",
    appId: "1:456663470516:web:66d462423b40be488022e1"
  };
  // Initialize Firebase
  var db;
  if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
  }
  export default firebase.firestore()