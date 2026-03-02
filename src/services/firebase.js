import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCAY7FjRjHYAcs4IAw3uRiZ9cr28d3AbDE",
  authDomain: "datalabeling-analytics.firebaseapp.com",
  projectId: "datalabeling-analytics",
  storageBucket: "datalabeling-analytics.firebasestorage.app",
  messagingSenderId: "613412695950",
  appId: "1:613412695950:web:93685db66db5468f943edf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/**
 * HÀM ĐẾM NGƯỜI ONLINE (Active Users & Role)
 * Tập trung xử lý Đang Online và Đã Online Hôm Nay
 */
export const updateUserPresence = async (userId, role, isOnline) => {
  // Ép kiểu userId sang String để Firestore không báo lỗi khi nhận ID kiểu số từ C#
  const safeUserId = String(userId);

  if (!safeUserId || safeUserId === "undefined" || safeUserId === "null") {
    console.error("Lỗi: Không tìm thấy userId để ghi lên Firestore!");
    return;
  }

  try {
    const userRef = doc(db, "presence", safeUserId);
    await setDoc(userRef, {
      role: role,
      status: isOnline ? "online" : "offline",
      lastActive: serverTimestamp() // Có để trang Admin Overview tính được "Hôm nay"
    }, { merge: true });
    
    // Log ra console
    console.log(`[Firebase] Đã cập nhật ${isOnline ? 'Online' : 'Offline'} cho user ID: ${safeUserId} (Role: ${role})`);
  } catch (error) {
    console.error("Lỗi cập nhật Presence lên Firebase:", error);
  }
};