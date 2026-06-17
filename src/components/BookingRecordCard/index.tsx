import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Booking } from '@/types/golf';
import { formatDateTime } from '@/utils/date';

interface BookingRecordCardProps {
  booking: Booking;
  onCancel?: () => void;
}

const BookingRecordCard: React.FC<BookingRecordCardProps> = ({ booking, onCancel }) => {
  const statusMap = {
    pending: { text: '待确认', className: styles.statusPending },
    confirmed: { text: '已确认', className: styles.statusConfirmed },
    completed: { text: '已完成', className: styles.statusCompleted },
    cancelled: { text: '已取消', className: styles.statusCancelled }
  };

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${booking.id}`
    });
  };

  const handleCancel = async (e) => {
    e.stopPropagation();
    const result = await Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？',
      confirmColor: '#F53F3F'
    });
    if (result.confirm) {
      onCancel?.();
    }
  };

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.courseName}>{booking.courseName}</Text>
        <Text className={classnames(styles.status, statusMap[booking.status].className)}>
          {statusMap[booking.status].text}
        </Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.infoLabel}>打球日期</Text>
        <Text className={styles.infoValue}>{booking.date}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.infoLabel}>开球时间</Text>
        <Text className={styles.infoValue}>{booking.startTime} - {booking.endTime}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.infoLabel}>打球人数</Text>
        <Text className={styles.infoValue}>{booking.playerCount} 人 · {booking.holes} 洞</Text>
      </View>
      {booking.caddieName && (
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>服务球童</Text>
          <Text className={styles.infoValue}>{booking.caddieName}</Text>
        </View>
      )}
      <View className={styles.footer}>
        <Text className={styles.timeInfo}>下单时间：{formatDateTime(booking.createdAt)}</Text>
        {canCancel && (
          <Button className={styles.actionBtn} onClick={handleCancel}>取消预约</Button>
        )}
      </View>
    </View>
  );
};

export default BookingRecordCard;
