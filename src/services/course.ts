import { Course, CourseSchedule } from '@/types/golf';
import { mockCourses, mockCourseSchedules, generateFutureSchedules } from '@/data/courses';

export const getCourses = async (): Promise<Course[]> => {
  console.log('[CourseService] 获取球道列表');
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCourses;
};

export const getCourseSchedules = async (date?: string): Promise<CourseSchedule[]> => {
  console.log('[CourseService] 获取球道排期', { date });
  await new Promise(resolve => setTimeout(resolve, 300));
  if (!date) return mockCourseSchedules;
  return generateFutureSchedules(7).filter(s => s.date === date);
};

export const getAllSchedules = async (): Promise<CourseSchedule[]> => {
  console.log('[CourseService] 获取所有球道排期');
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateFutureSchedules(7);
};
