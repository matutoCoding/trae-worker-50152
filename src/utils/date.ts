import dayjs from 'dayjs';

export const formatDate = (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatTime = (date: Date | string, format: string = 'HH:mm'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: Date | string, format: string = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

export const isWeekend = (date: Date | string): boolean => {
  const day = dayjs(date).day();
  return day === 0 || day === 6;
};

export const isPeakHour = (time: string): boolean => {
  const hour = parseInt(time.split(':')[0], 10);
  return hour >= 7 && hour <= 10;
};

export const getToday = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const getFutureDates = (days: number = 7): { date: string; weekday: string; day: string }[] => {
  const result = [];
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  for (let i = 0; i < days; i++) {
    const date = dayjs().add(i, 'day');
    result.push({
      date: date.format('YYYY-MM-DD'),
      weekday: i === 0 ? '今天' : i === 1 ? '明天' : weekdays[date.day()],
      day: date.format('DD')
    });
  }
  return result;
};

export const generateTimeSlots = (): { id: string; startTime: string; endTime: string; duration: number }[] => {
  const slots = [];
  const startHour = 6;
  const endHour = 17;
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === endHour && minute > 0) break;
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endMinute = minute + 30;
      const endH = endMinute >= 60 ? hour + 1 : hour;
      const endM = endMinute >= 60 ? endMinute - 60 : endMinute;
      const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
      slots.push({
        id: `slot_${hour}_${minute}`,
        startTime,
        endTime,
        duration: 30
      });
    }
  }
  return slots;
};

export const calculateEndTime = (startTime: string, holes: 9 | 18): string => {
  const duration = holes === 9 ? 30 : 60;
  const end = dayjs(`2000-01-01 ${startTime}`).add(duration, 'minute');
  return end.format('HH:mm');
};
