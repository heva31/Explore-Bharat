# 🌏 Explore Bharat – A Tourism Portal

**Explore Bharat** is a full-stack, AI-powered tourism web platform developed to revolutionize the way travelers discover and engage with India's diverse destinations. Unlike conventional platforms, Explore Bharat offers **real-time admin-user interaction**, **AI-driven chatbot support**, and a personalized dashboard experience — all while being fully responsive and mobile-friendly.

Deployed on [Render](https://explore-bharat-2q4n.onrender.com/), this platform is built using modern technologies like **Node.js**, **Express.js**, **EJS**, **MySQL**, and **Gemini API** integration to provide a seamless and dynamic travel planning experience.

---

## ✨ Key Features

* ✅ **Responsive Design**: Works smoothly across desktops, tablets, and smartphones.
* 🔍 **Destination Discovery**: Filter and explore Indian destinations by state or category via a dynamic EJS rendering engine.
* 🔐 **Authentication**: User login via **session-based authentication** or **Google OAuth**.
* 💬 **Chat Support**:

  * Real-time admin-user messaging.
  * Integrated **Gemini-powered chatbot** for instant AI assistance.
* 📬 **Inquiry System**: Submit and manage travel-related inquiries with real-time admin support.
* ❤️ **Wishlist & Reviews**: Save favourite places, rate destinations, and submit reviews.
* 📝 **Admin Dashboard**:

  * Add/edit destinations, blogs, and images.
  * View analytics and respond to user messages.
* 🖼️ **Travel Blog**: Dynamic blogging module to publish travel guides and stories.
* 📊 **Analytics**: View engagement insights and user preferences (admin-side).

---

## 🛠️ Tech Stack

### Frontend:

* HTML5, CSS3, JavaScript
* EJS (for dynamic templating)
* Bootstrap 5, Google Fonts

### Backend:

* Node.js
* Express.js
* MySQL (Relational Database)
* Gemini API (Chatbot integration)

### Hosting:

* **Render** for deployment

---

## 📁 Folder Structure (Frontend Resources)

```
/.vscode                 # VSCode settings
/about_india            # Static info about Indian states and heritage
/contact_us             # Contact forms and resources
/css                    # Custom stylesheets
/explore_by_categories  # Places grouped by theme (e.g. spiritual, historical)
/explore_by_states      # State-wise exploration
/images                 # Destination and gallery images
/inquiry                # Inquiry form logic and UI
/js                     # Client-side scripts
/index.html             # Homepage entry point
```

---

## 📌 System Overview

* Built with a **modular MVC architecture**.
* Dynamic routing and content rendering using a single EJS structure.
* Secure password hashing using **bcrypt**.
* APIs and routes structured for scalability and modular deployment.
* Chat feature uses **AJAX** to enable real-time communication.
* Admin and User roles are separated at both database and UI level.

---

## 🔐 Security

* HTTPS, session management, and cookie security.
* Bcrypt password hashing.
* Role-based admin authentication.
* SQL injection prevention using parameterized queries.

---

## 🧪 Testing & Maintenance

* Functional and integration testing performed for all major modules.
* Supports **User Acceptance Testing (UAT)** feedback integration.
* Maintenance handled via a structured feedback-release cycle.

---

## 📱 User Roles

### Users:

* Register/login, explore places, submit inquiries.
* Chat with admin or AI, review and rate places.
* Manage favourites, profile, and chat history via a personal dashboard.

### Admins:

* Manage destinations, blogs, reviews, and inquiries.
* Respond to chats and inquiries in real-time.
* Monitor user activity and engagement via dashboard analytics.

---

## 🔗 Live Demo

Visit the deployed site here:
🌐 [**Explore Bharat - Live on Render**](https://explore-bharat-2q4n.onrender.com/)

---

## 👨‍💻 Developer Notes

For setup, contribution, or code structure explanations, refer to the full [Explore Bharat Project Report](mailto:divy1544@gmail.com).
