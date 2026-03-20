//Config.jsx
import React from 'react';
import { FileText, Headphones, Image as ImageIcon, FolderOpen, CheckCircle2, XCircle } from 'lucide-react';

export const TYPE_ICONS = {
  text: <FileText size={16} className="text-blue-400" />,
  audio: <Headphones size={16} className="text-amber-400" />,
  image: <ImageIcon size={16} className="text-green-400" />,
  video: <ImageIcon size={16} className="text-purple-400" />,
};

export const STATUS_NAME = {
  New: 'Mới',
  InProgress: 'Đang Thực Hiện',
  PendingReview: 'Đang Duyệt',
  Rejected: 'Từ Chối',
  Approved: 'Hoàn Thành',
};

export const STATUS_STYLES = {
  New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  InProgress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PendingReview: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  Approved: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export const ACTION_STYLES = {
  New: { label: 'Bắt đầu', cls: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' },
  Rejected: { label: 'Sửa lỗi', cls: 'bg-red-600 hover:bg-red-500 shadow-red-500/20' },
  Done: { label: 'Xem lại', cls: 'bg-slate-700 hover:bg-slate-600 border border-slate-600' },
  default: { label: 'Tiếp tục', cls: 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20' },
};

export const STAT_CARDS = [
  { icon: FolderOpen, color: 'blue', label: 'Tổng Nhiệm Vụ', key: 'totalTasks' },
  { icon: CheckCircle2, color: 'green', label: 'Nhiệm Vụ Hoàn Thành', key: 'completedTasks' },
  { icon: XCircle, color: 'red', label: 'Nhiệm Vụ Bị Từ Chối', key: 'rejectedTasks' },
];

export const FILTERS = [
  { name: "Tất cả", status: "All" },
  { name: "Mới", status: "New" },
  { name: "Đang Thực Hiện", status: "InProgress" },
  { name: "Đang duyệt", status: "PendingReview" },
  { name: "Từ Chối", status: "Rejected" },
  { name: "Hoàn Thành", status: "Approved" }
];