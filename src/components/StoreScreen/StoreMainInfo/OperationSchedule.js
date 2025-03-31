import React from 'react';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
const OperationSchedule = ({
  toggleExpand,
  isExpanded,
  isUpdate,
  storedata,
  isOpen,
  isBreak,
  closed,
  nextclosed,
  starttime,
  endtime,
  breakend,
}) => {
  return (
    <>
      {!isUpdate && (
        <TouchableOpacity style={styles.timesetview} onPress={toggleExpand}>
          <Ionicons name="time-outline" size={20} color="#333" />
          {isOpen && !isBreak && storedata?.isAlwaysOpen == false && (
            <>
              <Text style={[styles.timetextnow, {color: 'green'}]}>
                영업 중
              </Text>
              <Text style={styles.timetext}>영업 종료 - {endtime}</Text>
            </>
          )}
          {!isOpen &&
            !isBreak &&
            storedata?.isAlwaysOpen == false &&
            !closed &&
            !nextclosed && (
              <>
                <Text style={[styles.timetextnow, {color: '#F05650'}]}>
                  영업 종료
                </Text>
                <Text style={styles.timetext}>영업 시작 - {starttime}</Text>
              </>
            )}
          {!isOpen &&
            !isBreak &&
            storedata?.isAlwaysOpen == false &&
            !closed &&
            nextclosed && (
              <>
                <Text style={[styles.timetextnow, {color: '#F05650'}]}>
                  영업 종료
                </Text>
                <Text style={styles.timetext}>익일 휴무</Text>
              </>
            )}
          {isOpen && isBreak && storedata?.isAlwaysOpen == false && (
            <>
              <Text style={[styles.timetextnow, {color: '#F05650'}]}>
                브레이크 타임
              </Text>
              <Text style={styles.timetext}>영업 시작 - {breakend}</Text>
            </>
          )}
          {closed &&
            !isOpen &&
            !isBreak &&
            storedata?.isAlwaysOpen == false && (
              <>
                <Text style={[styles.timetextnow, {color: '#F05650'}]}>
                  금일 휴무
                </Text>
              </>
            )}
          {storedata?.isAlwaysOpen == true && (
            <>
              <Text style={[styles.timetextnow, {color: 'green'}]}>
                영업 중
              </Text>
              <Text style={styles.timetext}>- 연중무휴</Text>
            </>
          )}
          <View style={styles.togglebtn}>
            {!isExpanded && (
              <Entypo name="chevron-small-down" size={20} color="#5F5F5F" />
            )}
            {isExpanded && (
              <Entypo name="chevron-small-up" size={20} color="#5F5F5F" />
            )}
          </View>
        </TouchableOpacity>
      )}
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
    fontWeight: 'bold',
    marginLeft: 7,
  },
  timetext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#5F5F5F',
    marginLeft: 5,
  },
  togglebtn: {
    right: 15,
    position: 'absolute',
    alignSelf: 'center',
  },
});

export default OperationSchedule;
