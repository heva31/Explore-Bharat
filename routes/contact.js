const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

router.get("/", (req, res) => {
    res.render("pages/contact");
});

router.post("/", async (req, res) => {
    const { name, email, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAILID,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: email,
        to: process.env.EMAILID,
        subject: `New Contact Form submission from ${name}`,
        html: `
            <h3> Contact Details </h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong><br>${message}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        req.flash("success", "Thanks for Contacting us!! We'll get back to you soon!!");
        res.render("pages/contact");
    }
    catch(err){
        console.error("Error while sending mail: ", err);
        req.flash("error", "Failed to send message. Try again later.");
        res.render("pages/contact");
    }
});

module.exports = router;