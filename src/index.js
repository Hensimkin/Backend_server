// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import * as admin from 'firebase-admin';
// import * as serviceAccount from './config/server-firebase-keys.json' assert { type: 'json' };
//
// const port = process.env.PORT || 5000;
// const app = express();
// app.use(cors());
// const admin_app = admin.initializeApp({
//     credential: admin.credential.cert(JSON.parse(serviceAccount)),
// });
//
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json()); // Add this line to parse JSON requests
//
// let dateValid = false;
// let emailValid = false;
// let passwordValid = false;
// let date = null;
// let mail = null;
// const pass = null;
//
// app.get('/', (req, res) => {
//     console.log('A new request');
//     res.send('Hello from server main page');
// });
//
// app.post('/post_signin', async (req, res) => {
//     const { email, password } = req.body.credentials;
//     console.log(email);
//     console.log(password);
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(email) || password.length < 8) {
//         res.send('Email or password is invalid');
//     } else {
//         res.send('Welcome Back!');
//     }
// });
//
// app.post('/post_email', async (req, res) => {
//     const { email } = req.body;
//     mail = email;
//     emailValid = false;
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(email)) res.send('Please enter a valid email');
//     else {
//         mail = email;
//         emailValid = true;
//         res.send('Email received'); // Add this line to send a response back to the client
//     }
//     console.log(email);
// });
//
// app.post('/post_password', async (req, res) => {
//     const { password } = req.body;
//     passwordValid = false;
//     if (password.length < 8) res.send('Password must be at least 8 characters long');
//     else if (!password.match(/[a-zA-Z]/)) {
//         res.send('Password must contain at least one letter');
//     } else {
//         passwordValid = true;
//         res.send('Password received'); // Add this line to send a response back to the client
//     }
//     console.log(password);
// });
//
// app.post('/post_birthdate', async (req, res) => {
//     const today = new Date();
//     dateValid = false;
//     const selectedDate = Object.keys(req.body)[0];
//     console.log(selectedDate);
//     const birthDate = new Date(selectedDate);
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDifference = today.getMonth() - birthDate.getMonth();
//     if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//     }
//     if (age < 13) {
//         res.send('You must be at least 13 years old.');
//     } else {
//         date = selectedDate;
//         dateValid = true;
//         res.send('date received');
//     }
// });
//
// app.post('/post_approve', async (req, res) => {
//     if (passwordValid && emailValid && dateValid) {
//         const user = {
//             email: mail,
//             password: pass,
//             birthdate: date,
//         };
//         const db = admin_app.database();
//         const userRef = db.ref('users');
//         userRef.push(user)
//             .then(() => {
//                 console.log('New User stored in the database');
//             });
//
//         console.log('Transfer to Home Page');
//         res.send('yes');
//     } else {
//         console.log('not valid');
//         res.send('no');
//     }
// });
//
// app.listen(port, () => {
//     console.log(`Server is running on port: ${port}`);
// });


import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import admin from 'firebase-admin';
import * as serviceAccount from './config/server-firebase-keys.json' assert { type: 'json' };
import 'firebase-admin';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from './config/firebase-config.js';
// for write methods
import { collection, addDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";


// for read methods
import { getDocs } from "firebase/firestore";



const port = process.env.PORT || 5000;
const app = express();
app.use(cors());

const firestore_app = initializeApp(firebaseConfig);

const db = getFirestore(firestore_app);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let dateValid = false;
let emailValid = false;
let passwordValid = false;
let date = null;
let mail = null;
let pass = null;
const auth = getAuth();



app.get('/', (req, res) => {
    console.log('A new request');
    res.send('Hello from server main page');
});

app.post('/post_signin', async (req, res) => {
    const {
        email,
        password
    } = req.body.credentials;
    console.log(email);
    console.log(password);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email) || password.length < 8) {
        res.send('Email or password is invalid');
    } else {
        try {
            signInWithEmailAndPassword(auth, email, password)
                .then(() => { console.log('Baruch Haba Ya Malshin!') });
            /// Log in success.
            /// need to add email verification

        }catch(error) {
            console.log(req.body.credentials);
            const errorCode = error.code;
            const errorMessage = error.message;
        };

    }
});

app.post('/post_email', async (req, res) => {
    const { email } = req.body;
    mail = email;
    emailValid = false;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) res.send('Please enter a valid email');
    else {
        mail = email;
        emailValid = true;
        res.send('Email received');
    }
    console.log(email);
});

app.post('/post_password', async (req, res) => {
    const { password } = req.body;
    passwordValid = false;
    if (password.length < 8) res.send('Password must be at least 8 characters long');
    else if (!password.match(/[a-zA-Z]/)) {
        res.send('Password must contain at least one letter');
    } else {
        pass = password;
        passwordValid = true;
        res.send('Password received');
    }
    console.log(password);
});

app.post('/post_birthdate', async (req, res) => {
    const today = new Date();
    dateValid = false;
    const selectedDate = Object.keys(req.body)[0];
    console.log(selectedDate);
    const birthDate = new Date(selectedDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 13) {
        res.send('You must be at least 13 years old.');
    } else {
        date = selectedDate;
        dateValid = true;
        res.send('Date received');
    }
});

app.post('/post_approve', async (req, res) => {
    if (passwordValid && emailValid && dateValid) {
        const user = {
            mail: mail,
            password: pass,
        };

        try {
            const docRef = await createUserWithEmailAndPassword(auth, user.mail, user.password);
            console.log("Document written with ID: ", docRef);
        } catch (e) {
            console.error("Error adding document: ", e);
        }


        console.log('Transfer to Home Page');
        res.send('yes');
    } else {
        console.log('Not valid');
        res.send('no');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

