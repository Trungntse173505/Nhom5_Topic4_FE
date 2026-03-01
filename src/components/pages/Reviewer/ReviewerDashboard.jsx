import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Ban, CheckCircle2, FolderKanban, LogOut, ThumbsDown, Trophy } from 'lucide-react';
import Toast from './Toast';
import QueuePanel from './QueuePanel';
import TaskDetailPanel from './TaskDetailPanel';

const STREAK_TARGET = 5;
const BONUS_POINTS = 10;
const DAILY_QUOTA = 20;

const seedTasks = [
  {
    id: 'RVW-10241',
    name: 'Street Scene - 001',
    project: 'Autonomous Driving',
    annotator: 'ngoc.tran',
    submittedAt: '2026-02-28T07:12:00.000Z',
    status: 'pending',
    type: 'image',
    disputed: true,
    guideline:
      'Label bounding boxes tightly. Use class names: Car, Person, TrafficSign. Do not include shadows. Minimum box size 8x8.',
    imageUrl: '/vite.svg',
    annotations: [
      { x: 70, y: 80, width: 160, height: 90, label: 'Car' },
      { x: 260, y: 120, width: 70, height: 130, label: 'Person' },
    ],
  },
  {
    id: 'RVW-10242',
    name: 'Warehouse - 014',
    project: 'Inventory Vision',
    annotator: 'minh.le',
    submittedAt: '2026-02-28T05:46:00.000Z',
    status: 'pending',
    type: 'image',
    disputed: false,
    guideline:
      'Mark all visible objects. Keep labels consistent. If object is partially occluded, still label if > 30% visible.',
    imageUrl: '/vite.svg',
    annotations: [{ x: 120, y: 170, width: 140, height: 85, label: 'Box' }],
  },
  {
    id: 'RVW-10218',
    name: 'Crosswalk - 032',
    project: 'Autonomous Driving',
    annotator: 'tuan.pham',
    submittedAt: '2026-02-27T14:20:00.000Z',
    status: 'approved',
    type: 'image',
    disputed: false,
    guideline:
      'Use tight boxes. People must include entire body (no cropping at limbs).',
    imageUrl: '/vite.svg',
    annotations: [{ x: 210, y: 95, width: 80, height: 150, label: 'Person' }],
    reviewedAt: '2026-02-27T18:02:00.000Z',
  },
  {
    id: 'RVW-10207',
    name: 'Road Signs - 008',
    project: 'Autonomous Driving',
    annotator: 'anh.nguyen',
    submittedAt: '2026-02-27T03:11:00.000Z',
    status: 'rejected',
    type: 'image',
    disputed: false,
    guideline:
      'Traffic signs must be labeled precisely. Do not merge multiple signs into one box.',
    imageUrl: '/vite.svg',
    annotations: [{ x: 140, y: 120, width: 120, height: 120, label: 'TrafficSign' }],
    reviewedAt: '2026-02-27T05:40:00.000Z',
    rejectNote:
      'Wrong label: traffic sign was labeled as Car. Please re-check class mapping.',
  },
  {
    id: 'RVW-10301',
    name: 'Customer Support Call - 002',
    project: 'Call Center QA',
    annotator: 'ha.vo',
    submittedAt: '2026-02-28T02:18:00.000Z',
    status: 'pending',
    type: 'audio',
    disputed: false,
    guideline:
      'Mark speaker turns and sensitive information. Verify timestamps and label correctness.',
    audioUrl: '',
    transcript:
      'Agent: Hello, how can I help you today?\nCustomer: My order arrived damaged...\nAgent: I\'m sorry to hear that. Let me check...',
    audioAnnotations: [
      { start: 0.0, end: 2.5, label: 'Greeting' },
      { start: 2.5, end: 7.8, label: 'Issue description' },
      { start: 7.8, end: 12.2, label: 'Resolution step' },
    ],
  },
  {
    id: 'RVW-10266',
    name: 'Product Review Text - 011',
    project: 'NLP Sentiment',
    annotator: 'linh.do',
    submittedAt: '2026-02-27T09:05:00.000Z',
    status: 'approved',
    type: 'text',
    disputed: false,
    guideline:
      'Highlight entities and assign sentiment label. Keep spans precise (no extra whitespace).',
    textContent:
      'The delivery was fast, but the packaging was damaged. Customer support was helpful.',
    textAnnotations: [
      { label: 'Sentiment', value: 'Mixed' },
      { label: 'Entity', value: 'delivery' },
      { label: 'Entity', value: 'packaging' },
      { label: 'Entity', value: 'customer support' },
    ],
    reviewedAt: '2026-02-27T12:10:00.000Z',
  },
];

const classColor = (label) => {
  switch (label) {
    case 'Car':
      return '#22c55e';
    case 'Person':
      return '#38bdf8';
    case 'TrafficSign':
      return '#f59e0b';
    default:
      return '#a78bfa';
  }
};

const qcCriteria = [
  { key: 'class', label: 'Đúng class (label)' },
  { key: 'region', label: 'Đúng vùng (bbox/area)' },
  { key: 'format', label: 'Đúng format & quy ước' },
  { key: 'missing', label: 'Không thiếu object quan trọng' },
  { key: 'consistency', label: 'Nhất quán theo guideline' },
];

const rejectTemplates = [
  { key: 'misaligned', label: 'Misaligned boxes', value: 'Bounding boxes bị lệch/không bám sát vật thể.' },
  { key: 'wrong_label', label: 'Wrong label', value: 'Sai class/nhãn (label) so với guideline.' },
  { key: 'missing', label: 'Missing objects', value: 'Thiếu object quan trọng cần được gán nhãn.' },
  { key: 'format', label: 'Invalid format', value: 'Sai format/quy ước đặt tên/định dạng nhãn.' },
  { key: 'low_quality', label: 'Low quality', value: 'Chất lượng gán nhãn chưa đạt (cần rà soát lại toàn bộ).' },
];

const formatDateTime = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

// NOTE: Toast, TaskCard, KonvaPreview were extracted into `./components/*.jsx`.

const ReviewerDashboard = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState(seedTasks);
  const [tab, setTab] = useState('pending'); // pending | reviewed
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(seedTasks[0]?.id || null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const [reviewerScore, setReviewerScore] = useState(92);
  const [streak, setStreak] = useState(3);
  const [actionsToday, setActionsToday] = useState(18);

  const [rejectMode, setRejectMode] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const [qcState, setQcState] = useState(() => {
    const initial = {};
    for (const t of seedTasks) {
      initial[t.id] = {
        class: true,
        region: true,
        format: true,
        missing: true,
        consistency: true,
      };
    }
    return initial;
  });

  const quotaReached = actionsToday >= DAILY_QUOTA;

  const projects = useMemo(() => {
    const set = new Set(tasks.map((t) => t.project));
    return ['All', ...Array.from(set)];
  }, [tasks]);

  const selectedTask = useMemo(() => tasks.find((t) => t.id === selectedId) || null, [selectedId, tasks]);

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const approved = tasks.filter((t) => t.status === 'approved').length;
    const rejected = tasks.filter((t) => t.status === 'rejected').length;
    return { pending, approved, rejected };
  }, [tasks]);

  const listTasks = useMemo(() => {
    const base =
      tab === 'pending'
        ? tasks.filter((t) => t.status === 'pending')
        : tasks.filter((t) => t.status !== 'pending');

    return base
      .filter((t) => (projectFilter === 'All' ? true : t.project === projectFilter))
      .filter((t) => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Disputed') return t.status === 'pending' && t.disputed;
        return t.status === statusFilter.toLowerCase();
      })
      .filter((t) => {
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          t.annotator.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [projectFilter, query, statusFilter, tab, tasks]);

  useEffect(() => {
    if (!selectedId && listTasks[0]) setSelectedId(listTasks[0].id);
  }, [listTasks, selectedId]);

  useEffect(() => {
    if (selectedTask && !listTasks.some((t) => t.id === selectedTask.id)) {
      setSelectedId(listTasks[0]?.id || null);
    }
  }, [listTasks, selectedTask]);

  useEffect(() => {
    const disputed = tasks.find((t) => t.status === 'pending' && t.disputed);
    if (disputed) {
      setToast({
        type: 'danger',
        title: 'Task bị khiếu nại',
        message: `${disputed.id} • ${disputed.name} đang có khiếu nại. Ưu tiên kiểm tra kỹ guideline và vùng nhãn.`,
      });
    }
  }, [tasks]);

  useEffect(() => {
    setRejectMode(false);
    setRejectNote('');
  }, [selectedId]);

  const showToast = (next) => {
    setToast(next);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const allQcChecked = useMemo(() => {
    if (!selectedTask) return false;
    const s = qcState[selectedTask.id] || {};
    return qcCriteria.every((c) => Boolean(s[c.key]));
  }, [qcState, selectedTask]);

  const updateQc = (key, value) => {
    if (!selectedTask) return;
    setQcState((prev) => ({
      ...prev,
      [selectedTask.id]: {
        ...prev[selectedTask.id],
        [key]: value,
      },
    }));
  };

  const handleApprove = () => {
    if (!selectedTask) return;
    if (quotaReached) {
      showToast({
        type: 'danger',
        title: 'Đã đạt quota hôm nay',
        message: `Bạn đã duyệt ${actionsToday}/${DAILY_QUOTA} task hôm nay. Vui lòng quay lại sau.`,
      });
      return;
    }
    if (!allQcChecked) {
      showToast({
        type: 'info',
        title: 'Thiếu checklist QC',
        message: 'Vui lòng tick đầy đủ checklist chất lượng trước khi Approve.',
      });
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? { ...t, status: 'approved', reviewedAt: new Date().toISOString(), rejectNote: '' }
          : t
      )
    );

    setActionsToday((v) => v + 1);
    setReviewerScore((v) => v + 2);

    if (!selectedTask.disputed) {
      setStreak((v) => {
        const next = v + 1;
        if (next >= STREAK_TARGET) {
          setReviewerScore((s) => s + BONUS_POINTS);
          showToast({
            type: 'success',
            title: 'Thưởng streak',
            message: `Bạn đạt ${STREAK_TARGET} task liên tiếp không khiếu nại. +${BONUS_POINTS} điểm tín nhiệm!`,
          });
          return 0;
        }
        return next;
      });
    } else {
      setStreak(0);
    }

    showToast({
      type: 'success',
      title: 'Approve thành công',
      message: `Task ${selectedTask.id} đã được duyệt và chuyển sang Reviewed.`,
    });

    const next = listTasks.find((t) => t.id !== selectedTask.id);
    if (next) setSelectedId(next.id);
  };

  const handleReject = () => {
    if (!selectedTask) return;
    if (quotaReached) {
      showToast({
        type: 'danger',
        title: 'Đã đạt quota hôm nay',
        message: `Bạn đã duyệt ${actionsToday}/${DAILY_QUOTA} task hôm nay. Không thể Reject task mới.`,
      });
      return;
    }

    if (!rejectMode) {
      setRejectMode(true);
      showToast({
        type: 'info',
        title: 'Nhập lý do Reject',
        message: 'Vui lòng nhập ghi chú chi tiết (bắt buộc) và có thể chọn template nhanh.',
      });
      return;
    }

    if (!rejectNote.trim()) {
      showToast({
        type: 'danger',
        title: 'Thiếu ghi chú',
        message: 'Reject yêu cầu ghi chú chi tiết lý do từ chối.',
      });
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedTask.id
          ? { ...t, status: 'rejected', reviewedAt: new Date().toISOString(), rejectNote: rejectNote.trim() }
          : t
      )
    );
    setActionsToday((v) => v + 1);
    setReviewerScore((v) => Math.max(0, v - 1));
    setStreak(0);

    showToast({
      type: 'danger',
      title: 'Đã Reject',
      message: `Ghi chú đã được gửi cho Annotator (${selectedTask.annotator}). Task chuyển sang Reviewed.`,
    });

    const next = listTasks.find((t) => t.id !== selectedTask.id);
    if (next) setSelectedId(next.id);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('auth');
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Reviewer Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Review queue • QC checklist • Feedback • Approve/Reject</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-[#0f172a] border border-slate-700 hover:border-slate-600 text-slate-200 px-4 py-3 rounded-2xl transition-all"
          >
            <LogOut size={18} className="text-slate-400" />
            <span className="text-sm font-semibold">Logout</span>
          </button>

          <div className="bg-[#1e293b] border border-yellow-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-yellow-500/10">
            <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
              <Trophy size={26} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Điểm tín nhiệm</p>
              <p className="text-2xl font-black text-yellow-400">
                {reviewerScore} <span className="text-sm font-medium text-slate-500">pts</span>
              </p>
            </div>
          </div>

          <div className="bg-[#1e293b] border border-slate-700 p-4 rounded-2xl flex-1 min-w-[260px]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <BadgeCheck size={18} className="text-green-300" />
                Streak không khiếu nại
              </p>
              <p className="text-xs text-slate-400 font-semibold">
                +{BONUS_POINTS} pts / {STREAK_TARGET} tasks
              </p>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">
                  Hiện tại: <span className="text-white font-bold">{streak}</span> / {STREAK_TARGET}
                </span>
                <span className="text-blue-300 font-semibold">{Math.round((streak / STREAK_TARGET) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${Math.min(100, (streak / STREAK_TARGET) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {quotaReached && (
        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
          <Ban className="text-red-300 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-semibold text-white">Đã đạt hạn mức duyệt trong ngày</p>
            <p className="text-xs text-slate-300 mt-1">
              Bạn đã sử dụng {actionsToday}/{DAILY_QUOTA} lượt. Nút Approve/Reject sẽ bị vô hiệu hóa cho task mới.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-blue-500/20 rounded-xl text-blue-400">
            <FolderKanban size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Pending Tasks</p>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-green-500/20 rounded-xl text-green-400">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Approved Tasks</p>
            <p className="text-3xl font-bold text-white">{stats.approved}</p>
          </div>
        </div>

        <div className="bg-[#1e293b] border border-slate-700 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-red-500/20 rounded-xl text-red-400">
            <ThumbsDown size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Rejected Tasks</p>
            <p className="text-3xl font-bold text-white">{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5">
          <QueuePanel
            tab={tab}
            setTab={setTab}
            actionsToday={actionsToday}
            dailyQuota={DAILY_QUOTA}
            projects={projects}
            projectFilter={projectFilter}
            setProjectFilter={setProjectFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            query={query}
            setQuery={setQuery}
            listTasks={listTasks}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            formatDateTime={formatDateTime}
          />
        </div>

        <div className="xl:col-span-7">
          <TaskDetailPanel
            selectedTask={selectedTask}
            listTasks={listTasks}
            setSelectedId={setSelectedId}
            formatDateTime={formatDateTime}
            classColor={classColor}
            qcCriteria={qcCriteria}
            qcState={qcState}
            updateQc={updateQc}
            allQcChecked={allQcChecked}
            rejectTemplates={rejectTemplates}
            rejectMode={rejectMode}
            setRejectMode={setRejectMode}
            rejectNote={rejectNote}
            setRejectNote={setRejectNote}
            handleApprove={handleApprove}
            handleReject={handleReject}
            quotaReached={quotaReached}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewerDashboard;
