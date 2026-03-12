import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDLF3OWcdFbLOo_GjHR5gjE-c5yoHRXfsM",
  authDomain: "nhom5topicfe.firebaseapp.com",
  projectId: "nhom5topicfe",
  storageBucket: "nhom5topicfe.firebasestorage.app",
  messagingSenderId: "266003184159",
  appId: "1:266003184159:web:416f73983ecf9a0720732a",
  measurementId: "G-301EM7BDJ2",
};
// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
