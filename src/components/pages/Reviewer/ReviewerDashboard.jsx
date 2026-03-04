import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, FolderOpen, Filter, FileText, Headphones, Image as ImageIcon, Loader2, Trophy, XCircle } from 'lucide-react';
import { useReviewerDashboard } from '../../../hooks/useReviewerDashboard';

const TYPE_ICONS = {
  text: <FileText size={16} className="text-blue-400" />,
  audio: <Headphones size={16} className="text-amber-400" />,
  image: <ImageIcon size={16} className="text-green-400" />,
};

const STATUS_STYLES = {
  Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Done: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const ACTION_STYLES = {
  Pending: { label: 'Kiểm duyệt', cls: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' },
  Done: { label: 'Xem lại', cls: 'bg-slate-700 hover:bg-slate-600 border border-slate-600' },
};

const STAT_CARDS = [
  { icon: FolderOpen, color: 'blue', label: 'Tổng Task', key: 'totalTasks' },
  { icon: CheckCircle2, color: 'green', label: 'Đã Duyệt', key: 'doneTasks' },
  { icon: XCircle, color: 'yellow', label: 'Chờ Duyệt', key: 'pendingTasks' },
];

const FILTERS = ['All', 'Pending', 'Done'];

const ReviewerDashboard = () => {
  const navigate = useNavigate();
  const { filteredTasks, isLoading, filter, setFilter, stats } = useReviewerDashboard();

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <Loader2 className="animate-spin w-8 h-8 mr-3" /> Đang tải dữ liệu...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Dashboard Kiểm Duyệt</h1>
        <button
          onClick={() => navigate('/reviewer/score')}
          className="flex items-center gap-4 bg-[#1e293b] border border-yellow-500/30 hover:border-yellow-500/60 p-3 pr-6 rounded-2xl transition-all shadow-lg shadow-yellow-500/10 group"
        >
          <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
            <Trophy size={28} />
          </div>
          <div className="text-left">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Điểm Tín Nhiệm</p>
            <p className="text-2xl font-black text-yellow-400">85 <span className="text-sm font-medium text-slate-500">pts</span></p>
          </div>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {STAT_CARDS.map(({ icon: Icon, color, label, key }) => (
          <div key={key} className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
            <div className={`p-4 bg-${color}-500/20 rounded-xl text-${color}-500`}><Icon size={28} /></div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{label}</p>
              <p className="text-3xl font-bold text-white">{stats[key]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-t-2xl p-4 flex items-center justify-between border-b-0">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Filter size={20} className="text-blue-400" /> Danh Sách Task
        </h2>
        <div className="flex gap-2">
          {FILTERS.map(status => (
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

      {/* Task Table */}
      <div className="bg-[#1e293b] border border-slate-700 rounded-b-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f172a]/50 text-slate-400 text-sm">
            <tr>
              {['Mã / Tên Task', 'Annotator', 'Trạng thái', 'Deadline', ''].map((h, i) => (
                <th key={i} className={`p-4 font-medium ${i === 4 ? 'text-right w-px' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? filteredTasks.map(task => {
              const action = ACTION_STYLES[task.status] ?? ACTION_STYLES.Pending;
              return (
                <tr key={task.id} className="border-t border-slate-700 hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-bold text-white mb-1">
                      {TYPE_ICONS[task.type] ?? TYPE_ICONS.image}
                      {task.name}
                    </div>
                    <p className="text-xs text-slate-400 pl-6">{task.id} • {task.project}</p>
                  </td>

                  <td className="p-4">
                    <p className="text-sm text-slate-300 font-medium">{task.annotator}</p>
                    <p className="text-xs text-slate-500">{task.submittedAt}</p>
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${STATUS_STYLES[task.status]}`}>
                      {task.status === 'Pending' ? 'Chờ duyệt' : 'Đã duyệt'}
                    </span>
                    {task.note && <p className="text-xs text-red-400 mt-2 font-medium">⚠️ {task.note}</p>}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Clock size={14} className="text-slate-500" />
                      {task.deadline}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => navigate(`/reviewer/workspace/${task.id}`)}
                      className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-lg ${action.cls}`}
                    >
                      {action.label}
                    </button>
                  </td>
                </tr>
              );
            }) : (
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

export default ReviewerDashboard;
