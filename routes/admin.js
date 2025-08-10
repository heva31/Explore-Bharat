const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const db = require("../config/db");

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get("/", (req, res) => {
    const query = `SELECT * FROM inquiries ORDER BY created_at DESC`;

    db.query(query, (err, results) => {
        if(err){
            console.error("Error while fatching data!!", err);
            return res.status(500).send("Internal Server Error!!");
        }
        res.render("pages/adminDashboard", { inquiries: results });
    });
});

router.get("/addPlace", async (req, res) => {
    try{
        const [states] = await db.promise().query("SELECT * FROM states");
        const [categories] = await db.promise().query("SELECT * FROM categories");

        res.render("pages/addPlace", { states, categories });
    } catch(err) {
        console.error(err);
        req.flash('error', 'Something went wrong while loading the page.!');
        res.redirect('/');
    }
});

router.post("/addPlace", upload.fields([
    { name: 'banner_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 20 },
    { name: 'hotel_images', maxCount: 20 },
    { name: "category_page_image", maxCount: 1},
    { name: "state_page_image", maxCount: 1}
]), async (req, res) => {
    try {
        const { name, state_id, category_id, gmap_name, history, attractions, timings, road_transport, 
            train_transport, air_transport, hotel_names, hotel_links, guide_names, guide_mobiles, description
        } = req.body;

        // slug name create
        const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

        // create folder name
        const folderName = slug;
        const folderPath = path.join(__dirname, '..', 'public', 'images', folderName);

        // check the folder is exists or not
        await fs.ensureDir(folderPath);

        // save banner image
        let bannerImagePath = '';
        if (req.files['banner_image']) {
            const bannerFile = req.files['banner_image'][0];
            const ext = path.extname(bannerFile.originalname);
            const bannerFileName = `banner${ext}`;
            const finalBannerPath = path.join(folderPath, bannerFileName);

            await fs.move(bannerFile.path, finalBannerPath);
            bannerImagePath = `/images/${folderName}/${bannerFileName}`;
        }

        // save gallary images
        let galleryImagePaths = [];
        if (req.files['gallery_images']) {
            for (let i = 0; i < req.files['gallery_images'].length; i++) {
                const galleryFile = req.files['gallery_images'][i];
                const ext = path.extname(galleryFile.originalname);
                const galleryFileName = `gallery_${i + 1}${ext}`;
                const finalGalleryPath = path.join(folderPath, galleryFileName);

                await fs.move(galleryFile.path, finalGalleryPath);
                galleryImagePaths.push(`/images/${folderName}/${galleryFileName}`);
            }
        }

        // save category page image
        let categoryImgPath = '';
        if (req.files['category_page_image']) {
            const imgFile = req.files['category_page_image'][0];
            const ext = path.extname(imgFile.originalname);
            const imgFileName = `categoryPageImg${ext}`;
            const finalImgPath = path.join(folderPath, imgFileName);

            await fs.move(imgFile.path, finalImgPath);
            categoryImgPath = `/images/${folderName}/${imgFileName}`;
        }

        // save state page image
        let stateImgPath = '';
        if (req.files['state_page_image']) {
            const imgFile = req.files['state_page_image'][0];
            const ext = path.extname(imgFile.originalname);
            const imgFileName = `statePageImg${ext}`;
            const finalImgPath = path.join(folderPath, imgFileName);

            await fs.move(imgFile.path, finalImgPath);
            stateImgPath = `/images/${folderName}/${imgFileName}`;
        }

        // save hotel images
        let hotelImagePaths = [];
        if (req.files['hotel_images']) {
            for (let i = 0; i < req.files['hotel_images'].length; i++) {
                const hotelFile = req.files['hotel_images'][i];
                const ext = path.extname(hotelFile.originalname);
                const hotelFileName = `hotel_${i + 1}${ext}`;
                const finalHotelPath = path.join(folderPath, hotelFileName);

                await fs.move(hotelFile.path, finalHotelPath);
                hotelImagePaths.push(`/images/${folderName}/${hotelFileName}`);
            }
        }

        // Google map embed link generate
        const mapLink = `https://maps.google.com/maps?width=400&height=400&hl=en&q=${encodeURIComponent(gmap_name)}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;

        // Insert place details into Place table
        const placeInsertQuery = `
            INSERT INTO places 
            (name, slug, state_id, category_id, banner_image, history, attractions, timings, road_transport, train_transport, air_transport, map_embed, category_page_image, description, state_page_image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [placeResult] = await db.promise().query(placeInsertQuery, [
            name,
            slug,
            state_id,
            category_id,
            bannerImagePath,
            history,
            attractions,
            timings,
            road_transport,
            train_transport,
            air_transport,
            mapLink,
            categoryImgPath,
            description,
            stateImgPath
        ]);

        const placeId = placeResult.insertId;

        // inserting gallary images data into db
        for (const imgPath of galleryImagePaths){
            await db.promise().query(
                `INSERT INTO place_images (place_id, image_path) VALUES (?, ?)`, 
                [placeId, imgPath]
            );
        }

        // inserting hotel details into db
        const hotelNamesArray = Array.isArray(hotel_names) ? hotel_names : [hotel_names];
        const hotelLinksArray = Array.isArray(hotel_links) ? hotel_links : [hotel_links];

        for (let i = 0; i < hotelNamesArray.length; i++) {
            await db.promise().query(
                `INSERT INTO place_hotels (place_id, name, image_path, hotel_link) VALUES (?, ?, ?, ?)`,
                [placeId, hotelNamesArray[i], hotelImagePaths[i], hotelLinksArray[i]]
            );
        }

        // inserting guides details into db
        const guideNamesArray = Array.isArray(guide_names) ? guide_names : [guide_names];
        const guideMobilesArray = Array.isArray(guide_mobiles) ? guide_mobiles : [guide_mobiles];

        for (let i = 0; i < guideNamesArray.length; i++) {
            await db.promise().query(
                `INSERT INTO place_guides (place_id, name, mobile) VALUES (?, ?, ?)`,
                [placeId, guideNamesArray[i], guideMobilesArray[i]]
            );
        }

        req.flash("success", "New Place added successfully!!");
        res.redirect("/admin/addPlace");
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/admin/addPlace');
    }
});

// List all places for Manage Place page
router.get("/places", async (req, res) => {
    try {
        const [places] = await db.promise().query(
            `SELECT p.*, s.name as state_name, c.name as category_name
            FROM places as p
            JOIN states as s ON p.state_id = s.id
            JOIN categories as c ON p.category_id = c.id
            ORDER BY p.id`
        );

        res.render("pages/adminPlaces", { places });
    } catch(err) {
        console.error(err);
        req.flash('error', 'Something went wrong while fetching places.');
        res.redirect('/admin');
    }
});

router.get("/editPlace/:id", async (req, res) => {
    const placeId = req.params.id;

    try {
        const [places] = await db.promise().query(
            `SELECT * FROM places WHERE id = ?`, [placeId]
        );

        if(places.length === 0){
            req.flash('error', 'Places not found!!');
            return res.redirect('/admin/places');
        }

        const [states] = await db.promise().query(`SELECT * FROM states`);
        const [categories] = await db.promise().query(`SELECT * FROM categories`);

        const [gallary] = await db.promise().query(
            `SELECT * FROM place_images WHERE place_id = ?`, [placeId]
        );
        const [hotels] = await db.promise().query(
            `SELECT * FROM place_hotels WHERE place_id = ?`, [placeId]
        );
        const [guides] = await db.promise().query(
            `SELECT * FROM place_guides WHERE place_id = ?`, [placeId]
        );

        res.render("pages/editPlace", { place: places[0], states, categories, gallary, hotels, guides });
    } catch(err) {
        console.error(err);
        req.flash('error', 'Internal server error!!');
        res.redirect('/admin/places');
    }
});

router.post('/editPlace/:id', upload.fields([
    { name: 'banner_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 20 },
    { name: 'hotel_images', maxCount: 20 },
    { name: 'category_page_image', maxCount: 1 },
    { name: 'state_page_image', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, state_id, category_id, history, attractions, timings, road_transport,
            train_transport, air_transport, hotel_names, hotel_links, guide_names, guide_mobiles, description
        } = req.body;

        const placeId = req.params.id;
        const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
        const folderName = slug;
        const folderPath = path.join(__dirname, '..', 'public', 'images', folderName);

        await fs.ensureDir(folderPath);

        // Fetch the current place details (existing images)
        const [placeDetails] = await db.promise().query(`SELECT * FROM places WHERE id = ?`, [placeId]);

        // Handle banner image
        let bannerImagePath = placeDetails.banner_image || '';
        if (req.files['banner_image']) {
            const bannerFile = req.files['banner_image'][0];
            const ext = path.extname(bannerFile.originalname);
            const bannerFileName = `banner${ext}`;
            const finalBannerPath = path.join(folderPath, bannerFileName);

            await fs.move(bannerFile.path, finalBannerPath);
            bannerImagePath = `/images/${folderName}/${bannerFileName}`;

            // Delete the old banner image if it's being replaced
            if (placeDetails.banner_image && placeDetails.banner_image !== bannerImagePath) {
                const oldBannerPath = path.join(__dirname, '..', 'public', placeDetails.banner_image);
                if (await fs.pathExists(oldBannerPath)) {
                    await fs.remove(oldBannerPath);
                }
            }
        }

        // Handle gallery images
        let galleryImagePaths = req.body.existing_gallery_images || [];
        if (req.files['gallery_images']) {
            galleryImagePaths = [];
            for (let i = 0; i < req.files['gallery_images'].length; i++) {
                const galleryFile = req.files['gallery_images'][i];
                const ext = path.extname(galleryFile.originalname);
                const galleryFileName = `gallery_${i + 1}${ext}`;
                const finalGalleryPath = path.join(folderPath, galleryFileName);

                await fs.move(galleryFile.path, finalGalleryPath);
                galleryImagePaths.push(`/images/${folderName}/${galleryFileName}`);
            }
        }

        // Handle category page image
        let categoryImgPath = placeDetails.category_page_image || '';
        if (req.files['category_page_image']) {
            const imgFile = req.files['category_page_image'][0];
            const ext = path.extname(imgFile.originalname);
            const imgFileName = `categoryPageImg${ext}`;
            const finalImgPath = path.join(folderPath, imgFileName);

            await fs.move(imgFile.path, finalImgPath);
            categoryImgPath = `/images/${folderName}/${imgFileName}`;

            // Delete old category image if replaced
            if (placeDetails.category_page_image && placeDetails.category_page_image !== categoryImgPath) {
                const oldCategoryPath = path.join(__dirname, '..', 'public', placeDetails.category_page_image);
                if (await fs.pathExists(oldCategoryPath)) {
                    await fs.remove(oldCategoryPath);
                }
            }
        }

        // Handle state page image
        let stateImgPath = placeDetails.state_page_image || '';
        if (req.files['state_page_image']) {
            const imgFile = req.files['state_page_image'][0];
            const ext = path.extname(imgFile.originalname);
            const imgFileName = `statePageImg${ext}`;
            const finalImgPath = path.join(folderPath, imgFileName);

            await fs.move(imgFile.path, finalImgPath);
            stateImgPath = `/images/${folderName}/${imgFileName}`;

            // Delete old state page image if replaced
            if (placeDetails.state_page_image && placeDetails.state_page_image !== stateImgPath) {
                const oldStatePath = path.join(__dirname, '..', 'public', placeDetails.state_page_image);
                if (await fs.pathExists(oldStatePath)) {
                    await fs.remove(oldStatePath);
                }
            }
        }

        // Handle hotel images
        let hotelImagePaths = req.body.existing_hotel_images || [];
        if (req.files['hotel_images']) {
            hotelImagePaths = [];
            for (let i = 0; i < req.files['hotel_images'].length; i++) {
                const hotelFile = req.files['hotel_images'][i];
                const ext = path.extname(hotelFile.originalname);
                const hotelFileName = `hotel_${i + 1}${ext}`;
                const finalHotelPath = path.join(folderPath, hotelFileName);

                await fs.move(hotelFile.path, finalHotelPath);
                hotelImagePaths.push(`/images/${folderName}/${hotelFileName}`);
            }
        }

        // Update place details in the database
        const updatePlaceQuery = `
            UPDATE places SET
            name = ?, slug = ?, state_id = ?, category_id = ?, banner_image = ?, history = ?, 
            attractions = ?, timings = ?, road_transport = ?, train_transport = ?, air_transport = ?, 
            category_page_image = ?, description = ?, state_page_image = ? 
            WHERE id = ?
        `;
        await db.promise().query(updatePlaceQuery, [
            name, slug, state_id, category_id, bannerImagePath, history, attractions, timings,
            road_transport, train_transport, air_transport, categoryImgPath, description, stateImgPath, placeId
        ]);

        // Delete existing gallery images from the database before inserting new ones
        await db.promise().query('DELETE FROM place_images WHERE place_id = ?', [placeId]);

        // Insert updated gallery images into the database
        for (const imgPath of galleryImagePaths) {
            await db.promise().query(
                `INSERT INTO place_images (place_id, image_path) VALUES (?, ?)`, 
                [placeId, imgPath]
            );
        }

        // Update hotel details in the database
        await db.promise().query('DELETE FROM place_hotels WHERE place_id = ?', [placeId]);

        const hotelNamesArray = Array.isArray(hotel_names) ? hotel_names : [hotel_names];
        const hotelLinksArray = Array.isArray(hotel_links) ? hotel_links : [hotel_links];

        for (let i = 0; i < hotelNamesArray.length; i++) {
            await db.promise().query(
                `INSERT INTO place_hotels (place_id, name, image_path, hotel_link) VALUES (?, ?, ?, ?)`,
                [placeId, hotelNamesArray[i], hotelImagePaths[i], hotelLinksArray[i]]
            );
        }

        // Update guide details in the database
        await db.promise().query('DELETE FROM place_guides WHERE place_id = ?', [placeId]);

        const guideNamesArray = Array.isArray(guide_names) ? guide_names : [guide_names];
        const guideMobilesArray = Array.isArray(guide_mobiles) ? guide_mobiles : [guide_mobiles];

        for (let i = 0; i < guideNamesArray.length; i++) {
            await db.promise().query(
                `INSERT INTO place_guides (place_id, name, mobile) VALUES (?, ?, ?)` ,
                [placeId, guideNamesArray[i], guideMobilesArray[i]]
            );
        }

        req.flash("success", "Place updated successfully!!");
        res.redirect(`/admin/editPlace/${placeId}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect(`/admin/editPlace/${placeId}`);
    }
});

router.get("/search", async (req, res) => {
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
            res.render("pages/adminSearchPage", { places: results, query });
        }
        else {
            req.flash("error", "No results found for your search!!");
            res.render("pages/adminSearchPage", { places: [], query });
        }
    }catch(err) {
        console.error(err);
        req.flash('error', 'Something went wrong. Please try again later.');
        res.redirect('/');
    }
});

module.exports = router;