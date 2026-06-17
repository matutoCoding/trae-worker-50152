import { create } from 'zustand';
import { Course, CourseSchedule, Booking, Bill, Caddie, Member, FeeCalculationResult, AllocationResult } from '@/types/golf';
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
  hasCaddie: boolean;
  feeResult: FeeCalculationResult | null;
  loading: boolean;
  lastAllocation: AllocationResult | null;
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
    const { schedules, bookings, bills } = get();
    if (schedules.length > 0 && bookings.length > 0 && bills.length > 0) {
      return;
    }
    set({ loading: true });
    try {
      const [courses, schedulesData, bookingsData, billsData, caddies] = await Promise.all([
        getCourses(),
        getAllSchedules(),
        getBookings(mockMember.id),
        getBills(mockMember.id),
        getCaddies()
      ]);
      set({ courses, schedules: schedulesData, bookings: bookingsData, bills: billsData, caddies, loading: false });
    } catch (error) {
      console.error('[GolfStore] 加载数据失败', error);
      set({ loading: false });
    }
  },

  addBooking: (booking) => set((state) => ({
    bookings: [booking, ...state.bookings]
  })),

  updateBooking: (id, updates) => set((state) => ({
    bookings: state.bookings.map(b => b.id === id ? { ...b, ...updates } : b)
  })),

  addBill: (bill) => set((state) => ({
    bills: [bill, ...state.bills]
  })),

  updateBill: (id, updates) => set((state) => ({
    bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b)
  })),

  payBill: (id) => set((state) => {
    const bill = state.bills.find(b => b.id === id);
    const updatedBills = state.bills.map(b => 
      b.id === id ? { ...b, status: 'paid' as const, paidAt: new Date().toISOString() } : b
    );
    const updatedBookings = bill ? state.bookings.map(b =>
      b.id === bill.bookingId ? { ...b, status: 'confirmed' as const } : b
    ) : state.bookings;
    return { bills: updatedBills, bookings: updatedBookings };
  }),

  cancelBooking: (id) => set((state) => {
    const booking = state.bookings.find(b => b.id === id);
    const updatedBookings = state.bookings.map(b =>
      b.id === id ? { ...b, status: 'cancelled' as const } : b
    );
    const updatedBills = state.bills.map(b =>
      b.bookingId === id ? { ...b, status: 'refunded' as const } : b
    );
    if (booking) {
      const updatedSchedules = state.schedules.map(s => {
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
      return { bookings: updatedBookings, bills: updatedBills, schedules: updatedSchedules };
    }
    return { bookings: updatedBookings, bills: updatedBills };
  }),

  markSlotOccupied: (date, courseId, timeSlotId, bookingId) => set((state) => ({
    schedules: state.schedules.map(s => {
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
    })
  })),

  markSlotAvailable: (date, courseId, timeSlotId) => set((state) => ({
    schedules: state.schedules.map(s => {
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
    })
  })),

  resetSelection: () => set({
    selectedTimeSlotId: null,
    selectedStartTime: '',
    selectedEndTime: '',
    feeResult: null,
    lastAllocation: null
  })
}));
