import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, FolderOpen, Filter, Clock } from 'lucide-react';

const AnnotatorDashboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const stats = { totalTasks: 12, completedTasks: 8, rejectedTasks: 1 };
  const mockTasks = [
    { 
      id: 'TASK-2026-001', 
      name: 'Gán nhãn xe cộ - Cam 01', 
      status: 'In Progress', 
      deadline: '2026-02-28', 
      totalImages: 100, 
      completedImages: 45,
      project: 'Traffic Vision AI' 
    },
    { 
      id: 'TASK-2026-002', 
      name: 'Biển báo giao thông - QL1A', 
      status: 'New', 
      deadline: '2026-03-05', 
      totalImages: 50, 
      completedImages: 0,
      project: 'Traffic Vision AI' 
    },
    { 
      id: 'TASK-2026-003', 
      name: 'Người đi bộ - Ngã tư X', 
      status: 'Rejected', 
      deadline: '2026-02-27', 
      totalImages: 30, 
      completedImages: 30, 
      project: 'Smart City',
      note: 'Gán nhầm biển báo thành xe cộ ở 5 ảnh cuối'
    },
    { 
      id: 'TASK-2026-004', 
      name: 'Xe máy - Bãi đỗ xe', 
      status: 'Done', 
      deadline: '2026-02-20', 
      totalImages: 200, 
      completedImages: 200,
      project: 'Smart City' 
    },
  ];

  const filteredTasks = mockTasks.filter(task => {
    if (filter === 'All') return true;
    return task.status === filter;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 rounded-xl text-blue-500"><FolderOpen size={28} /></div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Tổng Task</p>
            <p className="text-3xl font-bold text-white">{stats.totalTasks}</p>
          </div>
        </div>
        
        <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-green-500/20 rounded-xl text-green-500"><CheckCircle2 size={28} /></div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Task Hoàn Thành</p>
            <p className="text-3xl font-bold text-white">{stats.completedTasks}</p>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-red-500/20 rounded-xl text-red-500"><XCircle size={28} /></div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Task Bị Reject</p>
            <p className="text-3xl font-bold text-white">{stats.rejectedTasks}</p>
          </div>
        </div>
      </div>

      {/* Bộ lọc (Filter) */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-t-2xl p-4 flex items-center justify-between border-b-0">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter size={20} className="text-blue-400" /> Danh Sách Task
        </h2>
        <div className="flex gap-2">
          {['All', 'New', 'In Progress', 'Rejected', 'Done'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#0f172a] text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* List Task */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-b-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f172a]/50 text-slate-400 text-sm">
            <tr>
              <th className="p-4 font-medium">Mã / Tên Task</th>
              <th className="p-4 font-medium w-1/4">Tiến độ ảnh</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium">Deadline</th>
              <th className="p-4 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => {
                const progressPercent = Math.round((task.completedImages / task.totalImages) * 100);
                
                return (
                  <tr key={task.id} className="border-t border-slate-700 hover:bg-slate-800/50 transition-colors">
                    {/* Tên Task */}
                    <td className="p-4">
                      <p className="font-bold text-white">{task.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{task.id} • {task.project}</p>
                    </td>

                    {/* Tiến độ (Progress Bar) */}
                    <td className="p-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{task.completedImages} / {task.totalImages} ảnh</span>
                        <span className="text-blue-400 font-medium">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${task.status === 'Done' ? 'bg-green-500' : 'bg-blue-500'}`} 
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block
                        ${task.status === 'New' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                          task.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                          task.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                          'bg-green-500/20 text-green-400 border border-green-500/30'}`}
                      >
                        {task.status}
                      </span>
                      {task.note && <p className="text-xs text-red-400 mt-2 font-medium">⚠️ {task.note}</p>}
                    </td>

                    {/* Deadline */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-300">
                        <Clock size={14} className="text-slate-500" />
                        {task.deadline}
                      </div>
                    </td>

                    {/* Thao tác */}
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => navigate(`/annotator/workspace/${task.id}`)}
                        className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-lg shadow-blue-500/20"
                      >
                        {task.status === 'Done' ? 'Xem lại' : 'Vào làm'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  Không tìm thấy task nào với bộ lọc "{filter}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnnotatorDashboard;