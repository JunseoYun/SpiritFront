import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import ColorUtil from '../../../utils/ColorUtil';

const MOOD_LABELS = {
  QUIET: '조용한',
  LIVELY: '시끌벅적한',
  SOLO_FRIENDLY: '혼술하기 좋은',
  DATE: '데이트하기 좋은',
  PARTY_EVENT: '모임/파티 분위기',
  TRADITIONAL: '전통적인',
  EXOTIC: '이국적인',
  MODERN: '모던한',
  OLD_SCHOOL: '노포 감성',
  VIEW_SPOT: '뷰가 좋은',
  LOCAL_FAVORITE: '로컬 맛집',
  SECOND_ROUND: '2차로 좋은',
};

const Moods = ({moods = []}) => {
  const activeMoods = moods?.filter(Boolean) ?? [];

  if (!activeMoods.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          사장님이 아직 분위기 정보를 등록하지 않았어요.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {activeMoods.map(mood => (
          <View key={mood} style={styles.moodChip}>
            <Text style={styles.moodText}>#{MOOD_LABELS[mood] || mood}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: 15,
  },
  labelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodChip: {
    backgroundColor: ColorUtil.chipBackgroud,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  moodText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#333',
  },
  emptyContainer: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  emptyText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default Moods;
