import React, { useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useGolfStore } from '@/store/golf';
import BookingRecordCard from '@/components/BookingRecordCard';
import CaddieCard from '@/components/CaddieCard';
import { cancelBooking as cancelBookingService } from '@/services/booking';

const MinePage: React.FC = () => {
  const { member, bookings, caddies, loadAllData, cancelBooking: cancelInStore } = useGolfStore();

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const levelMap = {
    junior: '普通会员',
    senior: '高级会员',
    vip: 'VIP会员',
    diamond: '钻石会员'
  };

  const recentBookings = bookings.slice(0, 3);
  const availableCaddies = caddies.filter(c => c.status === 'available').slice(0, 3);

  const handleCancel = async (bookingId: string) => {
    try {
      Taro.showLoading({ title: '取消中...' });
      const success = await cancelBookingService(bookingId);
      if (success) {
        cancelInStore(bookingId);
      }
      Taro.hideLoading();
      if (success) {
        Taro.showToast({ title: '已取消预约', icon: 'success' });
        Taro.eventCenter.trigger('home:refresh');
      } else {
        Taro.showToast({ title: '取消失败', icon: 'error' });
      }
    } catch (error) {
      console.error('[MinePage] 取消预约失败', error);
      Taro.hideLoading();
      Taro.showToast({ title: '取消失败', icon: 'error' });
    }
  };

  const menuItems = [
    { icon: '📋', text: '我的预约', action: () => Taro.switchTab({ url: '/pages/bill/index' }) },
    { icon: '💰', text: '积分商城', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '🎁', text: '优惠券', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '📞', text: '联系客服', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) },
    { icon: '⚙️', text: '设置', action: () => Taro.showToast({ title: '功能开发中', icon: 'none' }) }
  ];

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <View className={styles.memberRow}>
          <Image className={styles.avatar} src={member.avatar} mode="aspectFill" />
          <View className={styles.memberInfo}>
            <Text className={styles.memberName}>{member.name}</Text>
            <Text className={styles.memberLevel}>{levelMap[member.level]}</Text>
            <Text className={styles.memberPhone}>{member.phone}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{member.points}</Text>
          <Text className={styles.statLabel}>会员积分</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{bookings.length}</Text>
          <Text className={styles.statLabel}>预约次数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{Math.round(member.discountRate * 10)}</Text>
          <Text className={styles.statLabel}>会员折扣</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>最近预约</Text>
        {recentBookings.length === 0 ? (
          <View style={{ padding: '60rpx 0', textAlign: 'center' }}>
            <Text style={{ color: '#86909C', fontSize: '28rpx' }}>暂无预约记录</Text>
          </View>
        ) : (
          recentBookings.map(booking => (
            <BookingRecordCard
              key={booking.id}
              booking={booking}
              onCancel={() => handleCancel(booking.id)}
            />
          ))
        )}
      </View>

      <View className={styles.caddieSection}>
        <Text className={styles.sectionTitle}>推荐球童</Text>
        {availableCaddies.map(caddie => (
          <CaddieCard key={caddie.id} caddie={caddie} />
        ))}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>更多服务</Text>
        <View className={styles.menuList}>
          {menuItems.map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.action}>
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuText}>{item.text}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
