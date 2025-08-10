const express = require('express');
const db = require("../config/db.js");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [blogs] = await db.promise().query(`SELECT * FROM blogs ORDER BY created_at DESC`);

        res.render("pages/blog", { blogs });
    } catch (err) {
        console.error(err);
        req.flash("error", "Can't find any blogs!!");
        res.redirect("/");
    }
});

router.get("/:slug", async (req, res) => {
    try {
        const slug = req.params.slug;

        const [blog] = await db.promise().query(`SELECT * FROM blogs WHERE slug = ?`, [slug]);

        if (blog.length === 0) {
            req.flash("error", "Can't find the blog!!");
            return res.redirect("/blogs");
        }

        res.render("pages/blogDetails", { blog: blog[0] });
    } catch (err) {
        console.error(err);
        req.flash("error", "Can't find the details about this blog!!");
        res.redirect("/blogs");
    }
});

module.exports = router;