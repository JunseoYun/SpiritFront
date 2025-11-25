import React, {useLayoutEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Pressable,
  Text,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OrderUserScreen from './OrderUserScreen';
import OrderOwnerScreen from './OrderOwnerScreen';
import CustomText from '../../../components/common/CustomText';

const OrderScreen = ({navigation}) => {
  const [ownerMode, setOwnerMode] = useState(false);
  const [segmentWidth, setSegmentWidth] = useState(0);
  const [segmentHeight, setSegmentHeight] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useLayoutEffect(() => {
    navigation?.setOptions?.({
      title: ownerMode ? '사장님 주문' : '나의 주문내역',
    });
  }, [ownerMode, navigation]);

  const onToggle = next => {
    setOwnerMode(next);
    const innerWidth = Math.max(segmentWidth - 8, 0);
    const toValue = next ? innerWidth / 2 : 0;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      bounciness: 8,
      speed: 20,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toggleRow}>
        <View
          style={styles.segment}
          onLayout={e => {
            setSegmentWidth(e.nativeEvent.layout.width);
            setSegmentHeight(e.nativeEvent.layout.height);
          }}
          accessibilityRole="tablist">
          {segmentWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.segmentIndicator,
                {
                  width: Math.max((segmentWidth - 8) / 2, 0),
                  height: Math.max(segmentHeight - 8, 0),
                  transform: [{translateX}],
                },
              ]}
            />
          )}

          <Pressable
            onPress={() => onToggle(false)}
            style={styles.segmentBtn}
            accessibilityRole="tab"
            accessibilityState={{selected: !ownerMode}}
            hitSlop={8}>
            <View style={styles.segmentInner}>
              <Ionicons
                name={!ownerMode ? 'person' : 'person-outline'}
                size={16}
                color={!ownerMode ? '#111827' : '#6B7280'}
                style={{marginRight: 6}}
              />
              <CustomText
                style={[
                  styles.segmentText,
                  !ownerMode && styles.segmentTextActive,
                ]}>
                내 주문
              </CustomText>
            </View>
          </Pressable>

          <Pressable
            onPress={() => onToggle(true)}
            style={styles.segmentBtn}
            accessibilityRole="tab"
            accessibilityState={{selected: ownerMode}}
            hitSlop={8}>
            <View style={styles.segmentInner}>
              <Ionicons
                name={ownerMode ? 'briefcase' : 'briefcase-outline'}
                size={16}
                color={ownerMode ? '#111827' : '#6B7280'}
                style={{marginRight: 6}}
              />
              <CustomText
                style={[
                  styles.segmentText,
                  ownerMode && styles.segmentTextActive,
                ]}>
                사장님
              </CustomText>
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
    position: 'relative',
    // subtle shadow for floating feel
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 8},
    elevation: 2,
  },
  segmentBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    flex: 1,
    alignItems: 'center',
  },
  segmentIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 36,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // soft inner shadow feel
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 1,
  },
  segmentText: {
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    fontSize: 13,
  },
  segmentTextActive: {
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
  },
  segmentInner: {flexDirection: 'row', alignItems: 'center'},
  bannerWrap: {
    paddingHorizontal: 0,
    paddingBottom: 4,
  },
});

export default OrderScreen;
