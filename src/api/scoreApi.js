import axiosClient from "./axiosClient";

const scoreApi = {
  // Gọi API lấy danh sách điểm của tất cả user
  getAllScores: () => axiosClient.get("/api/Score"),
};

export default scoreApi;
