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

        const user = await prisma.user.upsert({
          where: { email: email },
          update: { name: name, avatarUrl: avatarUrl },
          create: { email: email, name: name, avatarUrl: avatarUrl },
        });
        
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);