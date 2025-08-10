const express = require("express");
const db = require("../config/db.js");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const query = req.query.q.trim().toLowerCase();

        if(!query) {
            req.flash('error', 'Please enter a search term.');
            return res.redirect('/');
        }
        
        const searchQuery = `
        SELECT * FROM places
        WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?`;

        const [results] = await db.promise().query(searchQuery, [`%${query}%`, `%${query}%`]);

        if(results.length > 0) {
            res.render("pages/userSearchPage", { places: results, query });
        }
        else {
            req.flash("error", "No results found for your search!!");
            res.render("pages/userSearchPage", { places: [], query });
        }
    }catch(err) {
        console.error(err);
        req.flash('error', 'Something went wrong. Please try again later.');
        res.redirect('/');
    }
});

module.exports = router;