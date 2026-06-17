import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useGolfStore } from '@/store/golf';
import BillCard from '@/components/BillCard';

type TabType = 'all' | 'unpaid' | 'paid';

const BillPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(false);

  const { bills, loadAllData, payBill } = useGolfStore();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadAllData();
      setLoading(false);
    };
    init();
  }, [loadAllData]);

  const filteredBills = useMemo(() => {
    switch (activeTab) {
      case 'unpaid':
        return bills.filter(b => b.status === 'unpaid');
      case 'paid':
        return bills.filter(b => b.status === 'paid' || b.status === 'refunded');
      default:
        return bills;
    }
  }, [bills, activeTab]);

  const unpaidTotal = useMemo(() => {
    return bills
      .filter(b => b.status === 'unpaid')
      .reduce((sum, b) => sum + b.totalAmount, 0);
  }, [bills]);

  const tabs: Array<{ key: TabType; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'unpaid', label: '待支付' },
    { key: 'paid', label: '已支付' }
  ];

  const handleRefresh = async () => {
    setLoading(true);
    await loadAllData();
    setLoading(false);
  };

  return (
    <ScrollView scrollY className={styles.container} refresherEnabled refresherTriggered={loading} onRefresherRefresh={handleRefresh}>
      <View className={styles.summary}>
        <Text className={styles.summaryTitle}>待支付金额</Text>
        <Text className={styles.summaryAmount}>¥{unpaidTotal.toFixed(2)}</Text>
        <Text className={styles.summaryDesc}>共 {bills.filter(b => b.status === 'unpaid').length} 笔待支付账单</Text>
      </View>

      <View className={styles.tabs}>
        {tabs.map(tab => (
          <Text
            key={tab.key}
            className={classnames(styles.tabItem, activeTab === tab.key && styles.active)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Text>
        ))}
      </View>

      <Text className={styles.sectionTitle}>
        {activeTab === 'all' ? '全部账单' : activeTab === 'unpaid' ? '待支付账单' : '已支付账单'}
      </Text>

      {filteredBills.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>暂无相关账单</Text>
        </View>
      ) : (
        filteredBills.map(bill => (
          <BillCard key={bill.id} bill={bill} onPaid={() => {
            payBill(bill.id);
            Taro.eventCenter.trigger('home:refresh');
          }} />
        ))
      )}
    </ScrollView>
  );
};

export default BillPage;
