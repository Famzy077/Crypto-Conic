const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000

app.use('/', (req, res) => {
    res.send("Hello World")
})

app.listen(PORT, () => {
    console.log(`App is running on: ${PORT}`)
});