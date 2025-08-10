const express = require('express');
const db = require("../config/db");

const router = express.Router();

router.get("/:slug", async (req, res) => {
    const slug = req.params.slug;

    try {
        
        const [places] = await db.promise().query(`SELECT * FROM places WHERE slug = ?`, [slug]);

        if (places.length === 0) {
            req.flash("error", "Place not Found!!");
            return res.redirect("/");
        }

        const place = places[0];

        const gallary = await db.promise().query(`SELECT id, image_path FROM place_images WHERE place_id = ?`, [place.id]);

        const hotels = await db.promise().query(`SELECT name, image_path, hotel_link FROM place_hotels WHERE place_id = ?`, [place.id]);

        const guides = await db.promise().query(`SELECT name, mobile FROM place_guides WHERE place_id = ?`, [place.id]);

        const [reviews] = await db.promise().query(`
            SELECT r.*, CONCAT(u.firstname, ' ', u.lastname) AS username
            FROM reviews AS r
            JOIN users AS u ON r.user_id = u.id
            WHERE r.place_id = ?
            ORDER BY r.created_at DESC
          `, [place.id]);

        res.render("pages/place", { place: {
            id: place.id,
            name: place.name,
            headerImage: place.banner_image,
            history: place.history,
            attractions: place.attractions,
            timings: place.timings,
            road_transport: place.road_transport,
            train_transport: place.train_transport,
            air_transport: place.air_transport,
            map_embed: place.map_embed,
            gallary: gallary[0],
            hotels: hotels[0],
            guides: guides[0],
            reviews: reviews
        }});

    } catch (err) {
        console.error("Error fetching place:", err);
        req.flash("error", "Internal Server Error!!");
        res.redirect("/");
    }
});

module.exports = router;