const express = require('express');
const db = require("../config/db.js");

const router = express.Router();

router.get("/", (req, res) => {
    const userId = req.session.user.id;

    res.render("pages/chat", { userId });
});

router.post("/send", async (req, res) => {
    const { user_id, admin_id, sender, message } = req.body;

    const query = `INSERT INTO chats (user_id, admin_id, sender, message) VALUES (?, ?, ?, ?)`;

    try { 
        await db.promise().query(query, [user_id, admin_id, sender, message]);

        res.json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        console.error("Error sending message: ", err);
        req.flash("error", "Internal Server Error!!");
        return res.redirect(`/chat/${user_id}`);
    }
});

router.get("/:userId", async (req, res) => {
    const { userId } = req.params;

    const sql = `SELECT * FROM chats WHERE user_id = ? ORDER BY created_at ASC`;

    try {
        await db.promise().query(`
            UPDATE chats
            SET is_read = 1
            WHERE user_id = ? AND sender = 'admin'
        `, [userId]);

        const [results] = await db.promise().query(sql, [userId]);
        
        res.json({ chats: results });
    } catch (err) {
        console.error("Error fetching chats:", err);
        req.flash("error", "Internal Server Error!!");
        return res.redirect(`/chat`);
    }
});

module.exports = router;