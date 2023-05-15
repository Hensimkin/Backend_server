import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const port = process.env.PORT || 5000;
const app = express();
app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Add this line to parse JSON requests


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
        res.send('Sign in successful');
    }

});

app.post('/post_email', async (req, res) => {
    let { email } = req.body;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email))
        res.send('Please enter a valid email');
    else
        res.send('Email received'); // Add this line to send a response back to the client
    console.log(email);
});

app.post('/post_password', async (req, res) => {
    let { password } = req.body;
    if (password.length < 8)
        res.send('Password must be at least 8 characters long');
    else
        res.send('Password received'); // Add this line to send a response back to the client
    console.log(password);

});

app.post('/post_phoneNumber', async (req, res) => {
    let { phoneNumber } = req.body;
    if (phoneNumber.length !== 10)
        res.send('Phone number must be at 10 characters long');

    console.log(phoneNumber)
});

app.post('/post_phone_number', (req, res) => {
    const { phoneNumber } = req.body;
    const parsedPhoneNumber = phoneUtil.parse(phoneNumber);
    if (!parsedPhoneNumber.getCountryCode()) {
        res.status(400).send('Please enter a phone number with a country code.');
        return;
    }
    const formattedPhoneNumber = phoneUtil.format(parsedPhoneNumber, PhoneNumberFormat.INTERNATIONAL);
    res.send(`Your phone number is ${formattedPhoneNumber}.`);
});


app.post('/post_birthdate', async (req, res) => {
    const today = new Date();
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

});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
