import React, { useState, useEffect } from "react";
import SidebarLayout from "../../common/SidebarLayout";
// Sếp nhớ check lại đường dẫn import authApi này cho chuẩn thư mục dự án nha
import authApi from "../../../api/authApi";

const menuItems = [
  { path: "/reviewer", label: "Dashboard", icon: "🔍" },
  { path: "/reviewer/disputes", label: "Khiếu Nại", icon: "⚖️" }, 
  { path: "/reviewer/credit-score", label: "Điểm Tín Nhiệm", icon: "🏆" },
];

export default function ReviewerLayout() {
  // 1. Tạo state để lưu thông tin user, gán giá trị mặc định ban đầu
  const [userInfo, setUserInfo] = useState({
    name: "Đang tải...",
    email: "",
    avatar: "R",
    color: "bg-purple-500",
  });

  // 2. Gọi API ngay khi Layout vừa được render
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getMe();

        // axiosClient thường bọc data trong response.data, tui bắt cả 2 trường hợp cho chắc
        const data = response.data || response;

        // Lấy chữ cái đầu làm Avatar (VD: "Nguyễn" -> "N")
        const firstLetter = data.fullName
          ? data.fullName.charAt(0).toUpperCase()
          : "R";

        // Cập nhật lại state với data xịn từ API
        setUserInfo({
          name: data.fullName || "Reviewer",
          email: data.email || "",
          avatar: firstLetter,
          color: "bg-purple-500",
        });

        // 3. Móc luôn cái điểm tín nhiệm ném vào localStorage cho trang Dashboard xài
        if (data.score !== undefined) {
          localStorage.setItem("reviewerScore", data.score);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin Reviewer:", error);
        // Lỡ mạng lag hay lỗi API thì trả về mặc định cho đỡ trống Layout
        setUserInfo({
          name: "Reviewer",
          email: "",
          avatar: "R",
          color: "bg-purple-500",
        });
      }
    };

    fetchUser();
  }, []);

  return (
    <SidebarLayout
      menuItems={menuItems}
      title="LabelMaster"
      menuLabel="Menu"
      basePath="/reviewer"
      userInfo={userInfo} // Truyền cái state đã gọi API vào đây
    />
  );
}