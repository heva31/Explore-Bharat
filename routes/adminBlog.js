const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const db = require("../config/db");

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get("/addBlog", (req, res) => {
    res.render("pages/addBlog");
});

router.post("/addBlog", upload.single('thumbnail'), 
async (req, res) => {
    try {
        const { title, content } = req.body;
        const slug = title.trim().toLowerCase().replace(/\s+/g, '-');

        let thumbnailPath = '';
        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const fileName = `${slug}${ext}`;
            const finalPath = path.join(__dirname, '..', 'public', 'images', 'thumbnail', fileName);
            await fs.move(req.file.path, finalPath);
            thumbnailPath = `/images/thumbnail/${fileName}`;
        }

        await db.promise().query(
            `INSERT INTO blogs (title, slug, content, thumbnail) VALUES (?, ?, ?, ?)`,
            [title, slug, content, thumbnailPath]
        );

        req.flash('success', 'Blog post added successfully!');
        res.redirect("/admin/blogs");

    } catch(err) {
        console.error(err);
        req.flash("error", "Internal server error!!");
        res.redirect("/admin/addBlog");
    }
}); 

router.get("/blogs", async (req, res) => {
    try{
        const [blogs] = await db.promise().query(`SELECT * FROM blogs ORDER BY created_at DESC`);

        res.render("pages/adminBlogList", { blogs });
    } catch(err) {
        console.error(err);
        req.flash("error", "Internal Server Error!!");
        res.redirect("/admin");
    }
});

router.get("/editBlog/:id", async (req, res) => {
    try {
        const { id } = req.params;
        
        const [blog] = await db.promise().query(`SELECT * FROM blogs WHERE id = ?`, [id]);

        if (blog.length === 0) {
            req.flash("error", "Can't find the blog!!");
            return res.redirect("/admin/blogs");
        }

        res.render("pages/editBlog.ejs", { blog: blog[0] });
    } catch (err) {
        console.error(err);
        req.flash("error", "Error while loading the Edit page!!");
        res.redirect("/admin/blogs");
    }
});

router.post("/editBlog/:id", upload.single('thumbnail'), async (req, res) => {
    try {
        const {id} = req.params;
        const { title, content } = req.body;
        const slug = title.trim().toLowerCase().replace(/\s+/g, '-');

        const [rows] = await db.promise().query(`SELECT thumbnail FROM blogs WHERE id = ?`, [id]);
        const oldBlog = rows[0];

        let thumbnailUpdate = oldBlog.thumbnail; 

        if (req.file) {
            const ext = path.extname(req.file.originalname);
            const fileName = `${slug}${ext}`;
            const finalPath = path.join(__dirname, '..', 'public', 'images', 'thumbnail', fileName);

            await fs.move(req.file.path, finalPath);

            thumbnailUpdate = `/images/thumbnail/${fileName}`;

            if (oldBlog.thumbnail && oldBlog.thumbnail.startsWith('/images/thumbnail/')) {
                const oldThumbnailPath = path.join(__dirname, '..', 'public', oldBlog.thumbnail);
                if (await fs.pathExists(oldThumbnailPath)) {
                    await fs.remove(oldThumbnailPath);
                }
            }
        }

        await db.promise().query(
            `UPDATE blogs SET title = ?, content = ?, thumbnail = ? WHERE id = ?`,
            [title, content, thumbnailUpdate, id]
        );

        req.flash('success', 'Blog updated successfully!!');
        res.redirect("/admin/blogs");
    } catch (err) {
        console.error(err);
        req.flash("error", "Error while edit the page!!");
        res.redirect("/admin/blogs");
    }
});

router.post("/deleteBlog/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.promise().query(`SELECT thumbnail FROM blogs WHERE id = ?`, [id]);

        if (rows.length > 0){
            const blog = rows[0];
            const thumbnailPath = blog.thumbnail;

            if (thumbnailPath) {
                const fullPath = path.join(__dirname, '..', 'public', thumbnailPath);

                if (await fs.pathExists(fullPath)){
                    await fs.remove(fullPath);
                    console.log(`Deleted image: ${fullPath}`);
                }
            }
        }

        await db.promise().query(`DELETE FROM blogs WHERE id = ?`, [id]);

        req.flash("success", "Blog deleted successfully!!");
        res.redirect("/admin/blogs");
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to delete blog!!");
        res.redirect("/admin/blogs");
    }
});

module.exports = router;