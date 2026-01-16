import React from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const WriteButton = ({
  isOpen,
  onPress,
  writeButtonAnim,
  writeLabelAnim,
  writeIconRotation,
  bottom = 20,
}) => {
  return (
    <View style={[styles.wrapper, {bottom}]}>
      <AnimatedPressable
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: isOpen ? '#333' : ColorUtil.main,
            paddingHorizontal: writeButtonAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [13, 12],
            }),
          },
        ]}>
        <Animated.View
          style={{
            transform: [
              {
                scale: writeButtonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.3, 1],
                }),
              },
              {
                rotate: writeIconRotation,
              },
            ],
          }}>
          <Ionicons name="add" size={24} color="#fff" />
        </Animated.View>
        <Animated.View
          style={{
            opacity: writeLabelAnim,
            marginLeft: writeLabelAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 6],
            }),
            maxWidth: writeLabelAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
            overflow: 'hidden',
            flexShrink: 1,
            transform: [
              {
                translateX: writeLabelAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, 0],
                }),
              },
            ],
            pointerEvents: 'none',
            justifyContent: 'center',
          }}>
          <CustomText numberOfLines={1} style={styles.buttonText}>
            작성
          </CustomText>
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 100,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    marginRight: 7,
  },
});

export default WriteButton;
