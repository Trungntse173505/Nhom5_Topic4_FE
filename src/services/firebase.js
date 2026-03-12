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

// Biến dùng chung để quản lý dọn dẹp bộ nhớ
let heartbeatInterval = null;
let eventListenersRef = null;

/**
 * HÀM 1: Cập nhật trạng thái (Dùng cho cả Online và Offline)
 */
export const updateUserPresence = async (userId, role, isOnline) => {
  const safeUserId = String(userId);
  if (!safeUserId || safeUserId === "undefined") return;

  const userRef = doc(db, "presence", safeUserId);
  const data = {
    role: role,
    status: isOnline ? "online" : "offline",
    lastActive: serverTimestamp(),
  };

  try {
    // merge: true giúp giữ lại các trường khác nếu có
    await setDoc(userRef, data, { merge: true });
    console.log(`[Firebase] User ${safeUserId} is now ${isOnline ? 'Online' : 'Offline'}`);
  } catch (error) {
    console.error("Lỗi cập nhật Presence:", error);
  }
};

/**
 * HÀM 2: Bắt đầu theo dõi (Gắn vào App.jsx)
 */
export const startPresenceTracking = (userId, role) => {
  const safeUserId = String(userId);
  const userRef = doc(db, "presence", safeUserId);

  // --- Bước A: Dọn dẹp những gì cũ còn sót lại ---
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  if (eventListenersRef) eventListenersRef();

  // --- Bước B: Thiết lập Heartbeat (Cứ 20 giây báo danh 1 lần) ---
  heartbeatInterval = setInterval(() => {
    setDoc(userRef, { lastActive: serverTimestamp() }, { merge: true })
      .catch((err) => console.error("Lỗi Heartbeat:", err));
  }, 20000);

  // --- Bước C: Định nghĩa các sự kiện trình duyệt ---
  
  // Khi người dùng tắt tab hoặc trình duyệt
  const onBrowserClose = () => {
    updateUserPresence(safeUserId, role, false);
  };

  // Khi người dùng chuyển tab hoặc thu nhỏ trình duyệt
  const onTabChange = () => {
    if (document.visibilityState === "visible") {
      // Khi quay lại tab: Set online ngay lập tức
      updateUserPresence(safeUserId, role, true);
    }
  };

  // --- Bước D: Gắn sự kiện vào Window/Document ---
  window.addEventListener("beforeunload", onBrowserClose);
  document.addEventListener("visibilitychange", onTabChange);

  // Lưu hàm dọn dẹp để gọi khi logout
  eventListenersRef = () => {
    window.removeEventListener("beforeunload", onBrowserClose);
    document.removeEventListener("visibilitychange", onTabChange);
  };

  console.log("[Firebase] Bắt đầu theo dõi trạng thái cho:", safeUserId);
};

/**
 * HÀM 3: Dừng theo dõi (Gọi khi Logout)
 */
export const stopPresenceTracking = async (userId, role) => {
  // 1. Tắt đồng hồ Heartbeat
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  // 2. Gỡ bỏ các sự kiện window/document
  if (eventListenersRef) {
    eventListenersRef();
    eventListenersRef = null;
  }

  // 3. Set trạng thái về offline lần cuối
  await updateUserPresence(userId, role, false);
};