import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyCAY7FjRjHYAcs4IAw3uRiZ9cr28d3AbDE",
  authDomain: "datalabeling-analytics.firebaseapp.com",
  projectId: "datalabeling-analytics",
  storageBucket: "datalabeling-analytics.firebasestorage.app",
  messagingSenderId: "613412695950",
  appId: "1:613412695950:web:93685db66db5468f943edf",
};

// Khởi tạo app và database
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Biến lưu trữ interval dùng chung để có thể dọn dẹp khi cần
let heartbeatInterval = null;

/**
 * HÀM 1: Cập nhật trạng thái (Online/Offline)
 * Đã tối ưu: Bỏ await để bắn request ngầm (Fire-and-forget), không làm khựng UI web.
 */
export const updateUserPresence = (userId, role, isOnline) => {
  const safeUserId = String(userId);
  // Bỏ qua nếu không có ID hợp lệ
  if (!userId || safeUserId === "undefined" || safeUserId === "null") return;

  const userRef = doc(db, "presence", safeUserId);
  const data = {
    role: role || "user",
    status: isOnline ? "online" : "offline",
    lastActive: serverTimestamp(), // Lưu thời gian cập nhật cuối cùng
  };

  // Cập nhật lên Firestore, dùng merge: true để không ghi đè mất các trường dữ liệu khác
  setDoc(userRef, data, { merge: true }).catch((error) => {
    console.error(`[Firebase] Lỗi cập nhật Presence cho user ${safeUserId}:`, error);
  });
};

/**
 * HÀM 2: Bắt đầu theo dõi trạng thái người dùng
 * Gọi hàm này khi người dùng vừa đăng nhập xong hoặc component App/Layout được Mount.
 */
export const startPresenceTracking = (userId, role) => {
  const safeUserId = String(userId);
  if (!userId || safeUserId === "undefined" || safeUserId === "null") {
    return () => {}; // Trả về hàm rỗng nếu không có user
  }

  // 1. Dọn dẹp interval cũ nếu chẳng may component bị re-render nhiều lần
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  // 2. Set trạng thái Online ngay lập tức khi vừa gọi hàm
  updateUserPresence(safeUserId, role, true);
  console.log(`[Firebase] Bắt đầu theo dõi trạng thái cho: ${safeUserId}`);

  // 3. Thiết lập Heartbeat: Cứ 2 phút (120,000ms) báo danh 1 lần để giữ trạng thái Online.
  // Khoảng thời gian này giúp tiết kiệm Quota Firestore thay vì 20 giây.
  heartbeatInterval = setInterval(() => {
    updateUserPresence(safeUserId, role, true);
  }, 120000); 

  // 4. Lắng nghe sự kiện chuyển tab/ẩn trình duyệt/đóng tab
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      // Người dùng quay lại tab của bạn
      updateUserPresence(safeUserId, role, true);
    } else {
      // Người dùng thu nhỏ trình duyệt, chuyển sang tab khác, hoặc đang đóng tab
      updateUserPresence(safeUserId, role, false);
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // 5. Trả về hàm Cleanup (Rất quan trọng khi dùng trong useEffect của React)
  return () => {
    console.log(`[Firebase] Dọn dẹp theo dõi trạng thái cho: ${safeUserId}`);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    updateUserPresence(safeUserId, role, false);
  };
};

/**
 * HÀM 3: Dừng theo dõi hoàn toàn (Chỉ dùng khi người dùng chủ động bấm Đăng xuất)
 */
export const stopPresenceTracking = (userId, role) => {
  const safeUserId = String(userId);
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  
  if (userId && safeUserId !== "undefined") {
    updateUserPresence(safeUserId, role, false);
    console.log(`[Firebase] Đã dừng theo dõi hoàn toàn cho: ${safeUserId}`);
  }
};