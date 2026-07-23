import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { User } from "../models";

// These strategies are fully wired but need real OAuth app credentials to work
// end-to-end - set GOOGLE_CLIENT_ID/SECRET and FACEBOOK_CLIENT_ID/SECRET in
// .env (see .env.example). Without them the routes are skipped gracefully.

if (process.env.GOOGLE_CLIENT_ID) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/auth/google/callback",
      },
      async (_at, _rt, profile, done) => {
        try {
          let user = await User.findOne({ where: { googleId: profile.id } });
          if (!user) {
            const email = profile.emails?.[0]?.value || `${profile.id}@google.local`;
            user = await User.create({ email, googleId: profile.id, roles: ["candidate"] } as any);
          }
          done(null, user as any);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

if (process.env.FACEBOOK_CLIENT_ID) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID!,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ["id", "emails", "name"],
      },
      async (_at, _rt, profile, done) => {
        try {
          let user = await User.findOne({ where: { facebookId: profile.id } });
          if (!user) {
            const email = profile.emails?.[0]?.value || `${profile.id}@facebook.local`;
            user = await User.create({ email, facebookId: profile.id, roles: ["candidate"] } as any);
          }
          done(null, user as any);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

export default passport;
