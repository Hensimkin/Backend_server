import express from 'express';

const port = process.env.PORT || 3000;
const app = express();

app.get('/', (req, res) => {
    console.log('A new request');
    res.send('Hello from server main page');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
