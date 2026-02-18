import React from "react";

export default function AdminOverview() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-sm text-gray-400 mt-1">
          System statistics and overview
        </p>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Total Users</h3>
          <p className="text-4xl font-bold text-white mt-3 mb-6">0</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full"></div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Projects</h3>
          <p className="text-4xl font-bold text-[#3B82F6] mt-3 mb-6">0</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full"></div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Active Tasks</h3>
          <p className="text-4xl font-bold text-[#10B981] mt-3 mb-6">0</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full"></div>
        </div>
        <div className="rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm">
          <h3 className="text-gray-400 text-sm font-medium">Storage (GB)</h3>
          <p className="text-4xl font-bold text-[#A855F7] mt-3 mb-6">0 / 50</p>
          <div className="w-full bg-[#0B1120] h-1.5 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
