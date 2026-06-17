import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getFutureDates, generateTimeSlots } from '@/utils/date';
import { CourseSchedule } from '@/types/golf';

interface TimeSlotPickerProps {
  selectedDate: string;
  selectedTimeSlotId: string | null;
  schedules: CourseSchedule[];
  onSelectDate: (date: string) => void;
  onSelectTime: (id: string, start: string, end: string) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  selectedTimeSlotId,
  schedules,
  onSelectDate,
  onSelectTime
}) => {
  const dates = useMemo(() => getFutureDates(7), []);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const daySchedules = useMemo(() => {
    return schedules.filter(s => s.date === selectedDate);
  }, [schedules, selectedDate]);

  const isSlotOccupied = (slotId: string): boolean => {
    return daySchedules.some(schedule => {
      const slot = schedule.slots.find(s => s.timeSlotId === slotId);
      return slot && slot.status !== 'available';
    });
  };

  return (
    <View className={styles.container}>
      <ScrollView scrollX className={styles.dateRow}>
        {dates.map(d => (
          <View
            key={d.date}
            className={classnames(styles.dateItem, d.date === selectedDate && styles.active)}
            onClick={() => onSelectDate(d.date)}
          >
            <Text className={styles.dateWeekday}>{d.weekday}</Text>
            <Text className={styles.dateDay}>{d.day}</Text>
          </View>
        ))}
      </ScrollView>

      <Text className={styles.sectionTitle}>选择开球时间</Text>
      <View className={styles.slotGrid}>
        {timeSlots.map(slot => {
          const occupied = isSlotOccupied(slot.id);
          return (
            <View
              key={slot.id}
              className={classnames(
                styles.slotItem,
                !occupied && styles.available,
                occupied && styles.occupied,
                selectedTimeSlotId === slot.id && styles.active
              )}
              onClick={() => !occupied && onSelectTime(slot.id, slot.startTime, slot.endTime)}
            >
              <Text className={styles.slotTime}>{slot.startTime}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TimeSlotPicker;
