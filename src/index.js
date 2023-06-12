/* eslint-disable */
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, where, query, updateDoc,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword,
  fetchSignInMethodsForEmail, sendEmailVerification, sendPasswordResetEmail, setPersistence, browserLocalPersistence,
  updatePassword, reauthenticateWithCredential, EmailAuthProvider
} from 'firebase/auth';
import multer from 'multer';
import { firebaseConfig } from './config/firebase-config.js';
import fs from 'fs';
import { getStorage, ref, uploadBytes,getDownloadURL } from "firebase/storage";
import admin from 'firebase-admin';
//const serviceAccount = require("src/config/server-firebase-keys.json"); // Path to your service account key file
admin.initializeApp({
  credential: admin.credential.cert("src/config/server-firebase-keys.json"),
  projectId: 'server-firebase-14dd9', // Replace with your actual project ID

});
const fstorage = getStorage();

// Set up the server
const port = process.env.PORT || 5000;
const serverURL = "backend-server-qdnc.onrender.com";
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Initialize Firebase

const firestore_app = initializeApp(firebaseConfig);
const db = getFirestore(firestore_app);

async function checkEmailInUse(email) {
  try {
    const methods = await fetchSignInMethodsForEmail(getAuth(), email);
    return methods.length > 0; // Returns true if email is already in use
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
}

// Set up file upload storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Specify the directory where you want to save the uploaded pictures
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // Generate a unique filename for each uploaded picture
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});

const upload = multer({ storage });

// Variables for validation
let dateValid = false;
let emailValid = false;
let passwordValid = false;
let fullName = null;
let date = null;
let mail = null;
let pass = null;
let phone = null;
const storedData = {};

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
  const { email, password } = req.body.credentials;
  auth = getAuth();

  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithEmailAndPassword(auth, email, password);

    if (!auth.currentUser.emailVerified) {
      console.log('Need to verify email');
      res.send('You need to verify your email');
    } else {
      console.log(`Baruch Haba Ya Malshin!${auth.currentUser.email.toString()}`);
      console.log('Transfer to Home page');
      res.send('Welcome !');
    }
  } catch (error) {
    console.log('Incorrect details');
    console.log(error);
    res.send('Incorrect details');
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
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    res.send('Please enter a valid email');
  } else {
    try {
      const isEmailInUse = await checkEmailInUse(email);

      if (isEmailInUse) {
        res.send('Email is already in use');
      } else {
        res.send('Email is available');
        mail = email;
        emailValid = true;
      }
    } catch (error) {
      console.error('Error checking email:', error);
      res.status(500).send('An error occurred while checking the email');
    }
  }

  console.log(email);
});

app.post('/post_reset', async (req, res) => {
  const { email } = req.body;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  auth = getAuth();
  if (!emailPattern.test(email)) {
    res.send('Please enter a valid email');
  } else {
    try {
      const isEmailInUse = await checkEmailInUse(email);

      if (isEmailInUse) {
        sendPasswordResetEmail(auth, email)
          .then(() => {
            // Password reset email sent successfully
            console.log('Password reset email sent');
            res.send('Password reset email sent');
          })
          .catch((error) => {
            // An error occurred while sending the password reset email
            console.error(error);
          });
      } else {
        res.send('Invalid details');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      res.status(500).send('An error occurred while checking the email');
    }
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

app.post('/post_phoneNumber', async (req, res) => {
  const phoneNumber = Object.keys(req.body)[0]; // Get the first property name from req.body as the phone number
  console.log(phoneNumber); // Print the phone number
  phone = phoneNumber;
  res.send('Phone number received successfully.'); // Send a response to the client
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
    fullName = Object.keys(req.body)[0];
    console.log(fullName);

    const user = {
      mail,
      password: pass,
    };

    const adduser = {
      mail,
      password: pass,
      phone,
      name: fullName,
      birthdate: date,
      saved: [],
      followers: [],
      following: [],
      savedListingForLater:[],
      LikedListing:[],
    };
    try {
      const docRef = await createUserWithEmailAndPassword(auth, user.mail, user.password);
      const userObj = docRef.user;
      try {
        console.log('sending mail');
        await sendEmailVerification(userObj);
        console.log('Email verification sent');
      } catch (error) {
        console.error('Error sending email verification:', error);
      }

      console.log('Transfer to Home Page');
      res.send('yes');
      try {
        // Save the post data to Firestore
        const newUser = { ...adduser, uid: userObj.uid };
        await addDoc(collection(db, 'users'), newUser);
        console.log('Post data saved:', newUser);
      } catch (error) {
        console.error('Error sending email verification:', error);
      }
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        // Handle the case where the email is already in use
        console.log('Email is already in use. Please choose a different email.');
        res.send('Email already in use');
      } else console.error('Error adding document: ', e);
    }
  } else {
    console.log('Not valid signup');
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
  const { title } = req.body;
  console.log(title);
  storedData.title = title;
  console.log(storedData);
  res.send('title received'); // Add this line to send a response back to the client
});

/**
 * Receive and process a price.
 * Expects request body to contain the following:
 * - price: Price value
 * It sends a response with 'price received'.
 */
app.post('/post_price', async (req, res) => {
  const { price } = req.body;
  console.log(price);
  storedData.price = price;
  console.log(storedData);
  res.send('price received'); // Add this line to send a response back to the client
});

/**
 * Receive and process a category.
 * Expects request body to contain the following:
 * - category: Category value
 * It sends a response with 'category received'.
 */
app.post('/post_category', async (req, res) => {
  const { category } = req.body;
  console.log(category);
  storedData.category = category;
  console.log(storedData);
  res.send('category received'); // Add this line to send a response back to the client
});

/**
 * Receive and process a description.
 * Expects request body to contain the following:
 * - description: Description value
 * It sends a response with 'description received'.
 */
app.post('/post_description', async (req, res) => {
  const { description } = req.body;
  console.log(description);
  storedData.description = description;
  console.log(storedData);
  res.send('title received'); // Add this line to send a response back to the client
});

/**
 * Receive and process uploaded pictures.
 * Expects a 'pictures' field in the multipart form data.
 * It saves the uploaded pictures to a destination directory.
 * It sends a response with 'Pictures received'.
 */
app.post('/post_pictures', upload.array('pictures'), async (req, res) => {
  // The uploaded pictures are available in req.files array
  console.log(req.files);
  storedData.pictures = req.files.map((file) => file.filename);
  console.log(storedData);
  console.log(storage);
  res.send('Pictures received');
});

app.get('/get_stored_data', (req, res) => {
  res.json(storedData);
});

app.post('/post_all', upload.array('pictures'),async (req, res) => {
  const { title, price, category, description } = req.body;
  const pictures = req.files;

  // Upload pictures to Firebase Storage
  const pictureUrls = [];
  for (const picture of pictures) {
    const storageRef = ref(fstorage, `/images/${picture.originalname}`);
    const data = await fs.promises.readFile(picture.path);
    const snapshot = await uploadBytes(storageRef, data);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    pictureUrls.push(downloadUrl);
  }

  auth = getAuth();
  const userId = auth.currentUser.uid;

  try {
    // Retrieve the user document that matches the userId
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      const { phone } = userData;
      const { name } = userData;
      const listingData = {
        title,
        price,
        category,
        description,
        userid: userId,
        phone,
        name,
        pictures: pictureUrls, // Store the picture URLs in the listing data
        likes:0,
      };

      // Save the post data to Firestore
      const listingRef = await addDoc(collection(db, 'listings'), listingData);
      const listingId = listingRef.id;
      console.log('Post data saved:', listingData);
      // Update the listing data with the listing ID
      const updatedListingData = {
        ...listingData,
        id: listingId,
      };

      // Update the listing document with the ID field
      await setDoc(doc(db, 'listings', listingId), updatedListingData);

      res.send('Data received');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error saving post data:', error);
    res.status(500).send('An error occurred while saving the post data');
  }
});


// Profile

app.post('/edit_name', async (req, res) => {
  const { FullName } = req.body;
  console.log(FullName);

  try {
    const userQuery = query(collection(db, 'users'), where('uid', '==', getAuth().currentUser.uid));
    const userSnapshot = await getDocs(userQuery);
    const userDoc = userSnapshot.docs[0]; // Assuming there is only one matching user document
    if (userDoc.data().name === FullName){
      console.log('name unchanged');
      res.send('New name similar to the current name');
      return;
    }
    const updatedUserData = {
      mail: userDoc.data().mail,
      name: FullName,
      uid: userDoc.data().uid,
      phone: userDoc.data().phone,
    };

    await updateDoc(doc(db, 'users', userDoc.id), updatedUserData);

    console.log('name changed');
    console.log(updatedUserData.name);
    res.send('Name has changed');
  } catch (error) {
    console.log(error);
    console.log('name unchanged');
    res.send('name unchanged');
  }
});

app.post('/edit_phone_number', async (req, res) => {
  const { PhoneNumber } = req.body;
  console.log(PhoneNumber);
  try {
    const userQuery = query(collection(db, 'users'), where('uid', '==', getAuth().currentUser.uid));
    const userSnapshot = await getDocs(userQuery);
    const userDoc = userSnapshot.docs[0]; // Assuming there is only one matching user document
    if (userDoc.data().phone === PhoneNumber){
      console.log('phone unchanged');
      res.send('New phone number similar to the current name');
      return;
    }
    const updatedUserData = {
      mail: userDoc.data().mail,
      name: userDoc.data().name,
      uid: userDoc.data().uid,
      phone: PhoneNumber,
    };

    await updateDoc(doc(db, 'users', userDoc.id), updatedUserData);

    console.log('Phone number changed');
    console.log(updatedUserData.phone);
    res.send('Phone number changed');
  } catch (error) {
    console.log(error);
    console.log('Phone number unchanged');
    res.send('Phone number unchanged');
  }
});

class User {
  constructor(name, mail, phone) {
    this.name = name;
    this.mail = mail;
    this.phone = phone;
  }

  toString() {
    return `${this.name}, ${this.mail}, ${this.phone}`;
  }
}

// Firestore data converter
const userConverter = {
  toFirestore: (user) => ({
    name: user.name,
    mail: user.mail,
    phone: user.phone,
  }),
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new User(data.name, data.mail, data.phone);
  },
};

app.post('/edit_profile', async (req, res) => {
  try {
    const user = getDoc(collection(db, 'users'));
    const userRef = User((await user).data.toString());
    console.log(userRef);
  } catch (e) {}
});

app.post('/unfollow', async (req, res) => {
  console.log(req.body)
  const unfollowedDocumentId = req.body.unfollowedUser.id;
  const currentUserUid = auth.currentUser.uid;
  const usersCollection = admin.firestore().collection('users');
  const unfollowSnapshot = await usersCollection.where('uid', '==', unfollowedDocumentId).get();

  const unfollowedUserDoc = unfollowSnapshot.docs[0];
  const unfollowedUserData = unfollowedUserDoc.data();
  const unfollowedUserUid = unfollowedUserData.uid;


  try {
    // Remove the unfollowed user from the current user's following list
    const userQuery = query(collection(db, 'users'), where('uid', '==', currentUserUid));
    const userSnapshot = await getDocs(userQuery);
    const userDocs = userSnapshot.docs;
    if (userDocs.length === 0) {
      res.status(404).send('Current user not found');
      return;
    }

    const userDoc = userDocs[0];
    const userData = userDoc.data();
    const userName=userDoc.data().name;
    const updatedFollowing = userData.following.filter((uid) => uid !== unfollowedUserUid);
    const updatedUserData = {
      ...userData,
      following: updatedFollowing.length > 0 ? updatedFollowing : [], // Check if the array is empty
    };

    await updateDoc(doc(db, 'users', userDoc.id), updatedUserData);

    // Remove the current user from the unfollowed user's followers list
    const unfollowedUserQuery = query(collection(db, 'users'), where('uid', '==', unfollowedUserUid));
    const unfollowedUserSnapshot = await getDocs(unfollowedUserQuery);
    const unfollowedUserDocs = unfollowedUserSnapshot.docs;
    if (unfollowedUserDocs.length === 0) {
      res.status(404).send('Unfollowed user not found');
      return;
    }

    const unfollowedUserDoc = unfollowedUserDocs[0];
    const unfollowedUserData = unfollowedUserDoc.data();
    const updatedFollowers = unfollowedUserData.followers.filter((uid) => uid !== currentUserUid);
    const updatedUnfollowedUserData = {
      ...unfollowedUserData,
      followers: updatedFollowers.length > 0 ? updatedFollowers : [], // Check if the array is empty
    };

    await updateDoc(doc(db, 'users', unfollowedUserDoc.id), updatedUnfollowedUserData);

    console.log(currentUserUid);
    const not = `${userName} started following you`;
    console.log(not);
    const unfollowedUserNotifications = unfollowedUserData.notifications || [];
    const updatedNotifications = unfollowedUserNotifications.filter(notification => notification !== not);

    await updateDoc(doc(db, 'users', unfollowedUserDoc.id), { notifications: updatedNotifications });











    res.send('Unfollow successful');
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to unfollow');
  }
});


class Follower {
  constructor(uid1, uid2) {
    this.follower = uid1;
    this.followed = uid2;
  }

  toString() {
    return `${this.follower} Started Following ${this.followed}`;
  }
}

app.post('/follow', async (req, res) => {
  const followed_uid = req.body['uid'];
  const currentUserUid = auth.currentUser.uid;

  try {
    const userQuery = query(collection(db, 'users'), where('uid', '==', currentUserUid));
    const userSnapshot = await getDocs(userQuery);
    const userDocs = userSnapshot.docs;
    if (userDocs.length === 0) {
      res.send('User not found');
      return;
    }

    const userDoc = userDocs[0];
    const userData = userDoc.data();

    // Update the user's following list
    const updatedFollowing = userData.following || [];
    if (!updatedFollowing.includes(followed_uid)) {
      updatedFollowing.push(followed_uid);
    }
    const updatedUserData = { ...userData, following: updatedFollowing };

    await updateDoc(doc(db, 'users', userDoc.id), updatedUserData);

    // Update the followed user's followers list and notifications array
    const followedUserQuery = query(collection(db, 'users'), where('uid', '==', followed_uid));
    const followedUserSnapshot = await getDocs(followedUserQuery);
    const followedUserDocs = followedUserSnapshot.docs;
    if (followedUserDocs.length === 0) {
      res.send('Followed user not found');
      return;
    }

    const followedUserDoc = followedUserDocs[0];
    const followedUserData = followedUserDoc.data();
    const updatedFollowers = followedUserData.followers || [];
    const updatedNotifications = followedUserData.notifications || [];

    if (!updatedFollowers.includes(currentUserUid)) {
      updatedFollowers.push(currentUserUid);
    }

    const followingUserQuery = query(collection(db, 'users'), where('uid', '==', currentUserUid));
    const followingUserSnapshot = await getDocs(followingUserQuery);
    const followingUserDocs = followingUserSnapshot.docs;
    if (followingUserDocs.length === 0) {
      res.send('Following user not found');
      return;
    }

    const followingUserDoc = followingUserDocs[0];
    const followingUserData = followingUserDoc.data();
    const followingUserName = followingUserData.name; // Assuming the user's name is stored in the 'name' field

    const notificationData = `${followingUserName} started following you`;

    if (updatedNotifications.length === 4) {
      updatedNotifications.splice(0, 1); // Remove the notification at 0th position
    }

    updatedNotifications.push(notificationData);

    const updatedFollowedUserData = { ...followedUserData, followers: updatedFollowers, notifications: updatedNotifications };

    await updateDoc(doc(db, 'users', followedUserDoc.id), updatedFollowedUserData);

    res.send('Success');
  } catch (error) {
    console.log(error);
    res.send('Error occurred');
  }
});



// show the followers list
app.get('/followers', async (req, res) => {
  try {
    const currentUserUid = getAuth().currentUser.uid;

    const userQuery = query(collection(db, 'users'), where('uid', '==', currentUserUid));
    const userSnapshot = await getDocs(userQuery);
    const userDoc = userSnapshot.docs[0];

    const followersUids = userDoc.data().followers;

    const followersQuery = query(collection(db, 'users'), where('uid', 'in', followersUids));
    const followersSnapshot = await getDocs(followersQuery);

    const followersList = followersSnapshot.docs.map((doc) => ({
      id: doc.data().uid,
      username: doc.data().username,
      name: doc.data().name,
    }));

    res.json(followersList);
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to fetch followers list');
  }
});

// show the following list
app.get('/following', async (req, res) => {
  try {
    const currentUserUid = getAuth().currentUser.uid;

    const userQuery = query(collection(db, 'users'), where('uid', '==', currentUserUid));
    const userSnapshot = await getDocs(userQuery);
    const userDoc = userSnapshot.docs[0];

    const followingUids = userDoc.data().following;

    const followingQuery = query(collection(db, 'users'), where('uid', 'in', followingUids));
    const followingSnapshot = await getDocs(followingQuery);

    const followingList = followingSnapshot.docs.map((doc) => ({
      id: doc.data().uid,
      username: doc.data().username,
      name: doc.data().name, // Add the name property
    }));

    res.json(followingList);
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to fetch following list');
  }
});

app.get('/get_stored_data', async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = getAuth().currentUser.uid;

    // Retrieve the user document that matches the userId
    const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      const { name } = userData;

      // Include the user's name in the stored data
      const response = {
        ...storedData,
        name: name
      };

      res.json(response);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error retrieving stored data:', error);
    res.status(500).send('An error occurred while retrieving the stored data');
  }
});

class Save {
  constructor(uid, pid) {
    this.uid = uid;
    this.pid = pid;
  }
  toString() { return `${this.uid} saved ${this.pid}`; }
}

//showing the saved list for the user
app.post('/returnSavedListing', async (req, res) => {
  try {
    const authId = auth.currentUser.uid;
    const userQuerySnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', authId)));

    if (userQuerySnapshot.empty) {
      console.error('User document not found');
      res.sendStatus(404);
      return;
    }
    const userDoc = userQuerySnapshot.docs[0];
    const savedListingsId = userDoc.data().savedListingForLater || [];
    let listings = [];
    for (const listingId of savedListingsId) {
      const listingQuerySnapshot = await getDocs(query(collection(db, 'listings'), where('id', '==', listingId)));
      if (!listingQuerySnapshot.empty) {
        const listingDoc = listingQuerySnapshot.docs[0];
        const listingData = listingDoc.data();
        listings.push(listingData);
      }
    }

    res.json(listings);
  } catch (error) {
    console.error('Error retrieving saved listings:', error);
    res.status(500).send('An error occurred while retrieving saved listings');
  }
});

app.post('/returnLikedListing', async (req, res) => {
  try {
    const authId = auth.currentUser.uid;
    const userQuerySnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', authId)));

    if (userQuerySnapshot.empty) {
      console.error('User document not found');
      res.sendStatus(404);
      return;
    }
    const userDoc = userQuerySnapshot.docs[0];
    const likedListingsId = userDoc.data().LikedListing || [];
    let listings = [];
    for (const listingId of likedListingsId) {
      const listingQuerySnapshot = await getDocs(query(collection(db, 'listings'), where('id', '==', listingId)));
      if (!listingQuerySnapshot.empty) {
        const listingDoc = listingQuerySnapshot.docs[0];
        const listingData = listingDoc.data();
        listings.push(listingData);
      }
    }

    res.json(listings);
  } catch (error) {
    console.error('Error retrieving saved listings:', error);
    res.status(500).send('An error occurred while retrieving saved listings');
  }
});


app.post('/getListingDetails', async (req, res) => {
  try {
    const { listingIds } = req.body;

    const authId = auth.currentUser.uid;
    const userQuerySnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', authId)));

    if (userQuerySnapshot.empty) {
      console.error('User document not found');
      res.sendStatus(404);
      return;
    }
    const listingDetails = await getDocs(query(collection(db, 'listings'), where('id', '==', listingIds)));
    console.log(listingDetails)
    res.json(listingDetails);
  } catch (error) {
    console.error('Error fetching listing details:', error);
    res.status(500).send('An error occurred while fetching listing details');
  }
});




app.post('/signOut', async (req, res) => {
  const auth = getAuth();

  try {
    await auth.signOut();
    res.status(200).send('User signed out successfully');
  } catch (error) {
    console.error('Error signing out user:', error);
    res.status(500).send('An error occurred while signing out');
  }
});

app.get('/user_listings', async (req, res) => {
  auth = getAuth();
  const userId = auth.currentUser.uid; // Assuming you have middleware to authenticate the user and populate `req.user`

  try {
    const querySnapshot = await getDocs(query(collection(db, 'listings'), where('userid', '==', userId)));
    const listings = querySnapshot.docs.map((doc) => doc.data());

    res.json(listings);
  } catch (error) {
    console.error('Error retrieving user listings:', error);
    res.status(500).send('An error occurred while retrieving user listings');
  }
});

app.get('/home_listings', async (req, res) => {
  auth = getAuth();
  const currentUserUid = auth.currentUser.uid; // Assuming you have middleware to authenticate the user and populate `req.user`

  try {
    const userQuery = query(collection(db, 'users'), where('uid', '==', currentUserUid));
    const userSnapshot = await getDocs(userQuery);
    const userDoc = userSnapshot.docs[0];
    const followingUids = userDoc.data().following;

    // Retrieve the listings of the users being followed
    const querySnapshot = await getDocs(query(collection(db, 'listings'), where('userid', 'in', followingUids)));
    const listings = querySnapshot.docs.map((doc) => doc.data());

    res.json(listings);
  } catch (error) {
    console.error('Error retrieving user listings:', error);
    res.status(500).send('An error occurred while retrieving user listings');
  }
});


app.get('/user_details', async (req, res) => {
  auth = getAuth();
  const userMail = auth.currentUser.email; // Assuming you have middleware to authenticate the user and populate `req.user`

  try {
    const querySnapshot = await getDocs(query(collection(db, 'users'), where('mail', '==', userMail)));
    const users = querySnapshot.docs.map((doc) => doc.data());

    res.json(users);
  } catch (error) {
    console.error('Error retrieving user listings:', error);
    res.status(500).send('An error occurred while retrieving user listings');
  }
});

app.get('/User/:uid', async (req, res) => {
  const { uid } = req.params; // Use req.params.uid to access the uid value
  try {
    const querySnapshot = await getDocs(query(collection(db, 'listings'), where('userid', '==', uid)));
    const listings = querySnapshot.docs.map((doc) => doc.data());

    res.json(listings);
  } catch (error) {
    console.error('Error retrieving user listings:', error);
    res.status(500).send('An error occurred while retrieving user listings');
  }
});


app.post('/change_password', async (req, res) => {
  try {
    const user = getAuth().currentUser;
    const new_password = req.body.newPassword;
    const valid_password = req.body.validNewPassword;

    console.log("new pass:", new_password);
    console.log("valid pass:", valid_password);

    if (new_password.length < 8 || !new_password.match(/[a-zA-Z]/)) {
      res.send('Password must be at least 8 characters long and contain at least one letter');
      return;
    }

    if (new_password !== valid_password) {
      res.send('Passwords not matched');
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, req.body.currentPassword);

    const isPasswordMatch = await comparePassword(user, req.body.currentPassword);
    if (isPasswordMatch) {
      reauthenticateWithCredential(user, credential)
        .then(async () => {
          // Passwords match, update the password
          await updatePassword(user, new_password);
          console.log('Password has been changed successfully');
          res.send('Password has been changed successfully');
        })
        .catch((error) => {
          console.log('Reauthentication failed:', error);
          res.status(400).json({ error: 'Reauthentication failed' });
        });
    } else {
      console.log('Incorrect current password');
      res.status(400).json({ error: 'Incorrect current password' });
    }
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});



async function comparePassword(user, enteredPassword) {
  const email = user.email;
  const password = enteredPassword;

  try {
    // Sign in the user with their email and password
    await signInWithEmailAndPassword(getAuth(), email, password);
    console.log("Passwords match!");

    // Passwords match, you can proceed with further actions
    return true;
  } catch (error) {
    console.log("Passwords do not match.");
    // Passwords do not match, handle accordingly
    return false;
  }
}

app.post('/delete_account', async (req, res) => {
  try {
    const user = getAuth().currentUser;
    const password = req.body.password;

    const isPasswordMatch = await comparePassword(user, password);
    if (isPasswordMatch) {
      const credential = EmailAuthProvider.credential(user.email, password);

      reauthenticateWithCredential(user, credential)
        .then(() => {
          // Password and reauthentication successful, delete the user
          deleteAccount(user)
            .then(() => {
              console.log('User account has been deleted successfully');
              res.send('User account has been deleted successfully');
            })
            .catch((error) => {
              console.log('Failed to delete user account:', error);
              res.status(500).json({ error: 'Failed to delete user account' });
            });
        })
        .catch((error) => {
          console.log('Reauthentication failed:', error);
          res.status(400).json({ error: 'Reauthentication failed' });
        });
    } else {
      console.log('Incorrect password');
      res.status(400).json({ error: 'Incorrect password' });
    }
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});


const deleteUser = async (uid) => {
  try {
    const usersCollection = admin.firestore().collection('users');
    const querySnapshot = await usersCollection.where('uid', '==', uid).get();
    const listingsCollection = admin.firestore().collection('listings');
    const listingSnapshot = await listingsCollection.where('userid', '==', uid).get();

    if (querySnapshot.empty) {
      console.log('User document not found');
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;

    // Delete user document
    await userDoc.ref.delete();

    // Delete associated listing documents
    if (!listingSnapshot.empty) {
      const deleteListingPromises = listingSnapshot.docs.map((listingDoc) => listingDoc.ref.delete());
      await Promise.all(deleteListingPromises);
    }

    // Remove user from followers collection of other users
    const usersSnapshot = await usersCollection.get();

    const updatePromises = [];
    usersSnapshot.forEach((userSnapshot) => {
      const userRef = userSnapshot.ref;
      const userDocData = userSnapshot.data();

      // Remove user from followers collection
      if (userDocData.followers && userDocData.followers.includes(uid)) {
        console.log('enter delete follow');
        const updatedFollowers = userDocData.followers.filter((follower) => follower !== uid);
        updatePromises.push(userRef.update({ followers: updatedFollowers }));
      }
    });

    await Promise.all(updatePromises);
    console.log('User document and associated listing documents deleted successfully');
  } catch (error) {
    console.error('Failed to delete user document:', error);
    throw error;
  }
};





async function deleteAccount(user) {
  try {
    // Get the user's UID
    const uid = user.uid;
    await deleteUser(uid);
    // Delete the user reference from the "users" collection
    // Delete the user account
    await user.delete();

    console.log('User account and reference deleted successfully');
  } catch (error) {
    console.log('Failed to delete user account:', error);
    throw error;
  }
}

app.post('/likeListing', async (req, res) => {
  try {
    const { listing, isLiked} = req.body;
    const listingId = listing.id; // Assuming the listing object has an 'id' field
    // Get the reference to the specific listing document
    const listingRef = doc(db, 'listings', listingId);
    const listinguserid=listing.userid;

    // Get the current likes count from the document
    const listingSnapshot = await getDoc(listingRef);
    const currentLikes = listingSnapshot.data().likes;
    const listingTitle = listingSnapshot.data().title;
    const authId = auth.currentUser.uid;
    const userQuerySnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', authId)));
    if (userQuerySnapshot.empty) {
      console.error('User document not found');
      res.sendStatus(404);
      return;
    }
    const userDoc = userQuerySnapshot.docs[0];
    const userName = userDoc.data().name;

    console.log('User name:', userName);
    let LikedListing = userDoc.data().LikedListing || [];
    //console.log('liked:',LikedListing,isLiked);
    if(isLiked)
    {
      // Update the 'likes' field by adding 1
      await updateDoc(listingRef, {
        likes: currentLikes + 1,

      });
      if (!LikedListing.includes(listingId)) {
        LikedListing.push(listingId);
      }
      const not = `${userName} liked your ${listingTitle}`;
      console.log(not);
      console.log(listinguserid);
      const userQuery = query(collection(db, 'users'), where('uid', '==', listinguserid));
      // console.log(listinguserid);
      const userQuerySnapshot2 = await getDocs(userQuery);
      const userDoc2 = userQuerySnapshot2.docs[0];
      const notific = userDoc2.data().notifications || [];

      if (notific.length === 4) {
        notific.splice(0, 1); // Remove the notification at 0th position
      }

      notific.push(not);

      await updateDoc(userDoc2.ref, { notifications: notific });
    }
    else {
      await updateDoc(listingRef, {

        likes: currentLikes - 1,

      });
      LikedListing = LikedListing.filter(id => id !== listingId);
      const not = `${userName} liked your ${listingTitle}`;

      const userQuery = query(collection(db, 'users'), where('uid', '==', listinguserid));
      const userQuerySnapshot2 = await getDocs(userQuery);
      const userDoc2 = userQuerySnapshot2.docs[0];
      const notific = userDoc2.data().notifications || [];

      const updatedNotifications = notific.filter(notification => notification !== not);

      await updateDoc(userDoc2.ref, { notifications: updatedNotifications });
    }
    console.log('Listing title:', listingTitle); // Print the title of the listing
    const not = `${userName} liked your ${listingTitle}`;
    console.log(not);
    const userRef = doc(db, 'users', userDoc.id);


    await updateDoc(userRef, { LikedListing });


    // Update the listing owner's notifications


    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating listing likes:', error);
    res.sendStatus(500);
  }
});


app.post('/saveListing', async (req, res) => {
  try {
    const { listingId, deleteOrSave } = req.body;

    const authId = auth.currentUser.uid;
    const userQuerySnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', authId)));
    if (userQuerySnapshot.empty) {
      console.error('User document not found');
      res.sendStatus(404);
      return;
    }
    const userDoc = userQuerySnapshot.docs[0];

    // Get the existing saved listings array or create a new one
    let savedListingForLater = userDoc.data().savedListingForLater || [];

    if (deleteOrSave === 'delete') {
      // Delete the listingId from the savedListingForLater array
      savedListingForLater = savedListingForLater.filter(id => id !== listingId);
    } else if (deleteOrSave === 'save') {
      // Add the listingId to the savedListingForLater array if it doesn't exist
      if (!savedListingForLater.includes(listingId)) {
        savedListingForLater.push(listingId);
      }
    }

    const userRef = doc(db, 'users', userDoc.id); // Create a reference to the user document
    await updateDoc(userRef, { savedListingForLater });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error saving/deleting listing:', error);
    res.sendStatus(500);
  }
});



app.get('/listing/:listingId', async (req, res) => {
  const listingId = req.params.listingId;

  try {
    const docRef = doc(db, 'listings', listingId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const listingData = docSnapshot.data();
      res.json(listingData);
    } else {
      res.status(404).send('Listing not found');
    }
  } catch (error) {
    console.error('Error retrieving listing:', error);
    res.status(500).send('An error occurred while retrieving the listing');
  }
});

app.post('/edit_listing/:listingId', async (req, res) => {
  const listingId = req.params.listingId;
  const { title, price, category, description, pictures } = req.body;

  try {
    const docRef = doc(db, 'listings', listingId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      await updateDoc(docRef, {
        title,
        price,
        category,
        description,
        pictures,
      });
      res.send('Listing updated successfully');
    } else {
      res.status(404).send('Listing not found');
    }
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).send('An error occurred while updating the listing');
  }
});

app.post('/delete_listing/:listingId', async (req, res) => {
  console.log('enter delete');
  const listingId = req.params.listingId;
  console.log(listingId);
  try {
    await deleteListing(listingId);
    console.log('Listing deleted successfully');
    res.send('Listing deleted successfully');
  } catch (error) {
    console.error('Failed to delete listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});


async function deleteListing(listingId) {
try {
  const usersCollection = admin.firestore().collection('listings');
  const querySnapshot = await usersCollection.where('id', '==', listingId).get();

  if (querySnapshot.empty) {
    console.log('Listing document not found');
    return;
  }

  const listingDoc = querySnapshot.docs[0];
  await listingDoc.ref.delete();
  console.log('Listing deleted successfully');
} catch (error) {
  console.error('Failed to delete listing:', error);
  throw error;
}
};

app.post('/get_uid', async (req, res) => {
  const user1 = getAuth().currentUser.uid;
  res.send(user1);
});

app.post('/getStatistics', async (req, res) => {
  const userId = getAuth().currentUser.uid;

  const listingQuerySnapshot = await getDocs(query(collection(db, 'listings'), where('userid', '==', userId)));

  const userQuery = query(collection(db, 'users'), where('uid', '==', userId));
  const userSnapshot = await getDocs(userQuery);
  const userDoc = userSnapshot.docs[0].data(); // Access the user document data

  let totalLikes = 0;
  let counter = 0;
  listingQuerySnapshot.forEach((doc) => {
    const listingData = doc.data();
    if (listingData.likes) {
      totalLikes += listingData.likes;
    }
    counter += 1;

  });

  const totalFollowers = userDoc.followers ? userDoc.followers.length : 0;
  const totalFollowing = userDoc.following ? userDoc.following.length : 0;
  const avgLikes = totalLikes /  counter;
  // console.log('total likes:', totalLikes);
  // console.log('total followers:', totalFollowers);
  // console.log('total following:', totalFollowing);
  // console.log('total avg:', avrgLikes);
  const stats = {
    totalLikes: totalLikes,
    followers: totalFollowers,
    following: totalFollowing,
    avgLikes: avgLikes,
  };

  res.send({ stats });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on: ${serverURL}:${port}`);
});


app.get('/get_notifications', async (req, res) => {
  try {
    const currentUserUid = getAuth().currentUser.uid;

    const userQuery = query(collection(db, 'users'), where('uid', '==', currentUserUid));
    const userSnapshot = await getDocs(userQuery);
    const userDoc = userSnapshot.docs[0];

    const notificationsList = userDoc.data().notifications;

    res.json(notificationsList);
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to fetch notifications list');
  }
});




app.post('/block-user', async (req, res) => {
  try {
    const { uid } = req.body;
    console.log('UID:', uid); // Print the UID received from the frontend

    const authId = auth.currentUser.uid;
    const userQuerySnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', authId)));
    if (userQuerySnapshot.empty) {
      console.error('User document not found');
      res.sendStatus(404);
      return;
    }
    const userDoc = userQuerySnapshot.docs[0];
    let blocked_list = userDoc.data().blocked_list || [];

    if (blocked_list.includes(uid))
    {
      console.log(uid);
      blocked_list = blocked_list.filter(id => id !== uid);
    } else {
      // Block the user
      blocked_list.push(uid);
    }

    const userRef = doc(db, 'users', userDoc.id); // Create a reference to the user document
    await updateDoc(userRef, { blocked_list: blocked_list }); // Update the blocked_list field with the modified array
    res.sendStatus(200);
  } catch (error) {
    console.error('Error blocking/unblocking user:', error);
    res.sendStatus(500);
  }
});


app.get('/check_blocked', async (req, res) => {
  try {
    const currentUserUid = getAuth().currentUser.uid;

    const userQuery = query(collection(db, 'users'), where('uid', '==', currentUserUid));
    const userSnapshot = await getDocs(userQuery);
    const userDoc = userSnapshot.docs[0];

    const blocked = userDoc.data().blocked_list;

    const blockedQuery = query(collection(db, 'users'), where('uid', 'in', blocked));
    const blockedSnapshot = await getDocs(blockedQuery);

    const blockList = blockedSnapshot.docs.map((doc) => ({
      id: doc.data().uid,
    }));

    res.json(blockList);
  } catch (error) {
    console.log(error);
    res.status(500).send('Failed to fetch following list');
  }
});



app.get('/search_listings', async (req, res) => {
  const searchTerm = req.query.search;
  console.log("enter search");
  console.log(searchTerm);

  try {
    const querySnapshot = await getDocs(collection(db, 'listings'));
    const listings = querySnapshot.docs
      .map((doc) => doc.data())
      .filter((listing) => {
        const lowerCaseTitle = listing.title.toLowerCase();
        const lowerCaseName = listing.name.toLowerCase();
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return lowerCaseTitle.includes(lowerCaseSearchTerm) || lowerCaseName.includes(lowerCaseSearchTerm);
      });

    res.json(listings);
  } catch (error) {
    console.error('Error retrieving listings:', error);
    res.status(500).send('An error occurred while retrieving listings');
  }
});
