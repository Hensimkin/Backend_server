const express = require('express');
const app = express();

app.get('/api', (req, res) => {
    res.send('Hello from the backend server!');
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
