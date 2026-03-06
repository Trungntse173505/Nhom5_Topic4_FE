import React from "react";

export default function DisputeResolution() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dispute Resolution</h1>
        <p className="text-sm text-gray-400 mt-1">
          Resolve conflicts between Annotators and Reviewers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hàng chờ Dispute */}
        <div className="lg:col-span-1 rounded-xl border border-white/5 bg-[#151D2F] p-5 shadow-sm">
          <h2 className="text-base font-semibold text-white mb-4">
            Pending Disputes (3)
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${item === 1 ? "border-blue-500/50 bg-blue-500/5" : "border-white/5 bg-[#1E293B] hover:border-white/20"}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-white">
                    Task #IMG_0{item}42
                  </span>
                  <span className="text-xs text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded">
                    Disputed
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Annotator: Sarah • Reviewer: Mike
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chi tiết phân xử */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#151D2F] p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">
              Task #IMG_0142 Details
            </h2>
            <button className="text-sm text-blue-400 hover:text-blue-300">
              View Source Image ↗
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 flex-1">
            {/* Lập luận của Reviewer */}
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
              <h3 className="text-sm font-medium text-rose-400 mb-2">
                Reviewer Rejection (Mike)
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                "Bounding box is too loose around the vehicle. Please tighten it
                according to guideline #1."
              </p>
            </div>

            {/* Lập luận của Annotator */}
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <h3 className="text-sm font-medium text-blue-400 mb-2">
                Annotator Appeal (Sarah)
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                "The shadow of the vehicle is part of the object based on the
                updated guideline from yesterday. I believe this is correct."
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 border-t border-white/5 pt-6 mt-auto">
            <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-colors">
              Approve Dispute (Annotator Wins)
            </button>
            <button className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-lg font-medium transition-colors">
              Reject Dispute (Reviewer Wins)
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Approving will restore Sarah's score and deduct 10 points from Mike.
          </p>
        </div>
      </div>
    </div>
  );
}
