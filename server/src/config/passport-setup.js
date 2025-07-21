const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback', // Must match the one in Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      // This function is called after the user grants permission
      try {
        const email = profile.emails[0].value;

        // Find or create a user in your database
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          // If user doesn't exist, create them.
          // Note: The password field will be null for OAuth users.
          user = await prisma.user.create({
            data: {
              email: email,
              // to allow the password field to be nullable.
              password: null, 
            },
          });
        }
        
        // Pass the user object to the next step
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);