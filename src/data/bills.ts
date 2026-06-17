import { Bill } from '@/types/golf';

export const mockBills: Bill[] = [
  {
    id: 'bill_001',
    bookingId: 'booking_001',
    memberId: 'member_001',
    memberName: '陈先生',
    date: new Date().toISOString().split('T')[0],
    baseFee: 4800,
    greenFee: 1200,
    caddieFee: 600,
    cartFee: 400,
    discount: 870,
    totalAmount: 4930,
    status: 'unpaid',
    feeDetails: [
      { label: '基础果岭费', amount: 1080, description: '18洞 × ¥60/洞' },
      { label: '封顶价减免', amount: -120, description: '全场按封顶价 ¥1200 计算' },
      { label: '人数合计', amount: 4800, description: '4人 × ¥1200' },
      { label: '球童费', amount: 600, description: '4人 × ¥150/人' },
      { label: '球车费', amount: 400, description: '2辆球车' },
      { label: '会员折扣', amount: -870, description: 'VIP会员85折' }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'bill_002',
    bookingId: 'booking_002',
    memberId: 'member_001',
    memberName: '陈先生',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    baseFee: 3420,
    greenFee: 1140,
    caddieFee: 450,
    discount: 580.5,
    totalAmount: 3289.5,
    status: 'unpaid',
    feeDetails: [
      { label: '基础果岭费', amount: 1080, description: '18洞 × ¥60/洞' },
      { label: '高峰时段附加费', amount: 60, description: '早高峰加价15%' },
      { label: '人数合计', amount: 3420, description: '3人 × ¥1140' },
      { label: '球童费', amount: 450, description: '3人 × ¥150/人' },
      { label: '会员折扣', amount: -580.5, description: 'VIP会员85折' }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'bill_003',
    bookingId: 'booking_003',
    memberId: 'member_001',
    memberName: '陈先生',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    baseFee: 600,
    greenFee: 300,
    caddieFee: 300,
    discount: 135,
    totalAmount: 765,
    status: 'paid',
    feeDetails: [
      { label: '基础果岭费', amount: 540, description: '9洞 × ¥60/洞' },
      { label: '起步价补差', amount: -240, description: '短打按起步价 ¥300 计算' },
      { label: '人数合计', amount: 600, description: '2人 × ¥300' },
      { label: '球童费', amount: 300, description: '2人 × ¥150/人' },
      { label: '会员折扣', amount: -135, description: 'VIP会员85折' }
    ],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 4 * 86400000 + 7200000).toISOString()
  },
  {
    id: 'bill_005',
    bookingId: 'booking_005',
    memberId: 'member_001',
    memberName: '陈先生',
    date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    baseFee: 600,
    greenFee: 300,
    caddieFee: 300,
    discount: 135,
    totalAmount: 765,
    status: 'unpaid',
    feeDetails: [
      { label: '基础果岭费', amount: 540, description: '9洞 × ¥60/洞' },
      { label: '起步价补差', amount: -240, description: '短打按起步价 ¥300 计算' },
      { label: '人数合计', amount: 600, description: '2人 × ¥300' },
      { label: '球童费', amount: 300, description: '2人 × ¥150/人' },
      { label: '会员折扣', amount: -135, description: 'VIP会员85折' }
    ],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];
