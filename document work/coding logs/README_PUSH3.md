# Coding Log - Push 3: Profile Parity, Image Pickers & Capsule Bottom Nav

This log records the detailed implementation changes completed during Push 3 of the PetLink workspace development.

---

## 🛠️ Work Done Summary

### 1. Web Portal Profile Parity
*   **Persistent Sidebar View:** Integrated `Profile.jsx` and `AccountSettings.jsx` directly as tabs inside the `Dashboard.jsx` layout. The sidebar and main header remain visible and active at all times.
*   **Base64 Profile & Cover Photo Uploads:** Integrated dynamic hidden file inputs in the web profile pages. It reads files using `FileReader`, converts them to Base64 strings, and stores them in session state so they display in real time in the header and sidebar.

### 2. Mobile App Capsule Bottom Navigation
*   **Capsule Highlight Bottom Bar:** Added a bottom tab menu bar modeled after the reference capsule design.
    *   **Home:** Feather `home`
    *   **Store:** Feather `shopping-bag`
    *   **My Pets:** FontAwesome `paw` (paw print icon)
    *   **Services:** FontAwesome `medkit` (vet medical case icon)
    *   **Profile:** Feather `user`
*   Active tabs render with a solid blue pill background, with white icon and text elements. Inactive elements remain gray.

### 3. Mobile Photo Uploading
*   **Gallery Integration:** Added `expo-image-picker` inside `Profile.js` to prompt for camera roll permissions and select photos (avatar cropped at 1:1, cover cropped at 16:9).

---

## 🎓 Academic Code Highlights for Examiners

### 💻 Web Profile Image FileReader (Web)
*   **File:** [`client/web/src/pages/Profile.jsx`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/client/web/src/pages/Profile.jsx)
```javascript
const handleProfilePicChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdateUser({ ...user, profilePic: reader.result }); // Base64 data URL
    };
    reader.readAsDataURL(file);
  }
};
```
*Examiner Explanation:* "We read files locally without backend uploading delays. By loading them as data URLs via `FileReader.readAsDataURL`, we get a Base64 string that React binds directly to the image sources in real time."

---

### 📱 Expo Image Library Selection (Mobile)
*   **File:** [`client/app/src/screens/Profile.js`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/client/app/src/screens/Profile.js)
```javascript
const handleEditPic = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === 'granted') {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      onUpdateUser({ ...user, profilePic: result.assets[0].uri });
    }
  }
};
```
*Examiner Explanation:* "We request media permission. Once granted, we invoke the phone's native image selector, forcing a 1:1 aspect cropping square for avatars, and pass the selected URI back to state."

---

### 📱 Bottom Tab Active Capsule Styling (Mobile CSS)
*   **File:** [`client/app/App.js`](file:///c:/Users/Nabeel/Desktop/FYP%20PETLINK/client/app/App.js)
```javascript
tabItemActive: {
  backgroundColor: COLORS.primary, // Blue highlight background
  paddingHorizontal: 16,
  borderRadius: 14, // Capsules shape
}
```
*Examiner Explanation:* "The active navigation item uses a dynamic conditional array: `[styles.tabItem, activeTab === 'home' && styles.tabItemActive]`. When the state matches, it overlays the blue background and sets text color to white, matching our SDS specification."
