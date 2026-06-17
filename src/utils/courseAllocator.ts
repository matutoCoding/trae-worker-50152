import { Course, CourseSchedule, Caddie, AllocationResult } from '@/types/golf';

interface AllocationContext {
  courses: Course[];
  schedules: CourseSchedule[];
  caddies: Caddie[];
  date: string;
  timeSlotId: string;
  holes: 9 | 18;
  hasCaddie?: boolean;
}

const calculateFragmentationScore = (schedule: CourseSchedule, timeSlotId: string): number => {
  const slotIndex = schedule.slots.findIndex(s => s.timeSlotId === timeSlotId);
  if (slotIndex === -1) return Infinity;

  let fragmentation = 0;
  const slots = schedule.slots;

  const checkSide = (start: number, end: number, step: number): number => {
    let freeCount = 0;
    for (let i = start; i >= 0 && i < slots.length; i += step) {
      if (slots[i].status === 'available') {
        freeCount++;
      } else {
        break;
      }
    }
    return freeCount;
  };

  const leftFree = checkSide(slotIndex - 1, 0, -1);
  const rightFree = checkSide(slotIndex + 1, slots.length - 1, 1);
  const totalFree = leftFree + rightFree + 1;

  if (totalFree < 2) {
    fragmentation += 50;
  }

  if ((leftFree === 0 || rightFree === 0) && totalFree >= 2) {
    fragmentation -= 10;
  }

  if (leftFree > 0 && rightFree > 0) {
    fragmentation += 20;
  }

  return fragmentation;
};

const calculateLoadBalanceScore = (schedule: CourseSchedule): number => {
  return schedule.loadBalance * 10;
};

const calculateCoursePreference = (course: Course, holes: 9 | 18): number => {
  let score = 0;

  if (holes === 9 && course.type === '9holes') {
    score -= 30;
  }
  if (holes === 18 && course.type === '18holes') {
    score -= 20;
  }

  if (course.difficulty === 'normal') {
    score -= 5;
  }

  return score;
};

export const allocateOptimalCourse = (ctx: AllocationContext): AllocationResult => {
  console.log('[CourseAllocator] 开始分配球道', { date: ctx.date, timeSlotId: ctx.timeSlotId, holes: ctx.holes, hasCaddie: ctx.hasCaddie });

  const availableCourses = ctx.courses.filter(c => c.status === 'available');
  if (availableCourses.length === 0) {
    return { success: false, message: '暂无可用球道' };
  }

  const courseScores: { courseId: string; score: number; schedule: CourseSchedule }[] = [];

  for (const course of availableCourses) {
    const schedule = ctx.schedules.find(s => s.courseId === course.id && s.date === ctx.date);
    if (!schedule) continue;

    const slot = schedule.slots.find(s => s.timeSlotId === ctx.timeSlotId);
    if (!slot || slot.status !== 'available') continue;

    const fragmentationScore = calculateFragmentationScore(schedule, ctx.timeSlotId);
    const loadBalanceScore = calculateLoadBalanceScore(schedule);
    const preferenceScore = calculateCoursePreference(course, ctx.holes);

    const totalScore = fragmentationScore + loadBalanceScore + preferenceScore;

    courseScores.push({
      courseId: course.id,
      score: totalScore,
      schedule
    });

    console.log('[CourseAllocator] 球道评分', {
      course: course.name,
      fragmentation: fragmentationScore,
      loadBalance: loadBalanceScore,
      preference: preferenceScore,
      total: totalScore
    });
  }

  if (courseScores.length === 0) {
    return { success: false, message: '所选时段暂无空闲球道' };
  }

  courseScores.sort((a, b) => a.score - b.score);

  const bestMatch = courseScores[0];
  const selectedCourse = ctx.courses.find(c => c.id === bestMatch.courseId)!;

  console.log('[CourseAllocator] 分配结果', {
    course: selectedCourse.name,
    score: bestMatch.score,
    hasCaddie: ctx.hasCaddie
  });

  if (ctx.hasCaddie === false) {
    return {
      success: true,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name
    };
  }

  const availableCaddie = ctx.caddies.find(c => c.status === 'available');

  return {
    success: true,
    courseId: selectedCourse.id,
    courseName: selectedCourse.name,
    caddieId: availableCaddie?.id,
    caddieName: availableCaddie?.name
  };
};

export const getAllocationSummary = (schedules: CourseSchedule[], date: string) => {
  const todaySchedules = schedules.filter(s => s.date === date);
  let available = 0;
  let occupied = 0;

  todaySchedules.forEach(schedule => {
    schedule.slots.forEach(slot => {
      if (slot.status === 'available') available++;
      else occupied++;
    });
  });

  const total = available + occupied;
  return {
    available,
    occupied,
    total,
    utilizationRate: total > 0 ? Math.round((occupied / total) * 100) : 0
  };
};
