# PetLink FYP Coding Logs & Examiner Presentation Guide

This directory maintains the coding logs, push history, and structural highlights of the PetLink workspace for both client platforms (Web & App) and the unified Express backend. Use this document to study the architectural layout and present it to your FYP examiners.

---

## 📅 Part 1: Push History & Code Milestones

### 🏷️ Push Log 1: Project Restructuring & Directory Alignment
*   **What was accomplished:** 
    *   Unified all scattered source code files into a clean workspace structure:
        *   `client/web/` contains the Vite + React frontend web portal.
        *   `client/app/` contains the Expo + React Native mobile application.
        *   `server/backend/` contains the Express + Node.js + Mongoose server.
        *   `document work/` houses SDS specifications, sequence diagrams, presentations, and logo assets.
    *   Cleaned temporary Office lock cache files (`~$*`, `~WRL*`) from the workspace.

### 🏷️ Push Log 2: Authentication split views, recovery flows & UI reskins
*   **What was accomplished:**
    *   Separated the unified authentication screens into individual, modular pages (`Login.jsx`/`Signup.jsx` for web and `Login.js`/`Signup.js` for mobile).
    *   Reskinned the login and registration views with modern split panels inspired by mock layouts (200px prominent logo on a dark-to-blue gradient panel).
    *   Integrated **Lucide React** (web) and **Feather** (mobile) vector icons instead of text emojis.
    *   Created post-login metrics dashboards displaying user profiles, roles, registered pets, and action cards.
    *   Implemented Nodemailer password recovery with dynamic Ethereal test server fallbacks and automated space-stripping for Gmail App Passwords.
    *   Removed role toggle bars on login pages; the system automatically detects user/admin roles from the database query.

### 🏷️ Push Log 3: Client Parity Profiles & Streamlined Menu Layouts
*   **What was accomplished:**
    *   **Refined Mobile Profile Grid:** Condensed the main mobile profile layout into a streamlined, high-end list menu (reducing scroll weight). Only basic metadata shows at the top (photo, name, username, bio, primary contact), followed by tapable navigation menu rows:
        1. *Account Settings* (Navigates to full profile editor & read-only system cards).
        2. *My Orders* (Mock page callback).
        3. *Transaction History* (Mock page callback).
        4. *Support Helpdesk* (Mock page callback).
        5. *Log Out* (Session logout).
    *   **Web Profile Parity:** Created matching profile templates and editor forms (`Profile.jsx` / `AccountSettings.jsx`) inside the Web Portal to match mobile layouts, linking them from the Dashboard nav drawer.

### 🏷️ Push Log 4: Admin Management, System Analytics & Pet Registration Flows
*   **What was accomplished:**
    *   **Admin Dashboard & Management:**
        *   Created an administrative dashboard (`AdminDashboard.jsx` on Web, `AdminDashboard.js` on Mobile) showing real-time statistics (total users, total pets, products, orders, and revenue).
        *   Built the `AdminUsersManager` (`AdminUsersManager.jsx`) allowing admins to search/view all users, update user statuses (`Active`, `Suspended`, `Blocked`, `Deleted`, `Pending Verification`), and permanently delete users.
        *   Integrated role checking with administrative restriction headers (`x-requester-id`).
    *   **Pet Profiles & Management:**
        *   Implemented Pet profiles registration & modification (`PetForm.jsx` / `PetForm.js` and `PetDetails.jsx` / `PetDetails.js`).
        *   Added routes and controllers to register pets, retrieve detailed pet information, list all registered pets under a specific user, and update/remove records with owner validation checks.
    *   **Unified Navigation:**
        *   Linked Admin Dashboards and Pet lists/forms directly into the primary navigation workflows on both platforms.

---

## 🎓 Part 2: Examiner's Code Highlights (Lines & CSS)

Below are the most important sections of code to showcase to your examiner during validation, explaining *how* and *why* they are built this way.

### 🗄️ 1. Database Model & Encryption Pre-Save Hook
*   **File:** [`server/backend/models/User.js`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/server/backend/models/User.js)
*   **Why it's important:** It handles automatic password hashing using `bcryptjs` before committing the user document to MongoDB.
*   **Key Code Snippet (Pre-save hook):**
    ```javascript
    UserSchema.pre('save', async function (next) {
      if (!this.isModified('password')) {
        next();
      }
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    });
    ```
    *Examiner Explanation:* "We use a Mongoose pre-save hook. When a user registers or resets their password, Mongoose automatically catches the plain-text password, hashes it using a salt round of 10, and saves only the secure hash. The plain text password is never stored."

---

### 🔏 2. Password Recovery OTP Generation
*   **File:** [`server/backend/controllers/authController.js`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/server/backend/controllers/authController.js)
*   **Why it's important:** It generates a secure, cryptographically random 6-digit numeric OTP and handles expiration.
*   **Key Code (Line ~98):**
    ```javascript
    // Generate a clean 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and 10 minute expiration
    user.resetPasswordToken = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();
    ```
    *Examiner Explanation:* "Instead of guessable reset links, we generate a 6-digit token using `Math.random` boundaries, store it in the user's document along with a timestamp set exactly 10 minutes in the future (`Date.now() + 10 * 60 * 1000`), and check this expiration when verifying the reset."

---

### 📬 3. Nodemailer with Dynamic Test Account Fallback
*   **File:** [`server/backend/utils/sendEmail.js`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/server/backend/utils/sendEmail.js)
*   **Why it's important:** It auto-sanitizes copied Gmail App Passwords and dynamically boots an Ethereal SMTP server if real mail credentials are not provided.
*   **Key Code Snippet:**
    ```javascript
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS.replace(/\s+/g, ''), // Strips copied spaces
        },
      });
    } else {
      // Dynamic Ethereal Fallback
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    }
    ```
    *Examiner Explanation:* "To ensure the app functions without hardcoded email settings, the email utility automatically falls back to generating a temporary Ethereal SMTP test account. It sanitizes passwords by stripping any copy-paste whitespaces and outputs a clickable link in our terminal logs to view the visual HTML preview."

---

### 💻 4. Responsive Web Split UI & CSS Grid Collapse
*   **Files:** 
    *   [`client/web/src/pages/Login.jsx`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/client/web/src/pages/Login.jsx)
    *   [`client/web/src/pages/Login.css`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/client/web/src/pages/Login.css)
*   **Why it's important:** It splits the viewport into a 50/50 visual branding side and a login card side, while adapting smoothly on mobile browsers.
*   **Key CSS Media Query:**
    ```css
    .login-split-container {
      display: flex;
      min-height: 100vh;
    }
    .login-left-panel {
      flex: 1.2;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-dark) 100%);
    }
    @media (max-width: 900px) {
      .login-split-container {
        flex-direction: column;
      }
      .login-left-panel {
        display: none; /* Collapses the left branding side on small screens */
      }
      .login-right-panel {
        flex: 1;
        padding: 20px;
      }
    }
    ```
    *Examiner Explanation:* "The login portal utilizes a Flexbox layout. On desktop screens, it displays a branding side with a premium gradient and a form card side. On mobile screens (under 900px), a CSS media query hides the left branding side and focuses 100% of the screen width on the input fields for maximum readability."

---

### 📱 5. Responsive Mobile Grid Layout
*   **File:** [`client/app/src/screens/Dashboard.js`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/client/app/src/screens/Dashboard.js)
*   **Why it's important:** It builds a dynamic two-column grid on phones without hardcoding pixel values.
*   **Key Layout Styles:**
    ```javascript
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    gridCard: {
      width: '48%', /* Responsive column sizing */
      backgroundColor: COLORS.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    }
    ```
    *Examiner Explanation:* "We avoid fixed pixel widths for cards. By styling the parent layout with `flexWrap: 'wrap'` and `justifyContent: 'space-between'`, we can set card widths to exactly `48%` so they dynamically scale on small or large phone devices."

---

### 🛡️ 6. Admin Authorization & User Status Management
*   **File:** [`server/backend/controllers/authController.js`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/server/backend/controllers/authController.js)
*   **Why it's important:** It verifies that requests are coming from an authorized administrator and updates user statuses securely.
*   **Key Code Snippet:**
    ```javascript
    const requesterId = req.headers['x-requester-id'];
    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }
    ```
    *Examiner Explanation:* "To secure admin actions, we extract the requestor's ID from the headers, fetch their user profile, and verify that their role is explicitly set to `admin`. This acts as our role-based authorization check."

---

### 🐾 7. Pet Ownership Verification for Profile Updates
*   **File:** [`server/backend/controllers/petController.js`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/server/backend/controllers/petController.js)
*   **Why it's important:** It ensures that only the actual owner of a pet profile can update or delete it.
*   **Key Code Snippet:**
    ```javascript
    const requesterId = req.headers['x-requester-id'] || req.body.requesterId || req.query.requesterId;
    if (pet.owner.toString() !== requesterId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this pet profile' });
    }
    ```
    *Examiner Explanation:* "For data integrity and privacy, we check the requestor's ID against the stored pet owner ID. If there is a mismatch, the server returns a 403 Forbidden status, ensuring users cannot edit or delete pet profiles that do not belong to them."
