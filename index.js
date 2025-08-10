if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const path = require("path");
const passport = require("passport");
const flash = require("connect-flash");
require("./controllers/google.js");

const app = express();
const PORT = process.env.PORT || 2004;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(
    session({
        secret: "exploreBharatSecret",
        resave: false,
        saveUninitialized: true,
    })
);
app.use(flash());

app.use((req, res, next) => {
    res.locals.currentUser = req.session.user;
    res.locals.adminUser = req.session.admin;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require("./routes/auth.js");
const inquiryRoutes = require("./routes/inquiry.js");
const adminRoutes = require("./routes/admin.js");
const contactRouter = require("./routes/contact.js");
const placeRouter = require("./routes/place.js");
const categoryRouter = require("./routes/categories.js");
const stateRouter = require("./routes/states.js");
const searchRouter = require("./routes/search.js");
const adminBlogRouter = require("./routes/adminBlog.js");
const blogRouter = require("./routes/blogs.js");
const chatbotRouter = require("./routes/chatbot.js");
const chatRouter = require("./routes/chat.js");
const adminChatRouter = require("./routes/adminChat.js");
const reviweRouter = require("./routes/reviews.js");

function isUser(req, res, next) {
    if (req.session.user && req.session.user.role === "user") return next();
    req.flash("error", "Please log in first!!");
    res.redirect("/login");
}

function isAdmin(req, res, next) {
    if (req.session.admin && req.session.admin.role === "admin") return next();
    req.flash("error", "Please log in first!!");
    res.redirect("/login");
}

app.use("/", authRoutes);
app.use("/inquiry", isUser, inquiryRoutes);
app.use("/admin", isAdmin, adminRoutes, adminBlogRouter, adminChatRouter);
app.use("/contact_us", isUser, contactRouter);
app.use("/places", isUser, placeRouter, reviweRouter);
app.use("/category", isUser, categoryRouter);
app.use("/states", isUser, stateRouter);
app.use("/search", isUser, searchRouter);
app.use("/blogs", isUser, blogRouter);
app.use("/chatbot", isUser, chatbotRouter);
app.use("/chat", isUser, chatRouter);

app.get("/", isUser, (req, res) => {
    res.render("pages/index", { user: req.session.user });
});

app.get("/about_india", isUser, (req, res) => {
    res.render("pages/about_india");
});

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found!"));
// });

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});