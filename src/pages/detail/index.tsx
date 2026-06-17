import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import styles from './index.module.scss';
import { cancelBooking } from '@/services/booking';
import { payBill } from '@/services/billing';
import { Booking, Bill } from '@/types/golf';
import { formatDateTime } from '@/utils/date';
import { useGolfStore } from '@/store/golf';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.params;

  const {
    bookings,
    bills,
    cancelBooking: cancelInStore,
    payBill: payInStore,
    loadAllData
  } = useGolfStore();

  const [loading, setLoading] = useState(true);

  const booking = useMemo(() => {
    return bookings.find(b => b.id === id) || null;
  }, [bookings, id]);

  const bill = useMemo(() => {
    return bills.find(b => b.bookingId === id) || null;
  }, [bills, id]);

  const displayEndTime = useMemo(() => {
    if (!booking) return '';
    return booking.endTime || '';
  }, [booking]);

  useEffect(() => {
    const init = async () => {
      await loadAllData();
      setLoading(false);
    };
    init();
  }, [loadAllData]);

  const handleCancel = async () => {
    if (!booking) return;
    const result = await Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？取消后费用将原路退回。',
      confirmColor: '#F53F3F'
    });
    if (!result.confirm) return;

    try {
      Taro.showLoading({ title: '取消中...' });
      const success = await cancelBooking(booking.id);
      if (success) {
        cancelInStore(booking.id);
      }
      Taro.hideLoading();
      if (success) {
        Taro.showToast({ title: '已取消预约', icon: 'success' });
        Taro.eventCenter.trigger('home:refresh');
      } else {
        Taro.showToast({ title: '取消失败', icon: 'error' });
      }
    } catch (error) {
      console.error('[DetailPage] 取消预约失败', error);
      Taro.hideLoading();
      Taro.showToast({ title: '取消失败', icon: 'error' });
    }
  };

  const handlePay = async () => {
    if (!bill) return;
    try {
      Taro.showLoading({ title: '支付中...' });
      const success = await payBill(bill.id);
      if (success) {
        payInStore(bill.id);
      }
      Taro.hideLoading();
      if (success) {
        Taro.showToast({ title: '支付成功', icon: 'success' });
        Taro.eventCenter.trigger('home:refresh');
      } else {
        Taro.showToast({ title: '支付失败', icon: 'error' });
      }
    } catch (error) {
      console.error('[DetailPage] 支付失败', error);
      Taro.hideLoading();
      Taro.showToast({ title: '支付失败', icon: 'error' });
    }
  };

  const handleGoBill = () => {
    Taro.switchTab({ url: '/pages/bill/index' });
  };

  if (loading) {
    return (
      <View className={styles.container}>
        <View className={styles.loadingWrap}>
          <Text style={{ fontSize: '80rpx' }}>⏳</Text>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View className={styles.container}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>❓</Text>
          <Text className={styles.emptyText}>预约信息不存在</Text>
        </View>
      </View>
    );
  }

  const statusConfig = {
    pending: {
      className: styles.statusPending,
      icon: '⏳',
      title: '待确认',
      desc: '预约已提交，等待球会确认'
    },
    confirmed: {
      className: styles.statusConfirmed,
      icon: '✅',
      title: '预约成功',
      desc: '请按时到达球会前台签到'
    },
    completed: {
      className: styles.statusCompleted,
      icon: '✔️',
      title: '已完成',
      desc: `已完成打球，感谢您的光临`
    },
    cancelled: {
      className: styles.statusCancelled,
      icon: '❌',
      title: '已取消',
      desc: '该预约已取消'
    }
  };

  const status = statusConfig[booking.status];
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canPay = bill?.status === 'unpaid';

  return (
    <View className={styles.container}>
      <View className={classnames(styles.statusBanner, status.className)}>
        <Text className={styles.statusIcon}>{status.icon}</Text>
        <View className={styles.statusTextWrap}>
          <Text className={styles.statusTitle}>{status.title}</Text>
          <Text className={styles.statusDesc}>{status.desc}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>预约信息</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>预约编号</Text>
            <Text className={styles.infoValue}>{booking.id}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>球道名称</Text>
            <Text className={styles.infoValue}>{booking.courseName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>打球日期</Text>
            <Text className={styles.infoValue}>{booking.date}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>开球时间</Text>
            <Text className={styles.infoValue}>{booking.startTime} - {displayEndTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>打球人数</Text>
            <Text className={styles.infoValue}>{booking.playerCount} 人</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>打球洞数</Text>
            <Text className={styles.infoValue}>{booking.holes} 洞</Text>
          </View>
          {booking.caddieName && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>服务球童</Text>
              <Text className={styles.infoValue}>{booking.caddieName}</Text>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>下单时间</Text>
            <Text className={styles.infoValue}>{formatDateTime(booking.createdAt)}</Text>
          </View>
        </View>
      </View>

      {bill && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>费用明细</Text>
          <View className={styles.infoCard}>
            {bill.feeDetails.map((detail, index) => (
              <View key={index} className={styles.feeRow}>
                <Text className={styles.feeLabel}>{detail.label}</Text>
                <Text className={styles.feeValue}>
                  {detail.amount >= 0 ? '+' : ''}¥{detail.amount.toFixed(2)}
                </Text>
              </View>
            ))}
            <View className={classnames(styles.feeRow, styles.totalRow)}>
              <Text className={styles.feeLabel}>总计金额</Text>
              <Text className={styles.feeValue}>¥{bill.totalAmount.toFixed(2)}</Text>
            </View>
            <View className={styles.infoRow} style={{ marginTop: '24rpx' }}>
              <Text className={styles.infoLabel}>支付状态</Text>
              <Text
                className={styles.infoValue}
                style={{ color: bill.status === 'paid' ? '#00B42A' : bill.status === 'unpaid' ? '#FF7D00' : '#86909C' }}
              >
                {bill.status === 'paid' ? '已支付' : bill.status === 'unpaid' ? '待支付' : '已退款'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.actionBar}>
        {canCancel && (
          <Button className={styles.dangerBtn} onClick={handleCancel}>取消预约</Button>
        )}
        {canPay && (
          <Button className={styles.primaryBtn} onClick={handlePay}>立即支付</Button>
        )}
        {!canCancel && !canPay && (
          <Button className={styles.secondaryBtn} onClick={handleGoBill}>查看账单</Button>
        )}
      </View>
    </View>
  );
};

export default DetailPage;
