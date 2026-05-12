const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const { readDB, writeDB } = require("../models/db");

const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const db = readDB();
        if (!db.users) db.users = [];

        let user = db.users.find((u) => u.googleId === profile.id);

        if (!user) {
          const roleMap = {
            "gleshellemae.hagosojos@sorsu.edu.ph": "admin",
            "jprof801@gmail.com": "professor",
          };

          const email = profile.emails[0].value;

          user = {
            id: "usr_" + Date.now(),
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            avatar: profile.photos[0]?.value || null,
            role: roleMap[email] || "teacher",
            createdAt: new Date().toISOString(),
          };
          db.users.push(user);
          writeDB(db);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failed" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    const user = encodeURIComponent(JSON.stringify({
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    }));
   res.redirect(`http://127.0.0.1:5500/index.html?token=${token}&user=${user}`);
  }
);

router.get("/failed", (req, res) => {
  res.status(401).json({ message: "Google authentication failed" });
});

router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

module.exports = router;
module.exports.verifyToken = verifyToken;
