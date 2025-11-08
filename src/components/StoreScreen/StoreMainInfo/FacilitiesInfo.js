import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {
  SunMedium,
  DoorOpen,
  TvMinimal,
  Wine,
  UsersRound,
  CarFront,
} from 'lucide-react-native';
import ColorUtil from '../../../utils/ColorUtil';

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

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>매장 편의시설</Text>
      </View>

      <View style={styles.grid}>
        {FACILITY_ITEMS.map(({key, label, icon: Icon}) => {
          const isAvailable = !!facilities[key];
          return (
            <View key={key} style={styles.item}>
              <View
                style={[
                  styles.iconContainer,
                  isAvailable && styles.iconContainerActive,
                ]}>
                <Icon
                  size={18}
                  color={isAvailable ? ColorUtil.main : '#A9B2C2'}
                  strokeWidth={2}
                />
              </View>
              <Text style={[styles.label, isAvailable && styles.labelActive]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default FacilitiesInfo;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: ColorUtil.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    color: '#111',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
    justifyContent: 'space-between',
  },
  item: {
    width: '30%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconContainerActive: {
    backgroundColor: ColorUtil.rgba(ColorUtil.main, 0.15),
  },
  label: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#9BA2AF',
    textAlign: 'center',
  },
  labelActive: {
    color: '#111',
    fontFamily: 'Pretendard-Medium',
  },
});
