// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { signInWithEmailAndPassword } from 'firebase/auth'; // Alterado para usar a versão modular

const firebaseConfig = {
  apiKey: "AIzaSyAnUOTiKPwHp0z3-TjpSyTojszTv2s6Yo8",
  authDomain: "app-lab-ufop-ad998.firebaseapp.com",
  databaseURL: "https://app-lab-ufop-ad998-default-rtdb.firebaseio.com",
  projectId: "app-lab-ufop-ad998",
  storageBucket: "app-lab-ufop-ad998.firebasestorage.app",
  messagingSenderId: "8339523957",
  appId: "1:8339523957:web:263c056d0a064414dcab3c",
  measurementId: "G-GGSDK71NZ1"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o auth e o database
const auth = getAuth(app);
const database = getDatabase(app);

export  { auth, database, signInWithEmailAndPassword };
