import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Course } from '@/types/golf';

interface CourseCardProps {
  course: Course;
  availableSlots?: number;
  totalSlots?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, availableSlots, totalSlots }) => {
  const difficultyMap = {
    easy: '简单',
    normal: '适中',
    hard: '困难'
  };

  const typeMap = {
    '9holes': '9洞',
    '18holes': '18洞'
  };

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.name}>{course.name}</Text>
        <View className={styles.tags}>
          <Text className={classnames(styles.tag, styles.tagType)}>{typeMap[course.type]}</Text>
          <Text className={classnames(styles.tag, styles.tagDifficulty)}>{difficultyMap[course.difficulty]}</Text>
          {course.status === 'maintenance' ? (
            <Text className={classnames(styles.tag, styles.tagMaintenance)}>维护中</Text>
          ) : (
            <Text className={classnames(styles.tag, styles.tagStatus)}>正常开放</Text>
          )}
        </View>
      </View>
      <Text className={styles.desc}>{course.description}</Text>
      {typeof availableSlots === 'number' && typeof totalSlots === 'number' && (
        <View className={styles.footer}>
          <Text className={styles.availability}>
            今日可用时段：<Text className={styles.available}>{availableSlots}</Text> / {totalSlots}
          </Text>
        </View>
      )}
    </View>
  );
};

export default CourseCard;
