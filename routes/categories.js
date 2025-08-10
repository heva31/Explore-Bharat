const express = require("express");
const db = require("../config/db.js");

const router = express.Router();

router.get("/:slug", async (req, res) => {
    const slug = req.params.slug;

    const query = `SELECT p.*, s.name as state_name
    FROM places as p
    JOIN categories as c ON p.category_id = c.id
    LEFT JOIN states as s ON p.state_id = s.id
    WHERE c.slug = ?`;

    try {
        const [ places ] = await db.promise().query(query, [slug]);

        if (places.length === 0) {
            req.flash("error", `No Places found for the "${slug}" category!!`);
            return res.redirect("/");
        }

        res.render(`pages/${slug}`, { places });
    } catch(err) {
        console.error(err);
        req.flash('error', 'Internal Server Error!!');
        res.redirect('/');
    }
});

module.exports = router;