import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useGolfStore } from '@/store/golf';
import { getAllocationSummary } from '@/utils/courseAllocator';
import { getToday } from '@/utils/date';

const HomePage: React.FC = () => {
  const { member, schedules, bookings, courses, loadAllData, loading } = useGolfStore();
  const [stats, setStats] = useState({ available: 0, occupied: 0, utilizationRate: 0 });

  const loadData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const summary = getAllocationSummary(schedules, getToday());
    setStats(summary);
  }, [schedules]);

  const handleRefresh = async () => {
    await loadData();
    Taro.stopPullDownRefresh();
  };

  useEffect(() => {
    Taro.eventCenter.on('home:refresh', handleRefresh);
    return () => {
      Taro.eventCenter.off('home:refresh', handleRefresh);
    };
  }, [handleRefresh]);

  const handleQuickBook = () => {
    Taro.switchTab({ url: '/pages/booking/index' });
  };

  const upcomingBooking = bookings.find(b => b.status === 'confirmed' || b.status === 'pending');

  const levelMap = {
    junior: '普通会员',
    senior: '高级会员',
    vip: 'VIP会员',
    diamond: '钻石会员'
  };

  const courseUtilizations = courses.filter(c => c.status === 'available').map(course => {
    const courseSchedules = schedules.filter(s => s.courseId === course.id && s.date === getToday());
    let available = 0;
    let total = 0;
    courseSchedules.forEach(s => {
      s.slots.forEach(slot => {
        total++;
        if (slot.status === 'available') available++;
      });
    });
    const utilization = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
    return { course, utilization, available, total };
  });

  return (
    <ScrollView
      scrollY
      className={styles.container}
      refresherEnabled
      refresherTriggered={loading}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.heroSection}>
        <Text className={styles.greeting}>您好，{member.name}</Text>
        <Text className={styles.subtitle}>{levelMap[member.level]} · 积分 {member.points}</Text>

        <View className={styles.quickStats}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{stats.available}</Text>
            <Text className={styles.statLabel}>可用时段</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{bookings.length}</Text>
            <Text className={styles.statLabel}>我的预约</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>快速预约</Text>
        </View>
        <View className={styles.bookingCard}>
          <View className={styles.bookingInfo}>
            <Text className={styles.bookingTitle}>立即预约开球</Text>
            <Text className={styles.bookingDesc}>系统自动分配最优球道，避免碎片时间</Text>
          </View>
          <Button className={styles.bookingBtn} onClick={handleQuickBook}>去预约</Button>
        </View>
      </View>

      {upcomingBooking && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>即将开球</Text>
            <Text
              className={styles.quickAction}
              onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${upcomingBooking.id}` })}
            >
              查看详情
            </Text>
          </View>
          <View className={styles.bookingCard}>
            <View className={styles.bookingInfo}>
              <Text className={styles.bookingTitle}>{upcomingBooking.courseName}</Text>
              <Text className={styles.bookingDesc}>
                {upcomingBooking.date} {upcomingBooking.startTime} · {upcomingBooking.playerCount}人 {upcomingBooking.holes}洞
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>今日球道状态</Text>
        </View>
        <View className={styles.todaySection}>
          {courseUtilizations.map(({ course, utilization, available, total }) => (
            <View key={course.id} className={styles.courseStatusRow}>
              <Text className={styles.courseName}>{course.name}</Text>
              <View className={styles.statusBar}>
                <View className={styles.barContainer}>
                  <View className={styles.barFill} style={{ width: `${utilization}%` }} />
                </View>
                <Text className={styles.utilization}>{available}/{total}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>球会公告</Text>
        </View>
        <View className={styles.noticeList}>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeTag}>公告</Text>
            <Text className={styles.noticeText}>F场 - 林克斯球场维护中，预计下周一开放</Text>
          </View>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeTag}>活动</Text>
            <Text className={styles.noticeText}>周末会员杯赛火热报名中，赢取丰厚奖品</Text>
          </View>
          <View className={styles.noticeItem}>
            <Text className={styles.noticeTag}>提示</Text>
            <Text className={styles.noticeText}>早晚温差较大，请携带合适衣物下场</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
