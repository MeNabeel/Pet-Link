/**
 * Activity Tracker Utility for PetLink
 * Manages dynamic, chronological user activities feed across pet care and shopping.
 */

const STORAGE_PREFIX = "petlink_user_activities_";

export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "Recently";
  const date = typeof timestamp === "string" || typeof timestamp === "number" ? new Date(timestamp) : timestamp;
  if (isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/**
 * Log a new real user activity to local activity store
 */
export const logUserActivity = (userId, activity) => {
  if (!userId || !activity || !activity.title) return;
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : [];

    const newActivity = {
      id: activity.id || `act-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: activity.type || "general",
      title: activity.title,
      targetName: activity.targetName || "",
      timestamp: activity.timestamp || Date.now(),
    };

    // Filter out immediate exact duplicates within the last minute
    const filtered = existing.filter(
      (a) =>
        !(a.title === newActivity.title && Math.abs(a.timestamp - newActivity.timestamp) < 60000)
    );

    const updated = [newActivity, ...filtered].slice(0, 30);
    localStorage.setItem(key, JSON.stringify(updated));

    // Notify listeners
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("petlink_activity_updated", { detail: { userId } }));
    }
  } catch (err) {
    console.error("Error logging user activity:", err);
  }
};

/**
 * Get the latest up to 5 real user activities by synthesizing logged activities
 * with live database entities (pets, vaccines, appointments, cart items, favorites).
 */
export const getUserActivities = (userId, pets = [], appointments = [], cart = [], wishlist = []) => {
  if (!userId) return [];

  const activities = [];

  // 1. Stored interactive logged activities
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const stored = JSON.parse(raw);
      if (Array.isArray(stored)) {
        stored.forEach((item) => {
          activities.push({
            id: item.id,
            type: item.type || "general",
            title: item.title,
            targetName: item.targetName || "",
            timestamp: new Date(item.timestamp).getTime(),
          });
        });
      }
    }
  } catch {}

  // 2. Synthesize from actual registered pets
  if (Array.isArray(pets)) {
    pets.forEach((pet) => {
      const petCreated = pet.createdAt ? new Date(pet.createdAt).getTime() : Date.now() - 3600000 * 2;
      activities.push({
        id: `pet-reg-${pet._id || pet.id}`,
        type: "pet",
        title: `Registered pet profile for`,
        targetName: pet.name,
        timestamp: petCreated,
      });

      // Vaccines attached to pet
      if (Array.isArray(pet.vaccines)) {
        pet.vaccines.forEach((vac, vIdx) => {
          const vacTime = vac.date ? new Date(vac.date).getTime() : Date.now() - 3600000 * 4;
          activities.push({
            id: `vac-${pet._id || pet.id}-${vIdx}`,
            type: "vaccine",
            title: `Added ${pet.name}'s vaccination record:`,
            targetName: `${vac.vaccineName || "Vaccine"} (${vac.dose || "Dose 1"})`,
            timestamp: vacTime,
          });
        });
      } else if (pet.vaccinationDate) {
        activities.push({
          id: `vac-date-${pet._id || pet.id}`,
          type: "vaccine",
          title: `Updated vaccination record for`,
          targetName: pet.name,
          timestamp: new Date(pet.vaccinationDate).getTime() || Date.now() - 3600000 * 6,
        });
      }
    });
  }

  // 3. Synthesize from appointments
  if (Array.isArray(appointments)) {
    appointments.forEach((appt) => {
      const apptCreated = appt.createdAt ? new Date(appt.createdAt).getTime() : Date.now() - 3600000 * 8;
      activities.push({
        id: `appt-${appt.id}`,
        type: "appointment",
        title: `Booked consultation with`,
        targetName: appt.clinicName || "Veterinary Clinic",
        timestamp: apptCreated,
      });
    });
  }

  // 4. Synthesize from active cart items
  if (Array.isArray(cart) && cart.length > 0) {
    cart.slice(0, 2).forEach((item, idx) => {
      activities.push({
        id: `cart-${item.cartItemId || item._id || idx}`,
        type: "cart",
        title: `Added to cart:`,
        targetName: item.name,
        timestamp: item.addedAt ? new Date(item.addedAt).getTime() : Date.now() - 1000 * 60 * (15 + idx * 10),
      });
    });
  }

  // 5. Deduplicate by title + targetName
  const seen = new Set();
  const deduped = [];

  // Sort newest first
  activities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  for (const act of activities) {
    const key = `${act.type}_${act.title}_${act.targetName}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push({
        ...act,
        timeAgo: formatRelativeTime(act.timestamp),
      });
      if (deduped.length >= 5) break;
    }
  }

  return deduped;
};

