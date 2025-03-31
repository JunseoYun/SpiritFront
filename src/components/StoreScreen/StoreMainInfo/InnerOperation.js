import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';

const InnerOperation = ({
  toggleExpand,
  isExpanded,
  isUpdate,
  storedata,
  operationSchedule,
  storeTimeEditHandle,
}) => {
  return (
    <>
      {isExpanded &&
        (!isUpdate ? (
          <TouchableOpacity style={styles.timeView} onPress={toggleExpand}>
            {operationSchedule && storedata?.isAlwaysOpen == false ? (
              <>
                {/* <Ionicons name="time-outline" size={20} color="#333" /> */}
                <View style={styles.openView}>
                  {operationSchedule.map((dayInfo, index) =>
                    index === 0 ? (
                      <View key={index} style={{}}>
                        <Text
                          style={[
                            styles.infoHidetext,
                            {fontFamily: 'Pretendard-Bold'},
                          ]}>
                          {dayInfo.day}{' '}
                          {dayInfo.isClosed
                            ? '휴무일'
                            : `${dayInfo.open} ~ ${dayInfo.close}`}
                        </Text>
                        {!dayInfo.isClosed &&
                          dayInfo.breakStart &&
                          dayInfo.breakEnd && (
                            <Text style={styles.infoHidetext}>
                              브레이크 타임 {dayInfo.breakStart} ~{' '}
                              {dayInfo.breakEnd}
                            </Text>
                          )}
                      </View>
                    ) : (
                      <View key={index} style={{marginTop: 5}}>
                        <Text style={styles.infoHidendaytext}>
                          {dayInfo.day}{' '}
                          {dayInfo.isClosed
                            ? '휴무일'
                            : `${dayInfo.open} ~ ${dayInfo.close}`}
                        </Text>
                        {!dayInfo.isClosed &&
                          dayInfo.breakStart &&
                          dayInfo.breakEnd && (
                            <Text style={styles.infoHidendaytext}>
                              브레이크 타임 {dayInfo.breakStart} ~{' '}
                              {dayInfo.breakEnd}
                            </Text>
                          )}
                      </View>
                    ),
                  )}
                </View>
              </>
            ) : (
              storedata?.isAlwaysOpen == true && (
                <>
                  {/* <Ionicons name="time-outline" size={20} color="#333" /> */}
                  <Text style={styles.infoHidetext}>매일 00:00 - 24:00</Text>
                </>
              )
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.timeView}
            onPress={storeTimeEditHandle}>
            {operationSchedule && storedata?.isAlwaysOpen == false ? (
              <>
                <Ionicons name="time-outline" size={20} color="#333" />
                <View>
                  {operationSchedule.map((dayInfo, index) =>
                    index === 0 ? (
                      <View key={index} style={{}}>
                        <Text
                          style={[
                            styles.infoHidetext,
                            {fontFamily: 'Pretendard-Bold', paddingLeft: 10},
                          ]}>
                          {dayInfo.day}{' '}
                          {dayInfo.isClosed
                            ? '휴무일'
                            : `${dayInfo.open} ~ ${dayInfo.close}`}
                        </Text>
                        {!dayInfo.isClosed &&
                          dayInfo.breakStart &&
                          dayInfo.breakEnd && (
                            <Text
                              style={[styles.infoHidetext, {paddingLeft: 10}]}>
                              브레이크 타임 {dayInfo.breakStart} ~{' '}
                              {dayInfo.breakEnd}
                            </Text>
                          )}
                      </View>
                    ) : (
                      <View key={index} style={{marginTop: 5}}>
                        <Text
                          style={[styles.infoHidendaytext, {paddingLeft: 10}]}>
                          {dayInfo.day}{' '}
                          {dayInfo.isClosed
                            ? '휴무일'
                            : `${dayInfo.open} ~ ${dayInfo.close}`}
                        </Text>
                        {!dayInfo.isClosed &&
                          dayInfo.breakStart &&
                          dayInfo.breakEnd && (
                            <Text
                              style={[
                                styles.infoHidendaytext,
                                {paddingLeft: 10},
                              ]}>
                              브레이크 타임 {dayInfo.breakStart} ~{' '}
                              {dayInfo.breakEnd}
                            </Text>
                          )}
                      </View>
                    ),
                  )}
                </View>
              </>
            ) : (
              storedata?.isAlwaysOpen == true && (
                <>
                  <Ionicons name="time-outline" size={20} color="#333" />
                  <Text style={[styles.infoHidetext, {paddingLeft: 10}]}>
                    매일 00:00 - 24:00
                  </Text>
                </>
              )
            )}
            <View
              style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
              <Entypo name="chevron-small-right" size={25} color="#333" />
            </View>
          </TouchableOpacity>
        ))}
    </>
  );
};

const styles = StyleSheet.create({
  timeView: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
    marginHorizontal: 18,
  },
  infoHidendaytext: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#767676',
  },
  openView: {
    marginLeft: 27,
  },
  infoHidetext: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#181A1A',
  },
});

export default InnerOperation;
