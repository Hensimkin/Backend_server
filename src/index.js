// import express from 'express';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// //import admin from 'firebase-admin';
// import * as serviceAccount from './config/server-firebase-keys.json' assert { type: 'json' };
// // import 'firebase-admin';
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { firebaseConfig } from './config/firebase-config.js';
// // for write methods
// import { collection, addDoc } from "firebase/firestore";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword , sendEmailVerification} from "firebase/auth";
//
//
// import { getDocs } from "firebase/firestore";
//
// import multer from 'multer';
//
//
// const port = process.env.PORT || 5000;
// const app = express();
// app.use(cors());
//
// const firestore_app = initializeApp(firebaseConfig);
//
// const db = getFirestore(firestore_app);
//
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
//
// let dateValid = false;
// let emailValid = false;
// let passwordValid = false;
// let date = null;
// let mail = null;
// let pass = null;
// const auth = getAuth();
//
//
// app.get('/', (req, res) => {
//     console.log('A new request');
//     res.send('Hello from server main page');
// });
//
// app.post('/post_signin', async (req, res) => {
//     let flag = false;
//     const {
//         email,
//         password
//     } = req.body.credentials;
//     console.log(email);
//     console.log(password);
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailPattern.test(email) || password.length < 8) {
//         res.send('Email or password is invalid');
//     } else {
//         try {
//             signInWithEmailAndPassword(auth, email, password)
//                 .then(() => { console.log('Baruch Haba Ya Malshin!') });
//             /// Log in success.
//             /// need to add email verification
//
//
//         }catch(error) {
//             flag = true;
//             console.log("Incorrect details");
//
//         };
//         if(!flag) {
//             console.log('Transfer to Profile');
//             // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//             // this is new -> need to add in the front!
//             res.send('yes', auth.on);
//         }
//         if(flag) {
//             console.log('Transfer to Home Page');
//             res.send('no');
//         }
//
//
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
//         res.send('Email received');
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
//         pass = password;
//         passwordValid = true;
//         res.send('Password received');
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
//         res.send('Date received');
//     }
// });
//
// app.post('/post_approve', async (req, res) => {
//     if (passwordValid && emailValid && dateValid) {
//         const user = {
//             mail: mail,
//             password: pass,
//         };
//         try {
//             const docRef = await createUserWithEmailAndPassword(auth, user.mail, user.password);
//             // console.log("Document written with ID: ", docRef);
//             const userObj = docRef.user;
//             try {
//                 console.log('sending mail');
//                 await sendEmailVerification(userObj);
//                 console.log("Email verification sent");
//                 // Handle success
//             } catch (error) {
//                 console.error("Error sending email verification:", error);
//                 // Handle error
//             }
//         } catch (e) {
//             console.error("Error adding document: ", e);
//         }
//         console.log('Transfer to Home Page');
//         res.send('yes');
//     } else {
//         console.log('Not valid');
//         res.send('no');
//     }
// });
//
//
// app.post('/post_title', async (req, res) => {
//     let { title } = req.body;
//     console.log(title);
//     res.send('title received'); // Add this line to send a response back to the client
// });
//
// app.post('/post_price', async (req, res) => {
//     let { price } = req.body;
//     console.log(price);
//     res.send('price received'); // Add this line to send a response back to the client
// });
//
// app.post('/post_category', async (req, res) => {
//     let { category } = req.body;
//     console.log(category);
//     res.send('category received'); // Add this line to send a response back to the client
// });
//
// app.post('/post_description', async (req, res) => {
//     let { description } = req.body;
//     console.log(description);
//     res.send('title received'); // Add this line to send a response back to the client
// });
//
//
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         // Specify the directory where you want to save the uploaded pictures
//         cb(null, 'uploads/');
//     },
//     filename: function (req, file, cb) {
//         // Generate a unique filename for each uploaded picture
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, file.fieldname + '-' + uniqueSuffix);
//     }
// });
//
//
//
// const upload = multer({ storage: storage });
//
// app.post('/post_pictures', upload.array('pictures'), async (req, res) => {
//     // The uploaded pictures are available in req.files array
//     console.log("picture");
//     console.log(req.files);
//
//     // You can process the uploaded pictures here
//
//     res.send('Pictures received'); // Send a response back to the client
// });
//
//
//
// app.listen(port, () => {
//     console.log(`Server is running on port: ${port}`);
// });
//

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as serviceAccount from './config/server-firebase-keys.json' assert { type: 'json' };
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from './config/firebase-config.js';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword} from 'firebase/auth'
import multer from 'multer';

// Set up the server
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Firebase
const firestore_app = initializeApp(firebaseConfig);
const db = getFirestore(firestore_app);

// Set up file upload storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the directory where you want to save the uploaded pictures
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for each uploaded picture
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

// Variables for validation
let dateValid = false;
let emailValid = false;
let passwordValid = false;
let date = null;
let mail = null;
let pass = null;

// Firebase authentication instance
let auth = getAuth();

/**
 * Main route of the server.
 */
app.get('/', (req, res) => {
    console.log('A new request');
    res.send('Hello from server main page');
});

/**
 * Sign in a user.
 * Expects request body to contain the following:
 * - email: User's email
 * - password: User's password
 * If the email or password is invalid, it sends a response with an error message.
 * If the sign in is successful, it sends a response with 'yes'.
 * If the sign in fails, it sends a response with 'no'.
 */
app.post('/post_signin', async (req, res) => {
    let flag = false;
    const { email, password } = req.body.credentials;
    auth = getAuth();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email) || password.length < 8) {
        res.send('Email or password is invalid');
    } else {
        try {
            signInWithEmailAndPassword(auth, email, password)
                .then(() => { console.log('Baruch Haba Ya Malshin!' + auth.currentUser.email.toString()) });
            // this can be the uid for any user
            const connected_user_mail = auth.currentUser.email.toString();


            // Log in success.
            // Need to add email verification

        } catch (error) {
            flag = true;
            console.log("Incorrect details");
        }
        // add the authentication user to the response
        // for the good ones.
        if (!flag) {
            console.log('Transfer to Profile');
            res.send('yes');
        }
        // returning to the homepage/ signin page.
        if (flag) {
            console.log('Transfer to Home Page');
            res.send('no');
        }
    }
});

/**
 * Receive and validate an email.
 * Expects request body to contain the following:
 * - email: User's email
 * If the email is valid, it sends a response with 'Email received'.
 * If the email is invalid, it sends a response with an error message.
 */
app.post('/post_email', async (req, res) => {
    const { email } = req.body;
    mail = email;
    emailValid = false;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        res.send('Please enter a valid email');
    } else {
        mail = email;
        emailValid = true;
        res.send('Email received');
    }
    console.log(email);
});

/**
 * Receive and validate a password.
 * Expects request body to contain the following:
 * - password: User's password
 * If the password is valid, it sends a response with 'Password received'.
 * If the password is invalid, it sends a response with an error message.
 */
app.post('/post_password', async (req, res) => {
    const { password } = req.body;
    passwordValid = false;
    if (password.length < 8) {
        res.send('Password must be at least 8 characters long');
    } else if (!password.match(/[a-zA-Z]/)) {
        res.send('Password must contain at least one letter');
    } else {
        pass = password;
        passwordValid = true;
        res.send('Password received');
    }
    console.log(password);
});

/**
 * Receive and validate a birthdate.
 * Expects request body to contain a single key-value pair with the selected date.
 * If the user's age is less than 13, it sends a response with an error message.
 * If the birthdate is valid, it sends a response with 'Date received'.
 */
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

/**
 * Process the user's approval.
 * If the password, email, and birthdate are valid, it creates a new user account,
 * sends an email verification, and sends a response with 'yes'.
 * If any of the validation fails, it sends a response with 'no'.
 */
app.post('/post_approve', async (req, res) => {
    if (passwordValid && emailValid && dateValid) {
        const user = {
            mail: mail,
            password: pass,
        };
        try {
            const docRef = await createUserWithEmailAndPassword(auth, user.mail, user.password);
            const userObj = docRef.user;
            try {
                console.log('sending mail');
                await sendEmailVerification(userObj);
                console.log("Email verification sent");
            } catch (error) {
                console.error("Error sending email verification:", error);
            }
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

/**
 * Receive and process a title.
 * Expects request body to contain the following:
 * - title: Title value
 * It sends a response with 'title received'.
 */
app.post('/post_title', async (req, res) => {
    let { title } = req.body;
    console.log(title);
    res.send('title received');
});

/**
 * Receive and process a price.
 * Expects request body to contain the following:
 * - price: Price value
 * It sends a response with 'price received'.
 */
app.post('/post_price', async (req, res) => {
    let { price } = req.body;
    console.log(price);
    res.send('price received');
});

/**
 * Receive and process a category.
 * Expects request body to contain the following:
 * - category: Category value
 * It sends a response with 'category received'.
 */
app.post('/post_category', async (req, res) => {
    let { category } = req.body;
    console.log(category);
    res.send('category received');
});

/**
 * Receive and process a description.
 * Expects request body to contain the following:
 * - description: Description value
 * It sends a response with 'description received'.
 */
app.post('/post_description', async (req, res) => {
    let { description } = req.body;
    console.log(description);
    res.send('description received');
});

/**
 * Receive and process uploaded pictures.
 * Expects a 'pictures' field in the multipart form data.
 * It saves the uploaded pictures to a destination directory.
 * It sends a response with 'Pictures received'.
 */
app.post('/post_pictures', upload.array('pictures'), async (req, res) => {
    // The uploaded pictures are available in req.files array
    console.log("picture");
    console.log(req.files);

    // You can process the uploaded pictures here

    res.send('Pictures received');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
