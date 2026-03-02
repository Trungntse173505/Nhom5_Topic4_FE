// src/api/authApi.js

const BASE_URL =
  "https://swp-be-efc9d4and2d9fda3.japaneast-01.azurewebsites.net/api";

export const loginApi = async (email, password) => {
  const response = await fetch(`${BASE_URL}/Auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }), // Hỏi BE coi là email hay username nha
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Sai thông tin đăng nhập!");

  return data;
};
