import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, FolderOpen, Filter, Clock, Trophy, FileText, Headphones, Image as ImageIcon, Loader2 } from 'lucide-react';

// Import các Hook API
import { useTasks } from '../../../hooks/Annotator/useTasks';
import { useReputation } from '../../../hooks/Annotator/useReputation';
import { useStartTask } from '../../../hooks/Annotator/useStartTask';
import { useResubmitTask } from '../../../hooks/Annotator/useResubmitTask';
import { useDisputeTask } from '../../../hooks/Annotator/useDisputeTask';

// Import Modal Khiếu nại
import DisputeModal from './Workspace/DisputeModal';

const TYPE_ICONS = {
  text: <FileText size={16} className="text-blue-400" />,
  audio: <Headphones size={16} className="text-amber-400" />,
  image: <ImageIcon size={16} className="text-green-400" />,
  video: <ImageIcon size={16} className="text-purple-400" />, // Có thể đổi icon video nếu muốn
};

const STATUS_STYLES = {
  New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  InProgress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PendingReview: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  Done: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const ACTION_STYLES = {
  New: { label: 'Bắt đầu', cls: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' },
  Rejected: { label: 'Sửa lỗi ngay', cls: 'bg-red-600 hover:bg-red-500 shadow-red-500/20' },
  Done: { label: 'Xem lại', cls: 'bg-slate-700 hover:bg-slate-600 border border-slate-600' },
  default: { label: 'Tiếp tục', cls: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20' },
};

const STAT_CARDS = [
  { icon: FolderOpen, color: 'blue', label: 'Tổng Gói Task', key: 'totalTasks' },
  { icon: CheckCircle2, color: 'green', label: 'Task Hoàn Thành', key: 'completedTasks' },
  { icon: XCircle, color: 'red', label: 'Task Bị Reject', key: 'rejectedTasks' },
];

const FILTERS = ['All', 'New', 'InProgress', 'PendingReview', 'Rejected', 'Done'];

const AnnotatorDashboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  
  // State cho Modal Khiếu Nại
  const [disputeTaskData, setDisputeTaskData] = useState(null);

  // Gọi các Hook API
  const { tasks, loading: loadingTasks, refresh: refreshTasks } = useTasks(null);
  const { currentScore, loading: loadingRep } = useReputation();
  const { start, isStarting } = useStartTask();
  const { resubmit, isResubmitting } = useResubmitTask();
  const { dispute } = useDisputeTask();

  const isLoading = loadingTasks || loadingRep;

  const filteredTasks = useMemo(() => {
    if (filter === 'All') return tasks;
    return tasks.filter(t => t.status === filter);
  }, [tasks, filter]);

  const stats = useMemo(() => ({
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'Done').length,
    rejectedTasks: tasks.filter(t => t.status === 'Rejected').length,
  }), [tasks]);

  // --- XỬ LÝ CLICK NÚT CHÍNH ---
  const handleActionClick = async (task) => {
    // Lấy type từ API, nếu không có mặc định là 'image'
    const taskType = task.type || 'image'; 

    if (task.status === 'New') {
      try {
        await start(task.taskID);
        // Chuyển hướng kèm theo type trên URL
        navigate(`/annotator/workspace/${task.taskID}?type=${taskType}`);
      } catch (err) {
        alert("Không thể bắt đầu Task này. Vui lòng thử lại!");
      }
    } else {
      // Chuyển hướng kèm theo type trên URL
      navigate(`/annotator/workspace/${task.taskID}?type=${taskType}`);
    }
  };

  // --- XỬ LÝ NỘP LẠI (RESUBMIT) ---
  const handleResubmit = async (task) => {
    if (task.currentRound >= 3) {
      alert("Bạn đã hết lượt nộp lại (Tối đa 3 lần) cho Task này.");
      return;
    }
    const isConfirm = window.confirm(`Bạn có chắc chắn muốn nộp lại Task này không? (Lần nộp thứ ${task.currentRound + 1}/3)`);
    if (isConfirm) {
      try {
        await resubmit(task.taskID);
        alert("Đã nộp lại bài thành công! Vui lòng chờ Reviewer chấm điểm.");
        refreshTasks(); // Tải lại danh sách Task
      } catch (err) {
        alert(err?.response?.data || "Không thể nộp lại bài. Vui lòng kiểm tra xem bạn đã sửa hết lỗi chưa.");
      }
    }
  };

  // --- XỬ LÝ KHIẾU NẠI (DISPUTE) ---
  const handleDisputeSubmit = async (reason) => {
    try {
      await dispute(disputeTaskData.taskID, reason);
      alert("Đã gửi khiếu nại thành công! Quản lý sẽ xem xét lại kết quả của bạn.");
      refreshTasks(); // Tải lại danh sách
    } catch (err) {
      alert(err?.response?.data || "Không thể gửi khiếu nại lúc này.");
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
      <Loader2 className="animate-spin w-8 h-8 mr-3" /> Đang tải dữ liệu từ Server...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8 relative">
      {/* Nhúng Modal Khiếu nại vào đây */}
      <DisputeModal 
        isOpen={!!disputeTaskData} 
        onClose={() => setDisputeTaskData(null)}
        onSubmit={handleDisputeSubmit}
        taskName={disputeTaskData?.taskName}
      />

      {/* Header & Stats (Giữ nguyên như cũ) */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Dashboard Quản Lý Nhiệm Vụ</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/annotator/score')}
            className="flex items-center gap-4 bg-[#1e293b] border border-yellow-500/30 hover:border-yellow-500/60 p-3 pr-6 rounded-2xl transition-all shadow-lg shadow-yellow-500/10 group"
          >
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
              <Trophy size={28} />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Điểm Tín Nhiệm</p>
              <p className="text-2xl font-black text-yellow-400">{currentScore} <span className="text-sm font-medium text-slate-500">pts</span></p>
            </div>
          </button>
        </div>
      </div>

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

      <div className="bg-[#1e293b] border border-slate-700 rounded-b-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0f172a]/50 text-slate-400 text-sm">
            <tr>
              {['Mã / Tên Task', 'Vòng Lặp', 'Trạng thái', 'Deadline', 'Hành động'].map((h, i) => (
                <th key={i} className={`p-4 font-medium ${i === 4 ? 'text-right' : i === 1 ? 'w-1/4' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? filteredTasks.map(task => {
              const action = ACTION_STYLES[task.status] ?? ACTION_STYLES.default;
              // Lấy icon theo loại task động
              const IconType = TYPE_ICONS[task.type] || TYPE_ICONS.image;

              return (
                <tr key={task.taskID} className="border-t border-slate-700 hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-bold text-white mb-1">
                      {IconType}
                      {task.taskName}
                    </div>
                    <p className="text-xs text-slate-400 pl-6 text-ellipsis overflow-hidden w-48">{task.taskID}</p>
                  </td>

                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-400">
                      Lần nộp thứ: <span className="text-white font-bold">{task.currentRound}/3</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${STATUS_STYLES[task.status]}`}>
                      {task.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Clock size={14} className="text-slate-500" />
                      {new Date(task.deadline).toLocaleDateString('vi-VN')}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => handleActionClick(task)}
                        disabled={isStarting}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all shadow-lg disabled:opacity-50 min-w-[120px] text-center ${action.cls}`}
                      >
                        {action.label}
                      </button>
                      
                      {/* HIỂN THỊ THÊM NÚT NỘP LẠI & KHIẾU NẠI NẾU BỊ REJECT */}
                      {task.status === 'Rejected' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleResubmit(task)} 
                            disabled={isResubmitting}
                            className="text-xs bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded text-white font-medium"
                          >
                            Gửi nộp lại
                          </button>
                          <button 
                            onClick={() => setDisputeTaskData(task)} 
                            className="text-xs bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded text-white font-medium"
                          >
                            Khiếu nại
                          </button>
                        </div>
                      )}
                    </div>
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

export default AnnotatorDashboard;