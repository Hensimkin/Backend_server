import express from 'express';
import bodyParser from 'body-parser';

const port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    console.log('A new request');
    res.send('Hello from server main page');
});

app.listen(port, () => {
    console.log("Server is running on port: " + port);
});
