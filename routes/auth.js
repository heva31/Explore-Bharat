const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const db = require("../config/db");

const router = express.Router();

router.get("/signup", (req, res) => {
  res.render("pages/signup", { message: req.flash("error"), success: req.flash("success") });
});

router.post("/signup", async (req, res) => {
  const { fname, lname, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect("/signup");
  }

  try {
    const [existingUser] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      req.flash("error", "User already exists.");
      return res.redirect("/signup");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
      .promise()
      .query(
        "INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)",
        [fname, lname, email, hashedPassword]
      );

    req.flash("success", "Account created. Please log in.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong!!");
    res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("pages/login", { message: req.flash("error"), success: req.flash("success") });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {

    // check into admin table
    const [adminResult] = await db
      .promise()
      .query("SELECT * FROM admin WHERE email = ?", [email]);

    if (adminResult.length > 0) {
      const admin = adminResult[0]
      const isAdminMatch = await bcrypt.compare(password, admin.password);

      if (!isAdminMatch) {
        req.flash("error", "Invalid email or password of Admin.");
        return res.redirect("/login");
      }

      req.session.admin = {
        id: admin.id,
        name: `${admin.firstname} ${admin.lastname}`,
        email: admin.email,
        role: "admin"
      };

      req.flash("success", `Welcome Admin, ${req.session.admin.name}!!`);
      return res.redirect("/admin");
    }

    // check into users table
    const [user] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0) {
      req.flash("error", "Invalid email or password of User.");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      req.flash("error", "Invalid email or password of User.");
      return res.redirect("/login");
    }

    req.session.user = {
      id: user[0].id,
      name: user[0].firstname + user[0].lastname,
      email: user[0].email,
      role: "user"
    };

    req.flash("success", `Welcome, ${req.session.user.name}!!`);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "Login failed.");
    res.redirect("/login");
  }
});

// Google login
router.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }));

router.get("/auth/google/callback", passport.authenticate("google", { 
  successRedirect: "/auth/protected", 
  failureRedirect: "/auth/google/failure"
}));

router.get("/auth/protected", async (req, res) => {
  if(!req.user){
    req.flash("error", "You need to log in first!!");
    return res.redirect("/login");
  }
  
  const firstname = req.user.given_name;
  const lastname = req.user.family_name;
  const email = req.user.email;

  try{
    const [existingUser] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

      if (existingUser.length === 0) {
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        await db
          .promise()
          .query(
            "INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)",
            [firstname, lastname, email, hashedPassword]
        );
      }

      req.session.user = {
        id: existingUser[0].id,
        name: req.user.displayName,
        email: email,
        role: "user"
      };

    req.flash("success", `Welcome, ${req.session.user.name}!!`);
    res.redirect("/");

  } catch (err){
    console.error(err);
    req.flash("error", "Login failed.");
    res.redirect("/login");
  }
});

router.get("/auth/google/failure", (req, res) => {
  res.send("something went wrong!!");
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
});

module.exports = router;