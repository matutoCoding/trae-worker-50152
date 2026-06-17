import { create } from 'zustand';
import { Course, CourseSchedule, Booking, Bill, Caddie, Member, FeeCalculationResult } from '@/types/golf';
import { getCourses, getAllSchedules } from '@/services/course';
import { getBookings } from '@/services/booking';
import { getBills } from '@/services/billing';
import { getCaddies } from '@/services/caddie';
import { mockMember } from '@/data/bookings';

interface GolfState {
  courses: Course[];
  schedules: CourseSchedule[];
  bookings: Booking[];
  bills: Bill[];
  caddies: Caddie[];
  member: Member;
  selectedDate: string;
  selectedTimeSlotId: string | null;
  selectedStartTime: string;
  selectedEndTime: string;
  playerCount: number;
  holes: 9 | 18;
  feeResult: FeeCalculationResult | null;
  loading: boolean;
  setSelectedDate: (date: string) => void;
  setSelectedTimeSlot: (id: string, start: string, end: string) => void;
  setPlayerCount: (count: number) => void;
  setHoles: (holes: 9 | 18) => void;
  setFeeResult: (result: FeeCalculationResult | null) => void;
  loadAllData: () => Promise<void>;
  resetSelection: () => void;
}

export const useGolfStore = create<GolfState>((set, get) => ({
  courses: [],
  schedules: [],
  bookings: [],
  bills: [],
  caddies: [],
  member: mockMember,
  selectedDate: new Date().toISOString().split('T')[0],
  selectedTimeSlotId: null,
  selectedStartTime: '',
  selectedEndTime: '',
  playerCount: 4,
  holes: 18,
  feeResult: null,
  loading: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (id, start, end) => set({
    selectedTimeSlotId: id,
    selectedStartTime: start,
    selectedEndTime: end
  }),
  setPlayerCount: (count) => set({ playerCount: count }),
  setHoles: (holes) => set({ holes }),
  setFeeResult: (result) => set({ feeResult: result }),

  loadAllData: async () => {
    set({ loading: true });
    try {
      const [courses, schedules, bookings, bills, caddies] = await Promise.all([
        getCourses(),
        getAllSchedules(),
        getBookings(mockMember.id),
        getBills(mockMember.id),
        getCaddies()
      ]);
      set({ courses, schedules, bookings, bills, caddies, loading: false });
    } catch (error) {
      console.error('[GolfStore] 加载数据失败', error);
      set({ loading: false });
    }
  },

  resetSelection: () => set({
    selectedTimeSlotId: null,
    selectedStartTime: '',
    selectedEndTime: '',
    feeResult: null
  })
}));
