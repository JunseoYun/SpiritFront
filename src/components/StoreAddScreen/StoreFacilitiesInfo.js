import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import ColorUtil from '../../utils/ColorUtil';
import {
  SunMedium,
  DoorOpen,
  TvMinimal,
  Wine,
  UsersRound,
  CarFront,
  CheckCircle2,
} from 'lucide-react-native';
import CustomText from '../../utils/CustomText';

const FACILITY_OPTIONS = [
  {text: '스크린·TV', key: 'hasScreen', icon: TvMinimal},
  {text: '룸', key: 'hasRoom', icon: DoorOpen},
  {text: '야외 좌석·테라스', key: 'hasOutdoor', icon: SunMedium},
  {text: '단체 방문 가능', key: 'isGroupAvailable', icon: UsersRound},
  {text: '주차 가능', key: 'isParkingAvailable', icon: CarFront},
  {text: '콜키지 가능', key: 'isCorkageAvailable', icon: Wine},
];

const StoreFacilitiesInfo = ({
  facilitiesInfo,
  setFacilitiesInfo,
  error,
  type = 'default',
}) => {
  const isRegistration = type === 'registration';
  const toggleFacility = key => {
    setFacilitiesInfo(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <View
      style={[styles.container, isRegistration && styles.registrationSpacing]}>
      {/* ✅ 상단 라벨 */}
      {!isRegistration && (
        <CustomText style={styles.label}>편의시설</CustomText>
      )}

      {/* ✅ 칩 버튼 리스트 */}
      <View style={styles.facilityGrid}>
        {FACILITY_OPTIONS.map(({text, key, icon: Icon}) => {
          const isSelected = facilitiesInfo[key];
          return (
            <Pressable
              key={key}
              style={[
                styles.facilityChip,
                isSelected && styles.facilityChipSelected,
              ]}
              onPress={() => toggleFacility(key)}>
              {isSelected ? (
                <CheckCircle2
                  size={18}
                  color="#3CBBFF"
                  strokeWidth={2.2}
                  style={{marginRight: 6}}
                />
              ) : (
                <Icon
                  size={18}
                  color="#999"
                  strokeWidth={1.7}
                  style={{marginRight: 6}}
                />
              )}
              <CustomText
                style={[
                  styles.facilityText,
                  isSelected && styles.facilityTextSelected,
                ]}>
                {text}
              </CustomText>
            </Pressable>
          );
        })}
      </View>

      {/* ✅ 에러 메시지 (옵션) */}
      {error === 'FacilitiesInfo' && (
        <CustomText style={styles.errorMessage}>
          편의시설을 하나 이상 선택해주세요.
        </CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginHorizontal: 18,
  },
  registrationSpacing: {
    marginTop: 0,
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
    marginBottom: 12,
  },
  facilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: ColorUtil.placeholderBorder,
    backgroundColor: '#fff',
  },
  facilityChipSelected: {
    borderColor: '#3CBBFF',
    backgroundColor: 'rgba(60,187,255,0.08)',
  },
  facilityText: {
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  facilityTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    marginTop: 6,
  },
});

export default StoreFacilitiesInfo;
