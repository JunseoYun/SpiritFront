import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {
  SunMedium,
  DoorOpen,
  TvMinimal,
  Wine,
  UsersRound,
  CarFront,
} from 'lucide-react-native';
import ColorUtil from '../../../utils/ColorUtil';
import CustomText from '../../common/CustomText';

const FACILITY_ITEMS = [
  {key: 'hasScreen', label: '스크린·TV', icon: TvMinimal},
  {key: 'isGroupAvailable', label: '단체 방문', icon: UsersRound},
  {key: 'hasRoom', label: '개별 룸', icon: DoorOpen},
  {key: 'hasOutdoor', label: '야외 좌석·테라스', icon: SunMedium},
  {key: 'isCorkageAvailable', label: '콜키지 가능', icon: Wine},
  {key: 'isParkingAvailable', label: '주차 가능', icon: CarFront},
];

const DEFAULT_FACILITIES = FACILITY_ITEMS.reduce((acc, item) => {
  acc[item.key] = false;
  return acc;
}, {});

const FacilitiesInfo = ({facilitiesInfoDto}) => {
  const facilities = {...DEFAULT_FACILITIES, ...(facilitiesInfoDto || {})};

  // true인 것만 필터링
  const activeItems = FACILITY_ITEMS.filter(item => facilities[item.key]);

  // 아무것도 없을 때 처리
  if (activeItems.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <CustomText style={styles.emptyText}>
          등록된 편의시설이 없어요.
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 20}}>
        {activeItems.map(item => {
          const Icon = item.icon;
          return (
            <View key={item.key} style={styles.chip}>
              <Icon size={18} color={'#333'} style={{marginRight: 5}} />
              <CustomText style={styles.label}>{item.label}</CustomText>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FacilitiesInfo;

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 15,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 20,
  },

  label: {
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
  },

  emptyBox: {
    marginHorizontal: 18,
    marginTop: 10,
    paddingVertical: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Pretendard-Medium',
  },
});
