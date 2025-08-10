const express = require('express');
const db = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [destinations] = await db.promise().query('SELECT name FROM places');
        const user = req.session.user;
        
        res.render('pages/inquiry', { destinations, user });
    } catch(err) {
        console.error(err);
        req.flash('error', 'Something went wrong while loading the page.!');
        res.redirect('/');
    }
});

router.post("/", async (req, res) => {
    const { name, email, destination, inquiryType, message } = req.body;
    const userID = req.session.user.id;

    try{
        await db
        .promise()
        .query(
            `INSERT INTO inquiries (user_id, name, email, destination, inquiry_type, message)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userID, name, email, destination, inquiryType, message]
        );

        req.flash("success", "Your inquiry has been submitted successfully!!");
        res.redirect("/inquiry");
    } catch(err){
        console.error(err);
        req.flash('error', 'Failed to submit your inquiry. Please try again.');
        res.redirect("/");
    }
});

module.exports = router;