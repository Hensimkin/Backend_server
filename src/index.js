import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as serviceAccount from './config/server-firebase-keys.json' assert { type: 'json' };
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { firebaseConfig } from './config/firebase-config.js';
import { collection, addDoc, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword,fetchSignInMethodsForEmail,sendEmailVerification, sendPasswordResetEmail } from 'firebase/auth'
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

async function checkEmailInUse(email) {
    try {
        const methods = await fetchSignInMethodsForEmail(getAuth(),email);
        return methods.length > 0; // Returns true if email is already in use
    } catch (error) {
        console.error('Error checking email:', error);
        throw error;
    }
}


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
let fullName = null;
let date = null;
let mail = null;
let pass = null;
let phone = null;
let storedData={};

// Profile


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
        await signInWithEmailAndPassword(auth, email, password);

        if (!auth.currentUser.emailVerified) {
            console.log("Need to verify email");
            res.send('You need to verify your email');
        } else {
            console.log('Baruch Haba Ya Malshin!' + auth.currentUser.email.toString());
            console.log('Transfer to Home page');
            res.send('Welcome !');
        }
    } catch (error) {
        console.log("Incorrect details");
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
    }
    else
    {
        try {
            const isEmailInUse = await checkEmailInUse(email);

            if (isEmailInUse) {
                res.send('Email is already in use');
            } else
            {
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
    }
    else
    {
        try {
            const isEmailInUse = await checkEmailInUse(email);

            if (isEmailInUse) {
                sendPasswordResetEmail(auth, email)
                    .then(() => {
                        // Password reset email sent successfully
                        console.log("Password reset email sent");
                        res.send('Password reset email sent');
                    })
                    .catch(function(error) {
                        // An error occurred while sending the password reset email
                        console.error(error);
                    });
            }
            else
            {
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
            mail: mail,
            password: pass,
        };
        try
        {
            const docRef = await createUserWithEmailAndPassword(auth, user.mail, user.password);
            const userObj = docRef.user;
            try {
                console.log('sending mail');
                await sendEmailVerification(userObj);
                console.log("Email verification sent");
            }
            catch (error) {
                console.error("Error sending email verification:", error);
            }

            console.log('Transfer to Home Page');
            res.send('yes');
        }

        catch (e)
        {
            if (e.code === 'auth/email-already-in-use') {
                // Handle the case where the email is already in use
                console.log('Email is already in use. Please choose a different email.');
                res.send('Email already in use');
            }
            else
                console.error("Error adding document: ", e);
        }


    }
    else {

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
    storedData.pictures = req.files.map(file => file.filename);
    console.log(storedData);
    console.log(storage);
    res.send('Pictures received');
});

app.get('/get_stored_data', (req, res) => {
    res.json(storedData);
});


app.post('/post_all', async (req, res) => {
    const { title, price, category, description } = req.body;
    //const pictures = req.files.map(file => file.filename);

    storedData.title = title;
    storedData.price = price;
    storedData.category = category;
    storedData.description = description;
    //storedData.pictures = pictures;
    console.log(storedData);
    await setDoc(doc(db, 'products', 'listed-items' ), {
        title: title,
        price: price,
        category: category,
        description: description,
    });
    console.log(db.toJSON());
    res.send('Data received');
});

// Profile
app.post('/edit_name', async (req, res) => {
    const {FullName} = req.body;
    console.log(FullName);
    res.send("Name changed");
});

app.post('/edit_phone_number', async (req, res) => {
    const {PhoneNumber} = req.body;
    console.log(PhoneNumber);
    res.send("Phone number changed");
});


const docRef = doc(db, "products", "listed-items");
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
} else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
}
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
