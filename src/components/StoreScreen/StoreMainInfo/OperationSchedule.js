import React from 'react';

import {View, Text, StyleSheet, Pressable} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorUtil from '../../../utils/ColorUtil';
import CustomText from '../../common/CustomText';
const OperationSchedule = ({
  toggleExpand,
  isExpanded = false,
  isAlwaysOpen,
  isOpen,
  isBreak,
  closed,
  nextclosed,
  starttime,
  endtime,
  breakend,
  type,
}) => {
  return (
    <>
      <Pressable
        style={[styles.timesetview, type === 'preview' && {marginTop: 0}]}
        onPress={toggleExpand}>
        {type !== 'preview' && (
          <Ionicons name="time-outline" size={20} color="#333" />
        )}

        {isOpen && !isBreak && isAlwaysOpen == false && (
          <>
            <CustomText style={[styles.timetextnow, {color: 'green'}]}>
              영업 중
            </CustomText>
            <CustomText style={styles.timetext}>
              영업 종료 - {endtime}
            </CustomText>
          </>
        )}
        {!isOpen &&
          !isBreak &&
          isAlwaysOpen == false &&
          !closed &&
          !nextclosed && (
            <>
              <CustomText style={[styles.timetextnow, {color: '#F05650'}]}>
                영업 종료
              </CustomText>
              <CustomText style={styles.timetext}>
                영업 시작 - {starttime}
              </CustomText>
            </>
          )}
        {!isOpen &&
          !isBreak &&
          isAlwaysOpen == false &&
          !closed &&
          nextclosed && (
            <>
              <CustomText style={[styles.timetextnow, {color: '#F05650'}]}>
                영업 종료
              </CustomText>
              <CustomText style={styles.timetext}>익일 휴무</CustomText>
            </>
          )}
        {isOpen && isBreak && isAlwaysOpen == false && (
          <>
            <CustomText style={[styles.timetextnow, {color: '#F05650'}]}>
              브레이크 타임
            </CustomText>
            <CustomText style={styles.timetext}>
              영업 시작 - {breakend}
            </CustomText>
          </>
        )}
        {closed && !isOpen && !isBreak && isAlwaysOpen == false && (
          <>
            <CustomText style={[styles.timetextnow, {color: '#F05650'}]}>
              금일 휴무
            </CustomText>
          </>
        )}
        {isAlwaysOpen == true && (
          <>
            <CustomText style={[styles.timetextnow, {color: 'green'}]}>
              영업 중
            </CustomText>
            <CustomText style={styles.timetext}>- 연중무휴</CustomText>
          </>
        )}

        {type !== 'preview' && (
          <View style={styles.togglebtn}>
            {!isExpanded && (
              <Entypo name="chevron-small-down" size={20} color="#5F5F5F" />
            )}
            {isExpanded && (
              <Entypo name="chevron-small-up" size={20} color="#5F5F5F" />
            )}
          </View>
        )}
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  timesetview: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  timetextnow: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    marginLeft: 7,
  },
  timetext: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: ColorUtil.subText,
    marginLeft: 5,
  },
  togglebtn: {
    right: 15,
    position: 'absolute',
    alignSelf: 'center',
  },
});

export default OperationSchedule;
