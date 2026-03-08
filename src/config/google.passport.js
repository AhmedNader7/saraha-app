import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "../config/index.js";
import { findOrCreateGoogleUser } from "../services/auth.service.js";

/**
 * Configure and export Google OAuth Strategy
 */
export function configureGoogleStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user
          const user = await findOrCreateGoogleUser(profile);
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const User = (await import("../DB/models/user/user.model.js")).default;
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export default { configureGoogleStrategy };
