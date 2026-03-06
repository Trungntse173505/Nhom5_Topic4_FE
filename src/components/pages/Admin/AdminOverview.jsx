import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../../../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";

// Nếu lastActive quá 45s → coi là offline
const OFFLINE_THRESHOLD_MS = 45 * 1000;

export default function AdminOverview() {
  const [onlineNowData, setOnlineNowData] = useState({
    total: 0,
    byRole: { admins: 0, annotators: 0, managers: 0, reviewers: 0 },
  });

  const [onlineTodayData, setOnlineTodayData] = useState({
    total: 0,
    byRole: { admins: 0, annotators: 0, managers: 0, reviewers: 0 },
  });

  // Lưu raw docs để interval có thể re-evaluate timeout
  const rawDocsRef = useRef([]);
  // Hàm tính toán lại từ raw docs với thời gian hiện tại
  const recalculate = useCallback(() => {
    const docs = rawDocsRef.current;

    let nowTotal = 0, nowAdmins = 0, nowAnnotators = 0, nowManagers = 0, nowReviewers = 0;
    let todayTotal = 0, todayAdmins = 0, todayAnnotators = 0, todayManagers = 0, todayReviewers = 0;

    const now = new Date();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const offlineCutoff = new Date(now.getTime() - OFFLINE_THRESHOLD_MS);

    docs.forEach((data) => {
      const role = data.role?.toLowerCase() || "";
      const status = data.status?.toLowerCase() || "";
      const lastActiveDate = data.lastActive ? data.lastActive.toDate() : new Date(0);
      // ĐANG ONLINE = status "online" VÀ lastActive trong vòng 1 phút
      // Tắt browser → heartbeat dừng → lastActive cũ quá 1 phút → tự offline
      const isReallyOnline = status === "online" && lastActiveDate >= offlineCutoff;

      if (isReallyOnline) {
        nowTotal++;
        if (role === "admin") nowAdmins++;
        else if (role === "manager") nowManagers++;
        else if (role === "reviewer") nowReviewers++;
        else if (role === "annotator") nowAnnotators++;
      }

      // HOẠT ĐỘNG HÔM NAY
      if (lastActiveDate >= startOfToday) {
        todayTotal++;
        if (role === "admin") todayAdmins++;
        else if (role === "manager") todayManagers++;
        else if (role === "reviewer") todayReviewers++;
        else if (role === "annotator") todayAnnotators++;
      }
    });

    setOnlineNowData({
      total: nowTotal,
      byRole: { admins: nowAdmins, annotators: nowAnnotators, managers: nowManagers, reviewers: nowReviewers },
    });

    setOnlineTodayData({
      total: todayTotal,
      byRole: { admins: todayAdmins, annotators: todayAnnotators, managers: todayManagers, reviewers: todayReviewers },
    });
  }, []);

  useEffect(() => {
    const presenceRef = collection(db, "presence");
    // Real-time listener: khi Firestore data thay đổi
    const unsubscribe = onSnapshot(
      presenceRef,
      (snapshot) => {
        const docs = [];
        snapshot.forEach((doc) => docs.push(doc.data()));
        rawDocsRef.current = docs;
        recalculate();
      },
      (error) => console.error("Lỗi Real-time:", error)
    );
    // RE-CHECK mỗi 15 giây để phát hiện timeout
    // onSnapshot chỉ fire khi data thay đổi, nhưng timeout phải tính theo thời gian hiện tại
    const recheckInterval = setInterval(() => {
      recalculate();
    }, 15000);

    return () => {
      unsubscribe();
      clearInterval(recheckInterval);
    };
  }, [recalculate]);

  const renderRoleRow = (label, count, dotColor) => {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${dotColor} shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
          <span className="text-sm text-gray-300 font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">{count}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Users</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight italic uppercase">THỐNG KÊ TRUY CẬP</h1>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CARD 1: CURRENTLY ACTIVE */}
        <div className="rounded-3xl border border-white/5 bg-[#0F172A] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="relative z-10">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Hiện đang hoạt động</h3>
            <div className="flex items-baseline gap-3 mb-10">
              <p className="text-7xl font-black text-white tracking-tighter">{onlineNowData.total}</p>
              <span className="text-emerald-500 font-black text-xs uppercase tracking-widest">Users</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {renderRoleRow("Admin", onlineNowData.byRole.admins, "bg-emerald-500")}
              {renderRoleRow("Manager", onlineNowData.byRole.managers, "bg-teal-400")}
              {renderRoleRow("Reviewer", onlineNowData.byRole.reviewers, "bg-cyan-400")}
              {renderRoleRow("Annotator", onlineNowData.byRole.annotators, "bg-sky-400")}
            </div>
          </div>
        </div>

        {/* CARD 2: ACTIVE TODAY */}
        <div className="rounded-3xl border border-white/5 bg-[#0F172A] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="relative z-10">
            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Hoạt động hôm nay</h3>
            <div className="flex items-baseline gap-3 mb-10">
              <p className="text-7xl font-black text-white tracking-tighter">{onlineTodayData.total}</p>
              <span className="text-blue-500 font-black text-xs uppercase tracking-widest">Users</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {renderRoleRow("Admin", onlineTodayData.byRole.admins, "bg-blue-600")}
              {renderRoleRow("Manager", onlineTodayData.byRole.managers, "bg-blue-500")}
              {renderRoleRow("Reviewer", onlineTodayData.byRole.reviewers, "bg-blue-400")}
              {renderRoleRow("Annotator", onlineTodayData.byRole.annotators, "bg-blue-300")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}