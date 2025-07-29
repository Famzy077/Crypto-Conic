#Cr yptoCronic - Full-Stack Portfolio Tracker
CryptoCronic is a modern, full-stack web application designed to help cryptocurrency enthusiasts track their investments, view real-time market data, and stay updated with the latest news in the crypto space.

This application features a public-facing section for general market data and a private, secure dashboard for personalized portfolio management.



✨ Features
Real-Time Market Data: View a live-updating list of the top cryptocurrencies, including price, market cap, and 24h change, powered by the CoinCap API.

Detailed Coin View: Click on any cryptocurrency to see more detailed information and historical data.

Crypto News Feed: A dedicated page displaying the latest news from the world of cryptocurrency.

Secure User Authentication: Users can register and log in using a traditional email/password system or through a secure Google OAuth 2.0 flow. Authentication is handled with JSON Web Tokens (JWT).

#Personalized Portfolio Management:

Authenticated users can add their crypto holdings (e.g., "I own 0.5 BTC at a buy price of $30,000").

The dashboard automatically calculates the current value of each holding and the total portfolio value.

Users can view their profit/loss for each asset.

Holdings can be easily deleted.

Personal Profile: Users can view their profile information, including their name and avatar, which is automatically fetched when signing in with Google.

🛠️ Tech Stack
This project is a full-stack application built with a modern, robust, and scalable technology stack.

Frontend (Client)
Framework: Next.js (with App Router)

Language: TypeScript

Styling: Tailwind CSS

State Management: React Context API

Data Fetching: Axios

UI Components: Headless UI

Form Validation: Yup

Notifications: React Hot Toast

Backend (Server)
Framework: Node.js & Express.js

Language: JavaScript

Database: PostgreSQL (hosted on Neon)

ORM: Prisma

Authentication: JSON Web Tokens (JWT), Passport.js for Google OAuth

Password Hashing: Bcrypt.js

🚀 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js (v18 or later)

npm or yarn

A PostgreSQL database (you can set one up for free on Neon)

1. Server Setup
# Clone the repository
```git clone https://github.com/your-username/your-repo-name.git```

# Navigate to the server directory
cd your-repo-name/server

# Install dependencies
```npm install```

# Create a .env file in the /server directory and add the following:
```DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_super_secret_jwt_key"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

# Run database migrations
```npx prisma migrate dev```

# Start the server
```npm start```

2. Client Setup
# Navigate to the client directory from the root
```cd ../client```

# Install dependencies
```npm install```

# Create a .env.local file in the /client directory and add the following:
```NEXT_PUBLIC_API_URL="http://localhost:8000" # Or your deployed backend URL```

# Start the development server
```npm run dev```

```Open http://localhost:3000 in your browser to see the result.```

📝 API Endpoints
All portfolio and user routes are protected and require a valid JWT Bearer token.

```POST /api/auth/register: Create a new user.
POST /api/auth/login: Log in a user and return a JWT.
GET /api/auth/google: Initiate Google OAuth login.
GET /api/auth/me: Get the logged-in user's profile information.
GET /api/portfolio: Get the logged-in user's crypto holdings.
POST /api/portfolio/holdings: Add a new crypto holding.
DELETE /api/portfolio/holdings/:id: Remove a holding from the portfolio.
```