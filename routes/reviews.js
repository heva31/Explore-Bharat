const express = require("express");
const db = require("../config/db.js");

const router = express.Router();

router.post("/:placeId/reviews", async (req, res) => {
    const { placeId } = req.params;
    const review = req.body.review;
    const rating = review.rating;
    const comment = review.comment;
    const userId = req.session.user.id;

    try {
        const [[placeRow]] = await db.promise().query(`SELECT slug FROM places WHERE id = ?`, [placeId]);

        await db.promise().query(`
            INSERT INTO reviews (place_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`,
            [ placeId, userId, rating, comment ]
        );

        req.flash("success", "Review added successfully.");
        res.redirect(`/places/${placeRow.slug}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "An error occurred while adding the review.");
        res.redirect(`/places/${placeRow.slug}`);
    }
});

router.post("/:placeId/reviews/:reviewId", async (req, res) => {
    const { placeId, reviewId } = req.params;
    const userId = req.session.user.id;

    try {
        const [[placeRow]] = await db.promise().query(`SELECT slug FROM places WHERE id = ?`, [placeId]);

        const [review] = await db.promise().query(`
            SELECT * FROM reviews WHERE id = ? AND user_id = ?`,
            [ reviewId, userId ]
        );

        if (review.length > 0){
            await db.promise().query(`
                DELETE FROM reviews WHERE id = ?`, [reviewId]
            );
        }
        req.flash("success", "Review deleted successfully.");
        res.redirect(`/places/${placeRow.slug}`);
    } catch (err) {
        console.error(err);
        req.flash("error", "An error occurred while deleting the review.");
        res.redirect(`/places/${placeRow.slug}`);
    }
});

module.exports = router;