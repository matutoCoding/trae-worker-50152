import { Bill, FeeCalculationResult } from '@/types/golf';
import { mockBills } from '@/data/bills';
import { calculateGreenFee, defaultFeeRule } from '@/utils/feeCalculator';
import { mockMember } from '@/data/bookings';

interface CalculateFeeParams {
  holes: number;
  date: string;
  startTime: string;
  playerCount: number;
  hasCaddie?: boolean;
}

export const calculateFee = async (params: CalculateFeeParams): Promise<FeeCalculationResult> => {
  console.log('[BillingService] 计算费用', params);
  await new Promise(resolve => setTimeout(resolve, 200));

  return calculateGreenFee({
    feeRule: defaultFeeRule,
    holes: params.holes,
    date: params.date,
    startTime: params.startTime,
    playerCount: params.playerCount,
    memberDiscountRate: mockMember.discountRate,
    hasCaddie: params.hasCaddie ?? true
  });
};

export const getBills = async (memberId?: string): Promise<Bill[]> => {
  console.log('[BillingService] 获取账单列表', { memberId });
  await new Promise(resolve => setTimeout(resolve, 300));
  if (memberId) {
    return mockBills.filter(b => b.memberId === memberId);
  }
  return mockBills;
};

export const getBillById = async (id: string): Promise<Bill | undefined> => {
  console.log('[BillingService] 获取账单详情', { id });
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockBills.find(b => b.id === id);
};

export const getBillByBookingId = async (bookingId: string): Promise<Bill | undefined> => {
  console.log('[BillingService] 根据预约获取账单', { bookingId });
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockBills.find(b => b.bookingId === bookingId);
};

export const payBill = async (id: string): Promise<boolean> => {
  console.log('[BillingService] 支付账单', { id });
  await new Promise(resolve => setTimeout(resolve, 800));
  const bill = mockBills.find(b => b.id === id);
  if (bill) {
    bill.status = 'paid';
    bill.paidAt = new Date().toISOString();
    return true;
  }
  return false;
};

export const generateBill = async (booking: {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  startTime: string;
  playerCount: number;
  holes: number;
  hasCaddie?: boolean;
}): Promise<Bill> => {
  console.log('[BillingService] 生成账单', { bookingId: booking.id, hasCaddie: booking.hasCaddie });

  const feeResult = await calculateFee({
    holes: booking.holes,
    date: booking.date,
    startTime: booking.startTime,
    playerCount: booking.playerCount,
    hasCaddie: booking.hasCaddie ?? true
  });

  const bill: Bill = {
    id: `bill_${Date.now()}`,
    bookingId: booking.id,
    memberId: booking.memberId,
    memberName: booking.memberName,
    date: booking.date,
    baseFee: feeResult.baseFee,
    greenFee: feeResult.greenFee,
    caddieFee: feeResult.caddieFee,
    discount: feeResult.discount,
    totalAmount: feeResult.totalAmount,
    status: 'unpaid',
    feeDetails: feeResult.details,
    createdAt: new Date().toISOString()
  };

  mockBills.unshift(bill);
  return bill;
};
