import { Course, CourseSchedule } from '@/types/golf';
import { generateTimeSlots, getToday } from '@/utils/date';

export const mockCourses: Course[] = [
  {
    id: 'course_01',
    name: 'A场 - 湖畔球场',
    number: 1,
    type: '18holes',
    difficulty: 'normal',
    status: 'available',
    description: '经典湖景18洞，难度适中，适合各水平球友'
  },
  {
    id: 'course_02',
    name: 'B场 - 山景球场',
    number: 2,
    type: '18holes',
    difficulty: 'hard',
    status: 'available',
    description: '山地特色18洞，球道起伏大，具有挑战性'
  },
  {
    id: 'course_03',
    name: 'C场 - 短打练习场',
    number: 3,
    type: '9holes',
    difficulty: 'easy',
    status: 'available',
    description: '9洞短打练习场，适合初学者和热身'
  },
  {
    id: 'course_04',
    name: 'D场 - 精英球场',
    number: 4,
    type: '18holes',
    difficulty: 'hard',
    status: 'available',
    description: '锦标赛级18洞，职业赛事标准设计'
  },
  {
    id: 'course_05',
    name: 'E场 - 花园球场',
    number: 5,
    type: '9holes',
    difficulty: 'easy',
    status: 'available',
    description: '花园式9洞球场，风景优美，轻松愉悦'
  },
  {
    id: 'course_06',
    name: 'F场 - 林克斯球场',
    number: 6,
    type: '18holes',
    difficulty: 'normal',
    status: 'maintenance',
    description: '林克斯风格球场，维护中暂不开放'
  }
];

const timeSlots = generateTimeSlots();
const today = getToday();

const generateSchedule = (courseId: string, date: string, occupancyRate: number = 0.4): CourseSchedule => {
  const slots = timeSlots.map(slot => {
    const random = Math.random();
    return {
      timeSlotId: slot.id,
      status: random < occupancyRate ? 'occupied' as const : 'available' as const,
      bookingId: random < occupancyRate ? `booking_${Math.random().toString(36).slice(2, 9)}` : undefined
    };
  });

  return {
    courseId,
    date,
    slots,
    loadBalance: Math.round(Math.random() * 5)
  };
};

export const mockCourseSchedules: CourseSchedule[] = mockCourses
  .filter(c => c.status === 'available')
  .map(course => generateSchedule(course.id, today, 0.3 + Math.random() * 0.3));

export const generateFutureSchedules = (days: number = 7): CourseSchedule[] => {
  const schedules: CourseSchedule[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    mockCourses
      .filter(c => c.status === 'available')
      .forEach(course => {
        schedules.push(generateSchedule(course.id, dateStr, i === 0 ? 0.4 : 0.2 + Math.random() * 0.2));
      });
  }
  return schedules;
};
