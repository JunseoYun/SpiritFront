import React, {useLayoutEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, View, Pressable, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OrderUserScreen from './OrderUserScreen';
import OrderOwnerScreen from './OrderOwnerScreen';

const OrderScreen = ({navigation}) => {
  const [ownerMode, setOwnerMode] = useState(false);

  useLayoutEffect(() => {
    navigation?.setOptions?.({
      title: ownerMode ? '사장님 주문' : '나의 주문내역',
    });
  }, [ownerMode, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toggleRow}>
        <View style={styles.segment}>
          <Pressable
            onPress={() => setOwnerMode(false)}
            style={[styles.segmentBtn, !ownerMode && styles.segmentActive]}
            hitSlop={8}>
            <View style={styles.segmentInner}>
              <Ionicons
                name="person-outline"
                size={16}
                color={!ownerMode ? '#fff' : '#6B7280'}
                style={{marginRight: 6}}
              />
              <Text
                style={[
                  styles.segmentText,
                  !ownerMode && styles.segmentTextActive,
                ]}>
                내 주문
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setOwnerMode(true)}
            style={[styles.segmentBtn, ownerMode && styles.segmentActive]}
            hitSlop={8}>
            <View style={styles.segmentInner}>
              <Ionicons
                name="briefcase-outline"
                size={16}
                color={ownerMode ? '#fff' : '#6B7280'}
                style={{marginRight: 6}}
              />
              <Text
                style={[
                  styles.segmentText,
                  ownerMode && styles.segmentTextActive,
                ]}>
                사장님
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      {ownerMode ? (
        <OrderOwnerScreen navigation={navigation} />
      ) : (
        <OrderUserScreen navigation={navigation} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  toggleRow: {paddingHorizontal: 16, paddingTop: 8},
  segment: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    padding: 4,
    alignSelf: 'center',
  },
  segmentBtn: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999},
  segmentActive: {backgroundColor: '#111827'},
  segmentText: {
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    fontSize: 13,
  },
  segmentTextActive: {color: '#fff', fontFamily: 'Pretendard-SemiBold'},
  segmentInner: {flexDirection: 'row', alignItems: 'center'},
});

export default OrderScreen;
