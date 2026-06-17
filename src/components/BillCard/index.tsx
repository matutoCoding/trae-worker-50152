import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Bill } from '@/types/golf';

interface BillCardProps {
  bill: Bill;
  onPaid?: () => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onPaid }) => {
  const statusMap = {
    unpaid: { text: '待支付', className: styles.statusUnpaid },
    paid: { text: '已支付', className: styles.statusPaid },
    refunded: { text: '已退款', className: styles.statusRefunded }
  };

  const handlePay = async () => {
    Taro.showLoading({ title: '支付中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '支付成功', icon: 'success' });
      onPaid?.();
    }, 800);
  };

  const handleViewDetail = () => {
    Taro.showModal({
      title: '费用明细',
      content: bill.feeDetails.map(d => `${d.label}: ¥${d.amount.toFixed(2)}${d.description ? ` (${d.description})` : ''}`).join('\n'),
      showCancel: false
    });
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.billId}>账单号：{bill.id}</Text>
        <Text className={classnames(styles.status, statusMap[bill.status].className)}>
          {statusMap[bill.status].text}
        </Text>
      </View>
      <View className={styles.body}>
        <View className={styles.row}>
          <Text className={styles.label}>打球日期</Text>
          <Text className={styles.value}>{bill.date}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>果岭费</Text>
          <Text className={styles.value}>¥{bill.greenFee.toFixed(2)}</Text>
        </View>
        <View className={styles.row}>
          <Text className={styles.label}>球童费</Text>
          <Text className={styles.value}>¥{bill.caddieFee.toFixed(2)}</Text>
        </View>
        {bill.discount > 0 && (
          <View className={styles.row}>
            <Text className={styles.label}>会员优惠</Text>
            <Text className={styles.value}>-¥{bill.discount.toFixed(2)}</Text>
          </View>
        )}
      </View>
      <View className={styles.footer}>
        <View>
          <Text className={styles.totalLabel}>应付金额：</Text>
          <Text className={styles.totalAmount}>¥{bill.totalAmount.toFixed(2)}</Text>
        </View>
        <View style={{ display: 'flex' }}>
          <Button className={styles.detailBtn} onClick={handleViewDetail}>明细</Button>
          {bill.status === 'unpaid' && (
            <Button className={styles.actionBtn} onClick={handlePay}>立即支付</Button>
          )}
        </View>
      </View>
    </View>
  );
};

export default BillCard;
