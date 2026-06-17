import { Booking } from '@/types/golf';

const formatDate = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const mockBookings: Booking[] = [
  {
    id: 'booking_001',
    memberId: 'member_001',
    memberName: '陈先生',
    date: formatDate(0),
    timeSlotId: 'slot_8_0',
    startTime: '08:00',
    endTime: '08:30',
    courseId: 'course_01',
    courseName: 'A场 - 湖畔球场',
    caddieId: 'caddie_01',
    caddieName: '张伟',
    playerCount: 4,
    holes: 18,
    hasCaddie: true,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    billId: 'bill_001'
  },
  {
    id: 'booking_002',
    memberId: 'member_001',
    memberName: '陈先生',
    date: formatDate(1),
    timeSlotId: 'slot_9_30',
    startTime: '09:30',
    endTime: '10:00',
    courseId: 'course_02',
    courseName: 'B场 - 山景球场',
    caddieId: 'caddie_04',
    caddieName: '陈静',
    playerCount: 3,
    holes: 18,
    hasCaddie: true,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    billId: 'bill_002'
  },
  {
    id: 'booking_003',
    memberId: 'member_001',
    memberName: '陈先生',
    date: formatDate(-3),
    timeSlotId: 'slot_7_0',
    startTime: '07:00',
    endTime: '07:30',
    courseId: 'course_03',
    courseName: 'C场 - 短打练习场',
    caddieId: 'caddie_02',
    caddieName: '李娜',
    playerCount: 2,
    holes: 9,
    hasCaddie: true,
    status: 'completed',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    billId: 'bill_003'
  },
  {
    id: 'booking_004',
    memberId: 'member_001',
    memberName: '陈先生',
    date: formatDate(-7),
    timeSlotId: 'slot_10_0',
    startTime: '10:00',
    endTime: '10:30',
    courseId: 'course_04',
    courseName: 'D场 - 精英球场',
    playerCount: 4,
    holes: 18,
    hasCaddie: false,
    status: 'cancelled',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'booking_005',
    memberId: 'member_001',
    memberName: '陈先生',
    date: formatDate(2),
    timeSlotId: 'slot_14_0',
    startTime: '14:00',
    endTime: '14:30',
    courseId: 'course_05',
    courseName: 'E场 - 花园球场',
    caddieId: 'caddie_06',
    caddieName: '赵敏',
    playerCount: 2,
    holes: 9,
    hasCaddie: true,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    billId: 'bill_005'
  }
];

export const mockMember = {
  id: 'member_001',
  name: '陈先生',
  avatar: 'https://picsum.photos/id/1027/200/200',
  phone: '138****8888',
  level: 'vip' as const,
  joinDate: '2023-06-15',
  points: 12580,
  discountRate: 0.85
};
