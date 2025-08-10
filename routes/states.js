const express = require("express");
const db = require("../config/db.js");

const router = express.Router();

router.get("/:slug", async (req, res) => {
    const slug = req.params.slug;

    try{
        const [states] = await db.promise().query(
            `SELECT * FROM states WHERE slug = ?`, [slug]
        );

        const stateId = states[0].id;

        const [places] = await db.promise().query(
            `SELECT * FROM places WHERE state_id = ?`, [stateId]
        );

        res.render("pages/state", { states, places });

    } catch(err){
        console.error(err);
        req.flash('error', 'Internal Server Error!!');
        res.redirect('/');
    }
});

module.exports = router;