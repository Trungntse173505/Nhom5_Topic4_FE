import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAY7FjRjHYAcs4IAw3uRiZ9cr28d3AbDE",
  authDomain: "datalabeling-analytics.firebaseapp.com",
  projectId: "datalabeling-analytics",
  storageBucket: "datalabeling-analytics.firebasestorage.app",
  messagingSenderId: "613412695950",
  appId: "1:613412695950:web:93685db66db5468f943edf",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

let heartbeatInterval = null;
let cleanupListeners = null;

/**
 * Cập nhật trạng thái online/offline lên Firestore
 */
export const updateUserPresence = async (userId, role, isOnline) => {
  const safeUserId = String(userId);
  if (!safeUserId || safeUserId === "undefined" || safeUserId === "null") {
    console.error("Lỗi: userId không hợp lệ!");
    return;
  }

  try {
    const userRef = doc(db, "presence", safeUserId);
    await setDoc(
      userRef,
      {
        role: role,
        status: isOnline ? "online" : "offline",
        lastActive: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`[Firebase] ${isOnline ? "Online" : "Offline"} - ${safeUserId} (${role})`);
  } catch (error) {
    console.error("Lỗi cập nhật Presence:", error);
  }
};

/**
 * BẮT ĐẦU TRACKING
 * 
 * Cơ chế phát hiện offline khi tắt browser đột ngột:
 * - Heartbeat mỗi 20 giây cập nhật lastActive lên Firestore
 * - Khi tắt browser → heartbeat dừng → lastActive không cập nhật nữa
 * - AdminOverview check mỗi 15 giây: nếu lastActive > 1 phút → coi là offline
 * 
 * => KHÔNG dùng sendBeacon vì Firestore REST API cần auth token
 */
export const startPresenceTracking = (userId, role) => {
  const safeUserId = String(userId);

  // Cleanup cũ nếu có
  if (cleanupListeners) cleanupListeners();
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  // 1. HEARTBEAT - mỗi 20 giây
  heartbeatInterval = setInterval(() => {
    const userRef = doc(db, "presence", safeUserId);
    setDoc(userRef, { lastActive: serverTimestamp() }, { merge: true }).catch(
      (err) => console.error("Heartbeat error:", err)
    );
  }, 15000);

  // 2. BEFOREUNLOAD - cố set offline khi tắt tab (best-effort, không đảm bảo 100%)
  const handleBeforeUnload = () => {
    try {
      const userRef = doc(db, "presence", safeUserId);
      setDoc(
        userRef,
        { status: "offline", lastActive: serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      // Browser đang đóng, ignore
    }
  };

  // 3. VISIBILITYCHANGE - chuyển tab / minimize
  const handleVisibilityChange = () => {
    const userRef = doc(db, "presence", safeUserId);
    if (document.visibilityState === "hidden") {
      // Rời tab → cập nhật lastActive
      setDoc(userRef, { lastActive: serverTimestamp() }, { merge: true }).catch(() => {});
    } else if (document.visibilityState === "visible") {
      // Quay lại tab → set online lại (phòng trường hợp đã bị timeout)
      setDoc(
        userRef,
        { status: "online", lastActive: serverTimestamp() },
        { merge: true }
      ).catch(() => {});
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  cleanupListeners = () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };

  console.log("[Firebase] Presence tracking started");
};

/**
 * DỪNG TRACKING - gọi khi logout
 */
export const stopPresenceTracking = async (userId, role) => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (cleanupListeners) {
    cleanupListeners();
    cleanupListeners = null;
  }
  await updateUserPresence(userId, role, false);
  console.log("[Firebase] Presence tracking stopped");
};