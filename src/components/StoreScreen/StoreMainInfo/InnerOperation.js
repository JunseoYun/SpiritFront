import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import ColorUtil from '../../../utils/ColorUtil';

const InnerOperation = ({
  toggleExpand,
  isExpanded,
  isAlwaysOpen,
  operationSchedule,
}) => {
  return (
    <>
      {isExpanded && (
        <Pressable style={styles.timeView} onPress={toggleExpand}>
          {operationSchedule && isAlwaysOpen == false ? (
            <>
              {/* <Ionicons name="time-outline" size={20} color="#333" /> */}
              <View style={styles.openView}>
                {operationSchedule.map((dayInfo, index) =>
                  index === 0 ? (
                    <View key={index} style={{}}>
                      <Text
                        style={[
                          styles.infoHidetext,
                          {fontFamily: 'Pretendard-SemiBold'},
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
            isAlwaysOpen == true && (
              <>
                {/* <Ionicons name="time-outline" size={20} color="#333" /> */}
                <Text style={styles.infoHidetext}>매일 00:00 - 24:00</Text>
              </>
            )
          )}
        </Pressable>
      )}
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
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
  },
  openView: {
    marginLeft: 27,
  },
  infoHidetext: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
});

export default InnerOperation;
