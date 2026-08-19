<div align="center">
 <img src="document work/logo/logo.jpeg" alt="PetLink Logo" width="150" style="border-radius: 20px;">
  
  # 🐾 PetLink
  
  **A Comprehensive Cross-Platform Pet Management System**
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)
  
  <p align="center">
    <strong>🐶 One Platform. All Pet Needs. 🐱</strong>
  </p>
</div>

---

## 📋 Table of Contents

- [🌟 About The Project](#-about-the-project)
- [🎯 Problem Statement](#-problem-statement)
- [✨ Key Features](#-key-features)
- [👥 Target Users](#-target-users)
- [🏗️ System Architecture](#️-system-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [📊 User Research Insights](#-user-research-insights)
- [🚀 Sprint Planning](#-sprint-planning)
- [📁 Project Structure](#-project-structure)
- [⚙️ Installation & Setup](#️-installation--setup)
- [👨‍💻 Development Team](#-development-team)
- [📄 Documentation](#-documentation)
- [📞 Contact](#-contact)

---

## 🌟 About The Project

**PetLink** is a cross-platform web and mobile application developed to serve as a comprehensive pet management platform. It provides a **centralized digital solution** for pet owners, adopters, buyers, and small service providers in Pakistan, enabling them to manage all pet-related activities through a single, user-friendly system.

<div align="center">
  
  | 🌐 Web Platform | 📱 Mobile App |
  |:---------------:|:-------------:|
  | React.js | React Native |
  
</div>

---

## 🎯 Problem Statement

Pet owners in Pakistan face significant challenges in their daily lives while managing pet-related activities:

- ❌ **Fragmented Market** – Reliance on scattered Facebook groups, WhatsApp chats, and random online posts
- ❌ **Unverified Information** – Misleading listings with no trust or verification
- ❌ **No Centralized Health Tracking** – Missed vaccination schedules and medical history on paper/phone notes
- ❌ **Difficulty Finding Services** – No reliable way to find trusted boarding or veterinary services
- ❌ **Disconnected Purchasing** – Multiple websites or local stores with no centralized payment option

---

## ✨ Key Features

### 👤 User Management
- Secure registration & authentication with JWT
- Password recovery via email
- Role-based access control (Admin/User)

### 🐕 Pet Profile Management
- Create, update, and manage detailed pet profiles
- Upload pet images
- Track breed, age, weight, and medical conditions

### 🏪 Pet Marketplace (Adoption & Sale)
- Create adoption/sale listings with validation
- Search and filter listings by multiple criteria
- Verified and trusted marketplace

### 🏠 Temporary Shelter Service
- Request boarding services during travel
- Provider listing management
- Request acceptance/rejection workflow

### 🛍️ Pet Product Store
- Browse products by categories (Food, Accessories, Medicines, Toys)
- Shopping cart with quantity management
- Secure checkout with payment gateway integration
- Order tracking and history

### 📋 Admin Store Management
- Add, update, and delete products
- Inventory/stock level management
- View customer orders and update order status
- Sales reports and revenue tracking

### 💊 Digital Health Vault
- Vaccination and health record management
- Automated reminders for due dates
- Never miss a vaccination again!

### 🤖 AI Chatbot Assistant
- Instant user assistance and guidance
- FAQ handling and platform navigation
- 24/7 support

### 📍 Location Services
- Find nearby veterinary clinics using Google Maps API
- Emergency care at your fingertips

### 🔔 Notification System
- In-app and email notifications
- Real-time updates on requests and orders

---

## 👥 Target Users

| User Type | Description |
|-----------|-------------|
| **Pet Owners / Adopters** | Frequent users who need a simple and reliable interface |
| **Service Providers (Shelters)** | Users who manage listings and provide shelter services |
| **Platform Admin / Store Manager** | Manages platform content, resolves disputes, and handles product listings |

---

## ⚙️ Installation & Setup

### Prerequisites
*   Node.js (v20+)
*   MongoDB installed and running locally

### 1. Server/Backend Setup
```bash
cd server/backend
npm install
npm start
# To run backend tests:
npm run test
# To run backend lint checks:
npm run lint
```

### 2. Web Client Setup
```bash
cd client/web
npm install
npm run dev
# To run web frontend tests:
npm run test
# To run web lint checks:
npm run lint
```

### 3. Mobile App Setup
```bash
cd client/app
npm install
npm start
# To run mobile tests:
npm run test
# To run mobile lint checks:
npm run lint
```

---

## 🚀 Continuous Integration (CI/CD Pipeline)

We have configured a complete **GitHub Actions CI Pipeline** in [.github/workflows/ci.yml](file:///.github/workflows/ci.yml) to automatically validate pull requests and branch contributions.

### Workflow Jobs
1. **Linting Check**: Runs ESLint and OxLint across backend server, web frontend, and React Native mobile codebases to enforce quality standards.
2. **Testing Suite**: Installs dependencies and runs unit tests (`Jest` for backend/mobile app, `Vitest` for web frontend) with coverage outputs. Passed environment parameters are injected securely via GitHub Actions secrets (`MONGODB_URI`, `JWT_SECRET`).
3. **Build Verification**: Validates production compiles (`npm run build` for React web client and `npm run build` for React Native Expo app client).

### Team Contribution Rules
* **Required PR Checks**: All Pull Requests targeting `main` or `master` branches must pass the CI checks before merge approval.
* **Cache Optimization**: Node modules dependencies are cached globally in GitHub runner storage using dependency lock keys to minimize build times.

---

## 👨‍💻 Development Team

| Reg. No. | Name | Role |
|----------|------|------|
| L1F22BSSE0286 | **Nabeel Ijaz** | Scrum Master & Backend Development |
| L1F22BSSE0297 | **Ehsan Shahid** | Mobile App Development |
| L1S23BSSE0100 | **Umar Akram** | Web Development |
| L1S23BSSE0089 | **Usama** | Database Design & Testing |

**Product Owner:** <span style="color: red; font-weight: bold;">Zupash Awais</span>

**Group ID:** S26SE025

---

## 📞 Contact

**Project Link:** [https://github.com/MeNabeel/Pet-Link](https://github.com/MeNabeel/Pet-Link)

**Faculty of Information Technology & Computer Science**  
**University of Central Punjab**

---

<div align="center">
  
  ### 🐾 *Developed for Purpose* 🐾
  
  **Nabeel and Co**
  
  *Bringing paws and people together, one click at a time.*
  
  ---
  
  **© 2026 PetLink | All Rights Reserved | Nabeel and Co**
  
</div>
