import { Booking, AllocationResult } from '@/types/golf';
import { mockBookings } from '@/data/bookings';
import { allocateOptimalCourse } from '@/utils/courseAllocator';
import { mockCourses, generateFutureSchedules } from '@/data/courses';
import { mockCaddies } from '@/data/caddies';

interface CreateBookingParams {
  memberId: string;
  memberName: string;
  date: string;
  timeSlotId: string;
  startTime: string;
  endTime: string;
  playerCount: number;
  holes: 9 | 18;
  hasCaddie: boolean;
}

export const getBookings = async (memberId?: string): Promise<Booking[]> => {
  console.log('[BookingService] 获取预约列表', { memberId });
  await new Promise(resolve => setTimeout(resolve, 300));
  if (memberId) {
    return mockBookings.filter(b => b.memberId === memberId);
  }
  return mockBookings;
};

export const getBookingById = async (id: string): Promise<Booking | undefined> => {
  console.log('[BookingService] 获取预约详情', { id });
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockBookings.find(b => b.id === id);
};

export const allocateCourse = async (params: {
  date: string;
  timeSlotId: string;
  holes: 9 | 18;
  hasCaddie?: boolean;
  existingSchedules?: any[];
}): Promise<AllocationResult> => {
  console.log('[BookingService] 自动分配球道', params);
  await new Promise(resolve => setTimeout(resolve, 500));

  const schedules = params.existingSchedules && params.existingSchedules.length > 0
    ? params.existingSchedules
    : generateFutureSchedules(7);
  const result = allocateOptimalCourse({
    courses: mockCourses,
    schedules,
    caddies: mockCaddies,
    date: params.date,
    timeSlotId: params.timeSlotId,
    holes: params.holes,
    hasCaddie: params.hasCaddie ?? true
  });

  return result;
};

export const createBooking = async (
  params: CreateBookingParams,
  preAllocation?: AllocationResult
): Promise<Booking> => {
  console.log('[BookingService] 创建预约', params, preAllocation);
  await new Promise(resolve => setTimeout(resolve, 500));

  let allocation = preAllocation;
  if (!allocation || !allocation.success) {
    allocation = await allocateCourse({
      date: params.date,
      timeSlotId: params.timeSlotId,
      holes: params.holes,
      hasCaddie: params.hasCaddie
    });
  }

  if (!allocation.success) {
    throw new Error(allocation.message || '预约失败');
  }

  const newBooking: Booking = {
    id: `booking_${Date.now()}`,
    ...params,
    courseId: allocation.courseId!,
    courseName: allocation.courseName!,
    caddieId: params.hasCaddie ? allocation.caddieId : undefined,
    caddieName: params.hasCaddie ? allocation.caddieName : undefined,
    hasCaddie: params.hasCaddie,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  mockBookings.unshift(newBooking);
  return newBooking;
};

export const cancelBooking = async (id: string): Promise<boolean> => {
  console.log('[BookingService] 取消预约', { id });
  await new Promise(resolve => setTimeout(resolve, 300));
  const booking = mockBookings.find(b => b.id === id);
  if (booking) {
    booking.status = 'cancelled';
    return true;
  }
  return false;
};
