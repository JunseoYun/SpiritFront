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
    <View style={styles.container}>
      <View style={styles.grid}>
        {FACILITY_ITEMS.map(({key, label, icon: Icon}) => {
          const isAvailable = !!facilities[key];
          return (
            <View key={key} style={styles.item}>
              <View
                style={[styles.iconBox, isAvailable && styles.iconBoxActive]}>
                <Icon
                  size={20}
                  color={isAvailable ? '#3CBBFF' : '#C2C7D1'}
                  strokeWidth={2}
                />
              </View>
              <Text
                style={[styles.label, isAvailable && styles.labelActive]}
                numberOfLines={1}>
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
  container: {
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 16,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 22,
  },
  item: {
    width: '30%',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#E7E9EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconBoxActive: {
    backgroundColor: '#F3FAFF',
    borderColor: '#CDEBFF',
    shadowColor: '#3CBBFF',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
  },
  label: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12.5,
    color: '#A1A8B3',
    textAlign: 'center',
  },
  labelActive: {
    color: '#222',
    fontFamily: 'Pretendard-Medium',
  },
});
