# Chapter Governance Portal

A clinical, minimalist chapter administration web application designed for **Vasavi Club International**. Built with a high-density, ultra-clean aesthetic inspired by *The Ordinary* product design language, this platform handles member onboarding, identity verification via email OTP, role-based governance, and real-time portal monitoring.

---

## 🎨 Key Features & UI Architecture

* **Clinical-Minimalist UI:** Monochromatic base, ultra-thin borders (`border-gray-200`), uppercase monospace telemetry fonts, with subtle Lions Blue (`#00338D`) and Lions Gold (`#F2A900`) accents.
* **Authentication Gate:** Protected routes powered by JWT. Unauthenticated visitors are automatically routed to the sign-in/sign-up portal.
* **Multi-Step Onboarding Wizard:** Sequential, multi-phase registration flow that guides new inductees step-by-step.
* **Cryptographic Email OTP:** 6-digit verification codes dispatched via Nodemailer with automatic 5-minute MongoDB TTL index expiration.
* **Role-Based Access Control (RBAC):** Tiered permissions separating standard **Members** from **Admins**, enabling administrative privileges like promoting or removing member records.
* **Executive Dashboard & Masters:** Centralized tracking for Club Master, Member Master, and PST Master (President, Secretary, Treasurer) rosters.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js (via Vite)
* **Styling:** Tailwind CSS
* **Routing:** React Router DOM (v6)
* **Animations:** Framer Motion

### Backend
* **Runtime:** Node.js & Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JSON Web Tokens (JWT), Bcrypt.js
* **Mailing Service:** Nodemailer (Gmail SMTP / Google App Passwords)

---

## 📁 Project Structure

```text
├── backend/
│   ├── config/          # Database connections
│   ├── controllers/     # Auth, OTP, and Member route controllers
│   ├── middleware/      # Auth & isAdmin RBAC middleware
│   ├── models/          # Member, Club, and OTP Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── .env.example
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/  # Sidebar, Navbar, Modals, OTP Input
    │   ├── context/     # AuthContext state manager
    │   ├── pages/       # Dashboard, MemberMaster, AuthScreen
    │   ├── App.jsx
    │   └── main.jsx
    ├── vercel.json      # Client-side SPA rewrite rules
    └── vite.config.js
