/**
 * Sanitizes user object to strip heavy base64 image strings and collection arrays
 * before writing to browser localStorage to prevent QuotaExceededError.
 */
export const sanitizeUserForStorage = (userObj) => {
  if (!userObj) return null;

  // Extract nested arrays and heavy fields
  const { pets, appointments, notifications, wishlists, ...cleanUser } = userObj;

  // Truncate profilePic/coverPhoto if they are giant base64 data URLs (>1000 chars)
  let cleanPic = cleanUser.profilePic;
  if (cleanPic && typeof cleanPic === 'string' && cleanPic.startsWith('data:') && cleanPic.length > 1000) {
    cleanPic = undefined;
  }

  let cleanCover = cleanUser.coverPhoto;
  if (cleanCover && typeof cleanCover === 'string' && cleanCover.startsWith('data:') && cleanCover.length > 1000) {
    cleanCover = undefined;
  }

  return {
    ...cleanUser,
    profilePic: cleanPic,
    coverPhoto: cleanCover
  };
};

/**
 * Safely writes user object to localStorage with try-catch fallback.
 */
export const safeSetUserStorage = (userObj) => {
  if (!userObj) return;
  try {
    const minimalUser = sanitizeUserForStorage(userObj);
    localStorage.setItem('user', JSON.stringify(minimalUser));
  } catch (err) {
    console.warn('Storage quota warning when persisting user session:', err.message);
  }
};
