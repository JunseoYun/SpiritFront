import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import ColorUtil from '../../../utils/ColorUtil';
import CustomText from '../../../utils/CustomText';

const MOOD_LABELS = {
  QUIET: '대화하기 좋은',
  LIVELY: '활기찬',
  SOLO_FRIENDLY: '혼술',
  DATE: '데이트',
  PARTY_EVENT: '파티·이벤트',
  TRADITIONAL: '전통적인',
  EXOTIC: '이국적인',
  MODERN: '모던·깔끔한',
  OLD_SCHOOL: '노포 감성',
  VIEW_SPOT: '뷰 맛집',
  LOCAL_FAVORITE: '로컬 맛집',
  SECOND_ROUND: '2차 맛집',
};

const Moods = ({moods = [], imgLength}) => {
  const activeMoods = moods?.filter(Boolean) ?? [];

  if (!activeMoods.length) {
    return (
      <View style={[styles.emptyContainer]}>
        <CustomText style={styles.emptyText}>
          사장님이 아직 분위기 정보를 등록하지 않았어요.
        </CustomText>
      </View>
    );
  }

  return (
    <View style={[styles.container, imgLength < 1 && {marginTop: 20}]}>
      <View style={styles.labelRow}>
        {activeMoods.map(mood => (
          <View key={mood} style={styles.moodChip}>
            <CustomText style={styles.moodText}>
              #{MOOD_LABELS[mood] || mood}
            </CustomText>
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
