import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Caddie } from '@/types/golf';

interface CaddieCardProps {
  caddie: Caddie;
}

const CaddieCard: React.FC<CaddieCardProps> = ({ caddie }) => {
  const statusMap = {
    available: { text: '空闲', className: styles.statusAvailable },
    onDuty: { text: '服务中', className: styles.statusOnDuty },
    rest: { text: '休息', className: styles.statusRest }
  };

  return (
    <View className={styles.card}>
      <Image className={styles.avatar} src={caddie.avatar} mode="aspectFill" />
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{caddie.name}</Text>
          <Text className={styles.rating}>⭐ {caddie.rating}</Text>
        </View>
        <Text className={styles.meta}>
          {caddie.experience}年经验 · {caddie.language.join(' / ')}
        </Text>
      </View>
      <Text className={classnames(styles.status, statusMap[caddie.status].className)}>
        {statusMap[caddie.status].text}
      </Text>
    </View>
  );
};

export default CaddieCard;
