import { FeeRule, FeeCalculationResult, FeeDetail } from '@/types/golf';
import { isWeekend, isPeakHour } from './date';

interface CalculationContext {
  feeRule: FeeRule;
  holes: number;
  date: string;
  startTime: string;
  playerCount: number;
  memberDiscountRate?: number;
  hasCaddie: boolean;
}

export const calculateGreenFee = (ctx: CalculationContext): FeeCalculationResult => {
  console.log('[FeeCalculator] 开始计算果岭费', {
    holes: ctx.holes,
    date: ctx.date,
    startTime: ctx.startTime,
    playerCount: ctx.playerCount
  });

  const details: FeeDetail[] = [];
  let isBasePriceApplied = false;
  let isCeilingPriceApplied = false;

  const { feeRule, holes, date, startTime, playerCount, memberDiscountRate = 1, hasCaddie } = ctx;

  if (holes < feeRule.minHoles || holes > feeRule.maxHoles) {
    console.error('[FeeCalculator] 洞数超出边界', { holes, min: feeRule.minHoles, max: feeRule.maxHoles });
    throw new Error(`洞数必须在 ${feeRule.minHoles} 到 ${feeRule.maxHoles} 之间`);
  }

  let rawGreenFee = holes * feeRule.pricePerHole;
  details.push({
    label: '基础果岭费',
    amount: rawGreenFee,
    description: `${holes} 洞 × ¥${feeRule.pricePerHole}/洞`
  });

  const weekend = isWeekend(date);
  if (weekend) {
    const weekendSurcharge = rawGreenFee * (feeRule.weekendRate - 1);
    rawGreenFee += weekendSurcharge;
    details.push({
      label: '周末附加费',
      amount: weekendSurcharge,
      description: `周末加价 ${Math.round((feeRule.weekendRate - 1) * 100)}%`
    });
  }

  const peak = isPeakHour(startTime);
  if (peak) {
    const peakSurcharge = rawGreenFee * (feeRule.peakHourRate - 1);
    rawGreenFee += peakSurcharge;
    details.push({
      label: '高峰时段附加费',
      amount: peakSurcharge,
      description: `早高峰加价 ${Math.round((feeRule.peakHourRate - 1) * 100)}%`
    });
  }

  let greenFee = rawGreenFee;
  if (greenFee < feeRule.basePrice) {
    greenFee = feeRule.basePrice;
    isBasePriceApplied = true;
    details.push({
      label: '起步价补差',
      amount: feeRule.basePrice - rawGreenFee,
      description: `短打按起步价 ¥${feeRule.basePrice} 计算`
    });
    console.log('[FeeCalculator] 触发起步价', { original: rawGreenFee, basePrice: feeRule.basePrice });
  }

  if (greenFee > feeRule.ceilingPrice) {
    greenFee = feeRule.ceilingPrice;
    isCeilingPriceApplied = true;
    details.push({
      label: '封顶价减免',
      amount: rawGreenFee - feeRule.ceilingPrice,
      description: `全场按封顶价 ¥${feeRule.ceilingPrice} 计算`
    });
    console.log('[FeeCalculator] 触发封顶价', { original: rawGreenFee, ceilingPrice: feeRule.ceilingPrice });
  }

  const baseFee = greenFee * playerCount;
  details.push({
    label: '人数合计',
    amount: baseFee,
    description: `${playerCount} 人 × ¥${greenFee.toFixed(2)}`
  });

  let caddieFee = 0;
  if (hasCaddie) {
    caddieFee = 150 * playerCount;
    details.push({
      label: '球童费',
      amount: caddieFee,
      description: `${playerCount} 人 × ¥150/人`
    });
  }

  const subtotal = baseFee + caddieFee;
  const discount = subtotal * (1 - memberDiscountRate);
  if (discount > 0) {
    details.push({
      label: '会员折扣',
      amount: -discount,
      description: `会员 ${Math.round(memberDiscountRate * 10)} 折优惠`
    });
  }

  const totalAmount = Math.round((subtotal - discount) * 100) / 100;

  if (totalAmount < 0) {
    console.error('[FeeCalculator] 金额校验失败：总金额为负数', { totalAmount });
    throw new Error('金额计算异常，请重试');
  }

  console.log('[FeeCalculator] 计费完成', {
    baseFee,
    greenFee,
    caddieFee,
    discount,
    totalAmount,
    isBasePriceApplied,
    isCeilingPriceApplied
  });

  return {
    baseFee,
    greenFee,
    caddieFee,
    discount,
    totalAmount,
    isBasePriceApplied,
    isCeilingPriceApplied,
    details
  };
};

export const defaultFeeRule: FeeRule = {
  id: 'default_rule',
  name: '标准果岭费规则',
  basePrice: 300,
  ceilingPrice: 1200,
  pricePerHole: 60,
  minHoles: 9,
  maxHoles: 18,
  weekendRate: 1.3,
  peakHourRate: 1.15
};

export const formatCurrency = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};
