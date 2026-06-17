import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useGolfStore } from '@/store/golf';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import { calculateFee } from '@/services/billing';
import { FeeCalculationResult } from '@/types/golf';

const BookingPage: React.FC = () => {
  const {
    schedules,
    selectedDate,
    selectedTimeSlotId,
    selectedStartTime,
    playerCount,
    holes,
    setSelectedDate,
    setSelectedTimeSlot,
    setPlayerCount,
    setHoles,
    setFeeResult,
    feeResult,
    loadAllData
  } = useGolfStore();

  const [hasCaddie, setHasCaddie] = useState(true);
  const [loading, setLoading] = useState(false);

  const holesOptions: Array<{ value: 9 | 18; label: string }> = [
    { value: 9, label: '短打9洞' },
    { value: 18, label: '全场18洞' }
  ];

  const fetchFee = useCallback(async () => {
    if (!selectedTimeSlotId || !selectedStartTime) {
      setFeeResult(null);
      return;
    }
    try {
      setLoading(true);
      const result = await calculateFee({
        holes,
        date: selectedDate,
        startTime: selectedStartTime,
        playerCount,
        hasCaddie
      });
      setFeeResult(result);
    } catch (error) {
      console.error('[BookingPage] 计算费用失败', error);
      Taro.showToast({ title: '费用计算失败', icon: 'error' });
    } finally {
      setLoading(false);
    }
  }, [selectedTimeSlotId, selectedStartTime, holes, selectedDate, playerCount, hasCaddie, setFeeResult]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    fetchFee();
  }, [fetchFee]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleSelectTime = (id: string, start: string, end: string) => {
    setSelectedTimeSlot(id, start, end);
  };

  const handleStepper = (delta: number) => {
    const newCount = Math.max(1, Math.min(8, playerCount + delta));
    setPlayerCount(newCount);
  };

  const handleSubmit = async () => {
    if (!selectedTimeSlotId) {
      Taro.showToast({ title: '请选择开球时间', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/confirm/index?date=${selectedDate}&timeSlotId=${selectedTimeSlotId}&startTime=${selectedStartTime}&playerCount=${playerCount}&holes=${holes}&hasCaddie=${hasCaddie}`
    });
  };

  const canSubmit = !!selectedTimeSlotId;

  return (
    <View className={styles.container}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择日期和时间</Text>
        <TimeSlotPicker
          selectedDate={selectedDate}
          selectedTimeSlotId={selectedTimeSlotId}
          schedules={schedules}
          onSelectDate={handleSelectDate}
          onSelectTime={handleSelectTime}
        />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>打球洞数</Text>
        <View className={styles.optionsRow}>
          {holesOptions.map(opt => (
            <View
              key={opt.value}
              className={classnames(styles.optionCard, holes === opt.value && styles.active)}
              onClick={() => setHoles(opt.value)}
            >
              <Text className={styles.optionValue}>{opt.value}</Text>
              <Text className={styles.optionLabel}>{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>打球设置</Text>
        <View className={styles.playerSection}>
          <View className={styles.playerRow}>
            <Text className={styles.playerLabel}>打球人数</Text>
            <View className={styles.stepper}>
              <Button
                className={classnames(styles.stepperBtn, playerCount <= 1 && styles.disabled)}
                onClick={() => handleStepper(-1)}
              >
                -
              </Button>
              <Text className={styles.stepperValue}>{playerCount}</Text>
              <Button
                className={classnames(styles.stepperBtn, playerCount >= 8 && styles.disabled)}
                onClick={() => handleStepper(1)}
              >
                +
              </Button>
            </View>
          </View>
          <View className={styles.playerRow}>
            <View className={styles.caddieOption}>
              <Text className={styles.playerLabel}>需要球童服务</Text>
            </View>
            <View
              className={classnames(styles.switch, hasCaddie && styles.active)}
              onClick={() => setHasCaddie(!hasCaddie)}
            >
              <View className={styles.switchDot} />
            </View>
          </View>
        </View>
      </View>

      {feeResult && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>费用预估</Text>
          <View className={styles.pricePreview}>
            {feeResult.details.map((detail, index) => (
              <View key={index} className={styles.priceRow}>
                <Text className={styles.priceLabel}>
                  {detail.label}
                  {detail.description && (
                    <Text className={styles.priceTag}>{detail.description.split('¥')[0].trim()}</Text>
                  )}
                </Text>
                <Text className={styles.priceValue}>
                  {detail.amount >= 0 ? '+' : ''}¥{detail.amount.toFixed(2)}
                </Text>
              </View>
            ))}
            <View className={classnames(styles.priceRow, styles.totalRow)}>
              <Text className={styles.priceLabel}>预估总计</Text>
              <Text className={styles.priceValue}>¥{feeResult.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.footerBar}>
        <View className={styles.footerInfo}>
          <Text className={styles.footerLabel}>预估费用</Text>
          <Text className={styles.footerPrice}>
            ¥{feeResult ? feeResult.totalAmount.toFixed(2) : '0.00'}
          </Text>
        </View>
        <Button
          className={classnames(styles.submitBtn, !canSubmit && styles.disabled)}
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
        >
          下一步
        </Button>
      </View>
    </View>
  );
};

export default BookingPage;
