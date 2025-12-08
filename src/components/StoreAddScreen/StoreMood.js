import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../../utils/CustomText';

const MOOD_OPTIONS = [
  {text: '대화하기 좋은', key: 'QUIET'},
  {text: '활기찬', key: 'LIVELY'},
  {text: '혼술', key: 'SOLO_FRIENDLY'},
  {text: '데이트', key: 'DATE'},
  {text: '파티·이벤트', key: 'PARTY_EVENT'},
  {text: '전통적인', key: 'TRADITIONAL'},
  {text: '이국적인', key: 'EXOTIC'},
  {text: '모던·깔끔한', key: 'MODERN'},
  {text: '노포 감성', key: 'OLD_SCHOOL'},
  {text: '뷰 맛집', key: 'VIEW_SPOT'},
  {text: '로컬 맛집', key: 'LOCAL_FAVORITE'},
  {text: '2차 맛집', key: 'SECOND_ROUND'},
];

const StoreMood = ({moodInfo, setMoodInfo, type = 'default'}) => {
  const isRegistration = type === 'registration';
  const selectedCount = Object.values(moodInfo || {}).filter(Boolean).length;

  const toggleMood = key => {
    const isSelected = moodInfo[key];
    if (!isSelected && selectedCount >= 4) return; // 최대 4개 제한
    setMoodInfo(prev => ({...prev, [key]: !isSelected}));
  };

  return (
    <View
      style={[styles.container, isRegistration && styles.registrationSpacing]}>
      {/* ✅ 상단 라벨 */}
      {!isRegistration && (
        <View style={styles.labelView}>
          <CustomText style={styles.label}>분위기</CustomText>
          {selectedCount < 1 ? (
            <CustomText style={styles.subLabel}>(선택)</CustomText>
          ) : (
            <CustomText style={styles.subLabel}>
              (선택 {selectedCount}/4)
            </CustomText>
          )}
        </View>
      )}

      {/* ✅ 칩 버튼 리스트 */}
      <View style={styles.moodGrid}>
        {MOOD_OPTIONS.map(({text, key}) => {
          const isSelected = moodInfo[key];
          const disabled = !isSelected && selectedCount >= 4;

          return (
            <Pressable
              key={key}
              style={[
                styles.moodChip,
                isSelected && styles.moodChipSelected,
                disabled && styles.moodChipDisabled,
              ]}
              onPress={() => toggleMood(key)}
              disabled={disabled}>
              <CustomText
                style={[
                  styles.moodText,
                  isSelected && styles.moodTextSelected,
                  disabled && styles.moodTextDisabled,
                ]}>
                {text}
              </CustomText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginHorizontal: 18,
  },
  registrationSpacing: {
    marginTop: 0,
  },
  labelView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
    marginRight: 6,
  },
  subLabel: {
    fontFamily: 'Pretendard-Regular',
    color: '#999',
    fontSize: 14,
    marginRight: 4,
    paddingBottom: 1,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moodChip: {
    marginRight: 12,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: ColorUtil.border,
  },
  moodChipSelected: {
    borderColor: '#3CBBFF',
    backgroundColor: 'rgba(60,187,255,0.08)',
  },
  moodChipDisabled: {
    borderColor: '#E8E8E8',
  },
  moodText: {
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  moodTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },
  moodTextDisabled: {
    color: '#C8C8C8',
  },
});

export default StoreMood;
