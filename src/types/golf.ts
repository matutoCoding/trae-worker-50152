// 球道类型
export interface Course {
  id: string;
  name: string;
  number: number;
  type: '9holes' | '18holes';
  difficulty: 'easy' | 'normal' | 'hard';
  status: 'available' | 'maintenance' | 'closed';
  description: string;
}

// 时间段类型
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
}

// 球道排期
export interface CourseSchedule {
  courseId: string;
  date: string;
  slots: {
    timeSlotId: string;
    status: 'available' | 'occupied' | 'reserved';
    bookingId?: string;
  }[];
  loadBalance: number;
}

// 球童
export interface Caddie {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  experience: number;
  status: 'available' | 'onDuty' | 'rest';
  language: string[];
}

// 预约状态
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// 预约
export interface Booking {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  timeSlotId: string;
  startTime: string;
  endTime: string;
  courseId: string;
  courseName: string;
  caddieId?: string;
  caddieName?: string;
  playerCount: number;
  holes: 9 | 18;
  hasCaddie: boolean;
  status: BookingStatus;
  createdAt: string;
  billId?: string;
}

// 计费规则
export interface FeeRule {
  id: string;
  name: string;
  basePrice: number;
  ceilingPrice: number;
  pricePerHole: number;
  minHoles: number;
  maxHoles: number;
  weekendRate: number;
  peakHourRate: number;
}

// 费用明细
export interface FeeDetail {
  label: string;
  amount: number;
  description?: string;
}

// 账单
export interface Bill {
  id: string;
  bookingId: string;
  memberId: string;
  memberName: string;
  date: string;
  baseFee: number;
  greenFee: number;
  caddieFee: number;
  cartFee?: number;
  discount: number;
  totalAmount: number;
  status: 'unpaid' | 'paid' | 'refunded';
  feeDetails: FeeDetail[];
  createdAt: string;
  paidAt?: string;
}

// 会员
export interface Member {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  level: 'junior' | 'senior' | 'vip' | 'diamond';
  joinDate: string;
  points: number;
  discountRate: number;
}

// 分配结果
export interface AllocationResult {
  success: boolean;
  courseId?: string;
  courseName?: string;
  caddieId?: string;
  caddieName?: string;
  message?: string;
}

// 计费计算结果
export interface FeeCalculationResult {
  baseFee: number;
  greenFee: number;
  caddieFee: number;
  discount: number;
  totalAmount: number;
  isBasePriceApplied: boolean;
  isCeilingPriceApplied: boolean;
  details: FeeDetail[];
}
