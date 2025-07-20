const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Import  route files ---
const authRoutes = require('./src/routes/auth.routes');
const portfolioRoutes = require('./src/routes/portfolio.routes');

const app = express();
const PORT = process.env.PORT || 5001;
// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);

app.get('/', (req, res) => {
    res.send('<h1>Crypto Portfolio Backend is Running!</h1>');
});

app.listen(PORT, () => {
    console.log(`Crypto server is listening on http://localhost:${PORT}`);
});
