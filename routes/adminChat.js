const express = require('express');
const db = require("../config/db.js");

const router = express.Router();

router.get("/chats", async (req, res) => {
    try {
        const [users] = await db.promise().query(`
            SELECT DISTINCT u.id, CONCAT(u.firstname, u.lastname) as name, u.email
            FROM users as u
            JOIN chats as c ON u.id = c.user_id
        `);

        res.render("pages/adminChatList", { users });
    } catch(err) {
        console.error("Error fetching chat users: ", err);
        req.flash("error", "Internal Server Error!!");  
        res.redirect("/admin");
    }
});

router.get("/chat/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const [messages] = await db.promise().query(`
            SELECT * FROM chats
            WHERE user_id = ?
            ORDER BY created_at ASC
        `, [userId]);

        const [user] = await db.promise().query(`SELECT id, CONCAT(firstname, lastname) as name FROM users WHERE id = ?`, [userId]);

        res.render("pages/adminChat", { user: user[0], messages });
    } catch (err) {
        console.error("Error loading user chat: ", err);
        req.flash("error", "Internal Server Error!!");
        res.redirect("/admin/chat-users");
    }
});

router.post("/chat/send", async (req, res) => {
    const { userId, message } = req.body;
    const adminId = req.session.admin.id;

    try {
        await db.promise().query(`
            INSERT INTO chats (user_id, admin_id, sender, message)
            VALUES (?, ?, 'admin', ?)
        `, [userId, adminId, message]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error sending admin message:', err);
        req.flash("error", "Internal Server Error!!");
        res.redirect("/admin/chat-users");
    }
});

router.get("/chat/messages/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {

        await db.promise().query(
            "UPDATE chats SET is_read = 1 WHERE user_id = ? AND sender = 'user' AND is_read = 0",
            [userId]
        );

        const [messages] = await db.promise().query(`SELECT * FROM chats WHERE user_id = ? ORDER BY created_at ASC`, 
            [userId]
        );

        res.json({ success: true, messages });
    } catch (err) {
        console.error("Error fetching admin messages:", err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;