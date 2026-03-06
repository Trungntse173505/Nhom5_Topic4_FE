import { useState, useMemo } from 'react';

const mockTasks = [
  {
    id: 'RVW-001',
    name: 'Street Scene - 001',
    project: 'Autonomous Driving',
    annotator: 'ngoc.tran',
    submittedAt: '28/02/2026 07:12',
    deadline: '01/03/2026',
    type: 'image',
    status: 'Pending',
    note: '',
  },
  {
    id: 'RVW-002',
    name: 'Warehouse - 014',
    project: 'Inventory Vision',
    annotator: 'minh.le',
    submittedAt: '28/02/2026 05:46',
    deadline: '02/03/2026',
    type: 'image',
    status: 'Pending',
    note: '',
  },
  {
    id: 'RVW-003',
    name: 'Customer Support Call - 002',
    project: 'Call Center QA',
    annotator: 'ha.vo',
    submittedAt: '27/02/2026 02:18',
    deadline: '01/03/2026',
    type: 'audio',
    status: 'Done',
    note: '',
  },
  {
    id: 'RVW-004',
    name: 'Product Review Text - 011',
    project: 'NLP Sentiment',
    annotator: 'linh.do',
    submittedAt: '27/02/2026 09:05',
    deadline: '03/03/2026',
    type: 'text',
    status: 'Done',
    note: 'Cần xem lại nhãn sentiment',
  },
];

export const useReviewerDashboard = () => {
  const [filter, setFilter] = useState('All');

  const filteredTasks = useMemo(() => {
    if (filter === 'All') return mockTasks;
    return mockTasks.filter((t) => t.status === filter);
  }, [filter]);

  const stats = useMemo(() => ({
    totalTasks: mockTasks.length,
    doneTasks: mockTasks.filter((t) => t.status === 'Done').length,
    pendingTasks: mockTasks.filter((t) => t.status === 'Pending').length,
  }), []);

  return { filteredTasks, isLoading: false, filter, setFilter, stats };
};
