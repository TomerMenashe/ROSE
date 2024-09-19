// src/firebase.js

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import firebaseConfig from './firebaseConfig';
import 'firebase/compat/database';

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export { firebase };
//