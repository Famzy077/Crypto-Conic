const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const avatarUrl = profile.photos[0].value;

        // Use `upsert` to find a user or create/update them in one go.
        // This is more efficient than finding and then creating.
        const user = await prisma.user.upsert({
          where: { email: email },
          update: {
            // If user exists, update their name and avatar from Google
            name: name,
            avatarUrl: avatarUrl,
          },
          create: {
            // If user does not exist, create them with all the details
            email: email,
            name: name,
            avatarUrl: avatarUrl,
            // password will be null, as configured in the schema
          },
        });
        
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);