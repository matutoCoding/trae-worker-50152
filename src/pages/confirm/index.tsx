import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { allocateCourse, createBooking } from '@/services/booking';
import { calculateFee, generateBill } from '@/services/billing';
import { mockMember } from '@/data/bookings';
import { FeeCalculationResult, AllocationResult } from '@/types/golf';
import { useGolfStore } from '@/store/golf';

const SUBMIT_LOCK_KEY = 'golf_submit_lock';

const ConfirmPage: React.FC = () => {
  const router = useRouter();
  const { date, timeSlotId, startTime, endTime, playerCount, holes, hasCaddie } = router.params;

  const {
    schedules,
    bookings,
    setLastAllocation,
    addBooking,
    addBill,
    markSlotOccupied,
    updateBooking
  } = useGolfStore();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allocation, setAllocation] = useState<AllocationResult | null>(null);
  const [feeResult, setFeeResult] = useState<FeeCalculationResult | null>(null);
  const [timeConflict, setTimeConflict] = useState(false);
  const submitLockRef = useRef(false);

  const holesNum = parseInt(holes as string, 10) as 9 | 18;
  const playerCountNum = parseInt(playerCount as string, 10);
  const hasCaddieBool = hasCaddie === 'true';
  const displayStartTime = startTime as string;
  const displayEndTime = endTime as string;

  const isTimeSlotOccupied = useCallback(() => {
    if (!date || !timeSlotId) return false;
    const daySchedules = schedules.filter(s => s.date === date);
    if (daySchedules.length === 0) return false;
    let occupiedCount = 0;
    for (const schedule of daySchedules) {
      const slot = schedule.slots.find(s => s.timeSlotId === timeSlotId);
      if (slot && slot.status !== 'available') {
        occupiedCount++;
      }
    }
    return occupiedCount === daySchedules.length;
  }, [schedules, date, timeSlotId]);

  const hasExistingBooking = useCallback(() => {
    return bookings.some(b =>
      b.date === date &&
      b.timeSlotId === timeSlotId &&
      b.status !== 'cancelled'
    );
  }, [bookings, date, timeSlotId]);

  const acquireSubmitLock = (): boolean => {
    const lockKey = `${SUBMIT_LOCK_KEY}_${date}_${timeSlotId}`;
    try {
      const existing = Taro.getStorageSync(lockKey);
      if (existing || submitLockRef.current) {
        return false;
      }
      submitLockRef.current = true;
      Taro.setStorageSync(lockKey, Date.now());
      setTimeout(() => {
        try {
          Taro.removeStorageSync(lockKey);
        } catch (e) {}
        submitLockRef.current = false;
      }, 10000);
      return true;
    } catch (e) {
      return !submitLockRef.current;
    }
  };

  const releaseSubmitLock = () => {
    const lockKey = `${SUBMIT_LOCK_KEY}_${date}_${timeSlotId}`;
    submitLockRef.current = false;
    try {
      Taro.removeStorageSync(lockKey);
    } catch (e) {}
  };

  const loadData = useCallback(async () => {
    if (!date || !timeSlotId || !startTime || !endTime) {
      Taro.showToast({ title: '参数错误', icon: 'error' });
      setTimeout(() => Taro.navigateBack(), 1000);
      return;
    }

    if (hasExistingBooking()) {
      setTimeConflict(true);
      setLoading(false);
      return;
    }

    if (isTimeSlotOccupied()) {
      setTimeConflict(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [allocResult, feeCalc] = await Promise.all([
        allocateCourse({
          date: date as string,
          timeSlotId: timeSlotId as string,
          holes: holesNum,
          hasCaddie: hasCaddieBool,
          existingSchedules: schedules
        }),
        calculateFee({
          holes: holesNum,
          date: date as string,
          startTime: startTime as string,
          playerCount: playerCountNum,
          hasCaddie: hasCaddieBool
        })
      ]);
      setAllocation(allocResult);
      setFeeResult(feeCalc);
      setLastAllocation(allocResult);
    } catch (error) {
      console.error('[ConfirmPage] 加载数据失败', error);
      Taro.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  }, [date, timeSlotId, startTime, endTime, holesNum, playerCountNum, hasCaddieBool, schedules, setLastAllocation, hasExistingBooking, isTimeSlotOccupied]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (!allocation?.success) {
      Taro.showToast({ title: allocation?.message || '暂无可用球道', icon: 'none' });
      return;
    }

    if (!acquireSubmitLock()) {
      Taro.showToast({ title: '正在提交中，请勿重复点击', icon: 'none' });
      return;
    }

    if (hasExistingBooking()) {
      releaseSubmitLock();
      Taro.showToast({ title: '该时段已有有效预约', icon: 'none' });
      setTimeConflict(true);
      return;
    }

    if (isTimeSlotOccupied()) {
      releaseSubmitLock();
      Taro.showToast({ title: '该时段已约满，请选择其他时间', icon: 'none' });
      setTimeConflict(true);
      return;
    }

    try {
      setSubmitting(true);
      Taro.showLoading({ title: '提交中...' });

      const booking = await createBooking({
        memberId: mockMember.id,
        memberName: mockMember.name,
        date: date as string,
        timeSlotId: timeSlotId as string,
        startTime: displayStartTime,
        endTime: displayEndTime,
        playerCount: playerCountNum,
        holes: holesNum,
        hasCaddie: hasCaddieBool
      }, allocation);

      const bill = await generateBill({
        id: booking.id,
        memberId: mockMember.id,
        memberName: mockMember.name,
        date: date as string,
        startTime: startTime as string,
        playerCount: playerCountNum,
        holes: holesNum,
        hasCaddie: hasCaddieBool
      });

      addBooking(booking);
      addBill(bill);
      markSlotOccupied(
        date as string,
        allocation.courseId!,
        timeSlotId as string,
        booking.id
      );
      updateBooking(booking.id, { billId: bill.id, endTime: displayEndTime });

      Taro.hideLoading();
      Taro.showToast({ title: '预约成功', icon: 'success' });
      Taro.eventCenter.trigger('home:refresh');

      setTimeout(() => {
        Taro.redirectTo({ url: `/pages/detail/index?id=${booking.id}` });
      }, 1500);
    } catch (error) {
      console.error('[ConfirmPage] 提交预约失败', error);
      Taro.hideLoading();
      Taro.showToast({ title: error instanceof Error ? error.message : '预约失败', icon: 'error' });
      releaseSubmitLock();
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  if (loading) {
    return (
      <View className={styles.container}>
        <View className={styles.loadingWrap}>
          <Text style={{ fontSize: '80rpx' }}>🏌️</Text>
          <Text className={styles.loadingText}>系统正在为您智能分配最优球道...</Text>
        </View>
      </View>
    );
  }

  if (timeConflict) {
    return (
      <View className={styles.container}>
        <View className={styles.loadingWrap}>
          <Text style={{ fontSize: '80rpx' }}>⚠️</Text>
          <Text className={styles.loadingText}>该时段已有有效预约</Text>
          <Text className={styles.allocationDesc}>请返回选择其他开球时间</Text>
          <Button className={styles.submitBtn} onClick={handleBack}>返回选择</Button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>预约信息</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>打球日期</Text>
            <Text className={styles.infoValue}>{date}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>开球时间</Text>
            <Text className={styles.infoValue}>{displayStartTime} - {displayEndTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>打球洞数</Text>
            <Text className={styles.infoValue}>{holesNum} 洞</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>打球人数</Text>
            <Text className={styles.infoValue}>{playerCountNum} 人</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>球童服务</Text>
            <Text className={styles.infoValue}>{hasCaddieBool ? '需要' : '不需要'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>智能分配结果</Text>
        {allocation?.success ? (
          <View className={styles.allocationCard}>
            <View className={styles.allocationHeader}>
              <Text className={styles.allocationIcon}>✅</Text>
              <Text className={styles.allocationTitle}>系统已为您智能分配</Text>
            </View>
            <Text className={styles.allocationDesc}>基于碎片时间优化 + 负载均衡策略自动分配最优球道</Text>
            <View className={styles.allocationRow}>
              <Text className={styles.feeLabel}>分配球道</Text>
              <Text className={styles.feeValue}>{allocation.courseName}</Text>
            </View>
            {allocation.caddieName && (
              <View className={styles.allocationRow}>
                <Text className={styles.feeLabel}>服务球童</Text>
                <Text className={styles.feeValue}>{allocation.caddieName}</Text>
              </View>
            )}
          </View>
        ) : (
          <View className={styles.allocationCard} style={{ background: '#FFEBEE', borderColor: '#FFCDD2' }}>
            <View className={styles.allocationHeader}>
              <Text className={styles.allocationIcon} style={{ background: '#F53F3F' }}>❌</Text>
              <Text className={styles.allocationTitle} style={{ color: '#F53F3F' }}>分配失败</Text>
            </View>
            <Text className={styles.allocationDesc}>{allocation?.message || '该时段暂无可用球道，请选择其他时间'}</Text>
          </View>
        )}
      </View>

      {feeResult && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>费用明细</Text>
          <View className={styles.feeCard}>
            {feeResult.details.map((detail, index) => (
              <View key={index} className={styles.feeRow}>
                <Text className={styles.feeLabel}>
                  {detail.label}
                  {(detail.label.includes('起步价') || detail.label.includes('封顶价')) && (
                    <Text className={styles.feeTag}>规则</Text>
                  )}
                </Text>
                <Text className={styles.feeValue}>
                  {detail.amount >= 0 ? '+' : ''}¥{detail.amount.toFixed(2)}
                </Text>
              </View>
            ))}
            <View className={classnames(styles.feeRow, styles.totalRow)}>
              <Text className={styles.feeLabel}>应付总计</Text>
              <Text className={styles.feeValue}>¥{feeResult.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.footerBar}>
        <Button className={styles.backBtn} onClick={handleBack}>返回修改</Button>
        <View className={styles.footerInfo}>
          <Text className={styles.footerLabel}>应付金额</Text>
          <Text className={styles.footerPrice}>¥{feeResult?.totalAmount.toFixed(2) || '0.00'}</Text>
        </View>
        <Button
          className={classnames(styles.submitBtn, (!allocation?.success || submitting || timeConflict) && styles.disabled)}
          onClick={handleSubmit}
          disabled={!allocation?.success || submitting || timeConflict}
        >
          {submitting ? '提交中...' : '确认预约'}
        </Button>
      </View>
    </View>
  );
};

export default ConfirmPage;
