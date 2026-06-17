import { create } from 'zustand';
import Taro from '@tarojs/taro';
import { Course, CourseSchedule, Booking, Bill, Caddie, Member, FeeCalculationResult, AllocationResult } from '@/types/golf';
import { getCourses, getAllSchedules } from '@/services/course';
import { getBookings } from '@/services/booking';
import { getBills } from '@/services/billing';
import { getCaddies } from '@/services/caddie';
import { mockMember } from '@/data/bookings';

const STORAGE_KEYS = {
  BOOKINGS: 'golf_bookings',
  BILLS: 'golf_bills',
  SCHEDULES: 'golf_schedules'
};

const loadFromStorage = <T>(key: string): T | null => {
  try {
    const data = Taro.getStorageSync(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (e) {
    console.warn('[GolfStore] 读取本地存储失败', key, e);
  }
  return null;
};

const saveToStorage = (key: string, data: any) => {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[GolfStore] 保存本地存储失败', key, e);
  }
};

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
  hasCaddie: boolean;
  feeResult: FeeCalculationResult | null;
  loading: boolean;
  lastAllocation: AllocationResult | null;
  dataLoaded: boolean;
  setSelectedDate: (date: string) => void;
  setSelectedTimeSlot: (id: string, start: string, end: string) => void;
  setPlayerCount: (count: number) => void;
  setHoles: (holes: 9 | 18) => void;
  setHasCaddie: (hasCaddie: boolean) => void;
  setFeeResult: (result: FeeCalculationResult | null) => void;
  setLastAllocation: (allocation: AllocationResult | null) => void;
  loadAllData: () => Promise<void>;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  addBill: (bill: Bill) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  payBill: (id: string) => void;
  cancelBooking: (id: string) => void;
  markSlotOccupied: (date: string, courseId: string, timeSlotId: string, bookingId: string) => void;
  markSlotAvailable: (date: string, courseId: string, timeSlotId: string) => void;
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
  hasCaddie: true,
  feeResult: null,
  loading: false,
  lastAllocation: null,
  dataLoaded: false,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (id, start, end) => set({
    selectedTimeSlotId: id,
    selectedStartTime: start,
    selectedEndTime: end
  }),
  setPlayerCount: (count) => set({ playerCount: count }),
  setHoles: (holes) => set({ holes }),
  setHasCaddie: (hasCaddie) => set({ hasCaddie }),
  setFeeResult: (result) => set({ feeResult: result }),
  setLastAllocation: (allocation) => set({ lastAllocation: allocation }),

  loadAllData: async () => {
    if (get().dataLoaded) {
      return;
    }
    set({ loading: true });
    try {
      const storedBookings = loadFromStorage<Booking[]>(STORAGE_KEYS.BOOKINGS);
      const storedBills = loadFromStorage<Bill[]>(STORAGE_KEYS.BILLS);
      const storedSchedules = loadFromStorage<CourseSchedule[]>(STORAGE_KEYS.SCHEDULES);

      const [courses, caddies] = await Promise.all([
        getCourses(),
        getCaddies()
      ]);

      let schedulesData = storedSchedules;
      let bookingsData = storedBookings;
      let billsData = storedBills;

      if (!schedulesData || schedulesData.length === 0) {
        schedulesData = await getAllSchedules();
      }
      if (!bookingsData || bookingsData.length === 0) {
        bookingsData = await getBookings(mockMember.id);
      }
      if (!billsData || billsData.length === 0) {
        billsData = await getBills(mockMember.id);
      }

      set({
        courses,
        schedules: schedulesData,
        bookings: bookingsData,
        bills: billsData,
        caddies,
        loading: false,
        dataLoaded: true
      });
    } catch (error) {
      console.error('[GolfStore] 加载数据失败', error);
      set({ loading: false });
    }
  },

  addBooking: (booking) => {
    set((state) => {
      const newBookings = [booking, ...state.bookings];
      saveToStorage(STORAGE_KEYS.BOOKINGS, newBookings);
      return { bookings: newBookings };
    });
  },

  updateBooking: (id, updates) => {
    set((state) => {
      const newBookings = state.bookings.map(b => b.id === id ? { ...b, ...updates } : b);
      saveToStorage(STORAGE_KEYS.BOOKINGS, newBookings);
      return { bookings: newBookings };
    });
  },

  addBill: (bill) => {
    set((state) => {
      const newBills = [bill, ...state.bills];
      saveToStorage(STORAGE_KEYS.BILLS, newBills);
      return { bills: newBills };
    });
  },

  updateBill: (id, updates) => {
    set((state) => {
      const newBills = state.bills.map(b => b.id === id ? { ...b, ...updates } : b);
      saveToStorage(STORAGE_KEYS.BILLS, newBills);
      return { bills: newBills };
    });
  },

  payBill: (id) => {
    set((state) => {
      const bill = state.bills.find(b => b.id === id);
      const updatedBills = state.bills.map(b => 
        b.id === id ? { ...b, status: 'paid' as const, paidAt: new Date().toISOString() } : b
      );
      const updatedBookings = bill ? state.bookings.map(b =>
        b.id === bill.bookingId ? { ...b, status: 'confirmed' as const } : b
      ) : state.bookings;
      saveToStorage(STORAGE_KEYS.BILLS, updatedBills);
      saveToStorage(STORAGE_KEYS.BOOKINGS, updatedBookings);
      return { bills: updatedBills, bookings: updatedBookings };
    });
  },

  cancelBooking: (id) => {
    set((state) => {
      const booking = state.bookings.find(b => b.id === id);
      const updatedBookings = state.bookings.map(b =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b
      );
      const updatedBills = state.bills.map(b =>
        b.bookingId === id ? { ...b, status: 'refunded' as const } : b
      );
      let updatedSchedules = state.schedules;
      if (booking) {
        updatedSchedules = state.schedules.map(s => {
          if (s.date === booking.date && s.courseId === booking.courseId) {
            return {
              ...s,
              slots: s.slots.map(slot =>
                slot.timeSlotId === booking.timeSlotId
                  ? { ...slot, status: 'available' as const, bookingId: undefined }
                  : slot
              ),
              loadBalance: Math.max(0, s.loadBalance - 1)
            };
          }
          return s;
        });
      }
      saveToStorage(STORAGE_KEYS.BOOKINGS, updatedBookings);
      saveToStorage(STORAGE_KEYS.BILLS, updatedBills);
      saveToStorage(STORAGE_KEYS.SCHEDULES, updatedSchedules);
      return { bookings: updatedBookings, bills: updatedBills, schedules: updatedSchedules };
    });
  },

  markSlotOccupied: (date, courseId, timeSlotId, bookingId) => {
    set((state) => {
      const newSchedules = state.schedules.map(s => {
        if (s.date === date && s.courseId === courseId) {
          return {
            ...s,
            slots: s.slots.map(slot =>
              slot.timeSlotId === timeSlotId
                ? { ...slot, status: 'occupied' as const, bookingId }
                : slot
            ),
            loadBalance: s.loadBalance + 1
          };
        }
        return s;
      });
      saveToStorage(STORAGE_KEYS.SCHEDULES, newSchedules);
      return { schedules: newSchedules };
    });
  },

  markSlotAvailable: (date, courseId, timeSlotId) => {
    set((state) => {
      const newSchedules = state.schedules.map(s => {
        if (s.date === date && s.courseId === courseId) {
          return {
            ...s,
            slots: s.slots.map(slot =>
              slot.timeSlotId === timeSlotId
                ? { ...slot, status: 'available' as const, bookingId: undefined }
                : slot
            ),
            loadBalance: Math.max(0, s.loadBalance - 1)
          };
        }
        return s;
      });
      saveToStorage(STORAGE_KEYS.SCHEDULES, newSchedules);
      return { schedules: newSchedules };
    });
  },

  resetSelection: () => set({
    selectedTimeSlotId: null,
    selectedStartTime: '',
    selectedEndTime: '',
    feeResult: null,
    lastAllocation: null
  })
}));
