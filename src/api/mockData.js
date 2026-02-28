export const mockTasks = [
  { id: 'TASK-2026-001', name: 'Gán nhãn xe cộ - Cam 01', type: 'image', status: 'New', deadline: '2026-03-05', totalImages: 100, project: 'Traffic Vision AI' },
  { id: 'TASK-2026-002', name: 'Phân loại bình luận MXH', type: 'text', status: 'In Progress', deadline: '2026-02-28', totalImages: 50, doneImages: 20, rejectedImages: 0, project: 'Social Sentiment' },
  { id: 'TASK-2026-003', name: 'Ghi âm cuộc gọi CSKH', type: 'audio', status: 'Rejected', deadline: '2026-02-27', totalImages: 30, doneImages: 25, rejectedImages: 5, project: 'Call Center AI', note: 'Gõ sai chính tả ở 5 file cuối' },
];

export const mockTaskFiles = {
  'TASK-2026-001': [
    { id: 'IMG_0001', ext: '.jpg', status: 'Done', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000' },
    { id: 'IMG_0002', ext: '.jpg', status: 'Pending', url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1000' },
    { id: 'IMG_0003', ext: '.jpg', status: 'Pending', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1000' },
  ],
  'TASK-2026-002': [
    { id: 'DOC_0001', ext: '.txt', status: 'Done', content: 'Hôm nay giao thông trên tuyến đường Nguyễn Trãi rất ùn tắc do va chạm giữa xe máy và xe tải.' },
    { id: 'DOC_0002', ext: '.txt', status: 'Pending', content: 'Thời tiết hôm nay nắng nóng gay gắt, nhiệt độ ngoài trời lên tới 38 độ C, mọi người nên hạn chế ra đường.' },
    { id: 'DOC_0003', ext: '.txt', status: 'Rejected', note: 'Bôi đen thiếu từ khóa', content: 'Giá xăng ngày mai dự kiến sẽ tăng mạnh theo đà tăng của giá dầu thế giới, đạt mức kỷ lục mới.' },
  ],
  'TASK-2026-003': [
    { id: 'CALL_001', ext: '.mp3', status: 'Done', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'CALL_002', ext: '.mp3', status: 'Rejected', note: 'Sai chính tả đoạn đầu', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'CALL_003', ext: '.mp3', status: 'Pending', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  ]
};