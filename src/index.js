import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import multer from 'multer';

const port = process.env.PORT || 5000;
const app = express();
app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Add this line to parse JSON requests

let dateValid = false;
let emailValid = false;
let passwordValid = false;

app.get('/', (req, res) => {
    console.log('A new request');
    res.send('Hello from server main page');
});

app.post('/post_signin', async (req, res) => {
    let { email, password } = req.body.credentials;
    console.log(email);
    console.log(password);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email) || password.length < 8) {
        res.send('Email or password is invalid');
    } else {

        res.send('Welcome Back!');
    }

});


app.post('/post_email', async (req, res) => {
    let { email } = req.body;
    emailValid = false;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email))
        res.send('Please enter a valid email');
    else {
        emailValid = true;
        res.send('Email received'); // Add this line to send a response back to the client
    }
    console.log(email);
});

app.post('/post_password', async (req, res) => {
    let { password } = req.body;
    passwordValid = false;
    if (password.length < 8)
        res.send('Password must be at least 8 characters long');
    else if (!password.match(/[a-zA-Z]/)) {
        res.send('Password must contain at least one letter');
    }
    else {
        passwordValid = true;
        res.send('Password received'); // Add this line to send a response back to the client
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

    }
    else {
        dateValid = true;
        res.send('date received');
    }
});

app.post('/post_approve', async (req, res) => {

    if(passwordValid  && emailValid  && dateValid )
    {
        console.log('Transfer to Home Page')
        res.send('yes')
    }
    else {
        console.log('not valid')
        res.send('no')
    }




});

app.post('/post_title', async (req, res) => {
    let { title } = req.body;
    console.log(title);
    res.send('title received'); // Add this line to send a response back to the client
});

app.post('/post_price', async (req, res) => {
    let { price } = req.body;
    console.log(price);
    res.send('price received'); // Add this line to send a response back to the client
});

app.post('/post_category', async (req, res) => {
    let { category } = req.body;
    console.log(category);
    res.send('category received'); // Add this line to send a response back to the client
});

app.post('/post_description', async (req, res) => {
    let { description } = req.body;
    console.log(description);
    res.send('title received'); // Add this line to send a response back to the client
});


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

app.post('/post_pictures', upload.array('pictures'), async (req, res) => {
    // The uploaded pictures are available in req.files array
    console.log("picture");
    console.log(req.files);

    // You can process the uploaded pictures here

    res.send('Pictures received'); // Send a response back to the client
});
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
