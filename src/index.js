import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";

const port = process.env.PORT || 3000;
const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     console.log('A new request');
//     res.send('Hello from server main page');
// });

// app.listen(port, () => {
//     console.log(`Server is running on port: ${port}`);
// });


// app.listen(port, '0.0.0.0', () => {
//     console.log(`Server is running on port: ${port}`);
// });



app.get('/', (req, res) => {
    res.send('Hello from backend server!');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});