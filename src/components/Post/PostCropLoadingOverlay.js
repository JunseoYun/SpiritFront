import React from 'react';
import {Animated, Dimensions, StyleSheet, View} from 'react-native';
import ImageIcon from '../../assets/svg/ImageIcon';
import CustomText from '../../utils/CustomText';

const {width} = Dimensions.get('window');

const PostCropLoadingOverlay = ({
  visible,
  progressAnim,
  progressValue,
  noticeText,
}) => {
  if (!visible) {
    return null;
  }
  const safeProgress =
    typeof progressValue === 'number' && Number.isFinite(progressValue)
      ? Math.max(0, Math.min(1, progressValue))
      : 0;
  const percent = Math.round(safeProgress * 100);

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <ImageIcon size={64} color="#3cbbff" strokeWidth={1.6} />
        <CustomText style={styles.title}>사진 처리중입니다.</CustomText>
        <CustomText style={styles.text}>
          {noticeText || '잠시만 기다려 주세요!'}
        </CustomText>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.indicator,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <CustomText style={styles.percentText}>{percent}%</CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 9999,
  },
  box: {
    width: Math.min(320, width - 48),
    paddingHorizontal: 24,
    paddingVertical: 22,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 4},
    elevation: 8,
    alignItems: 'center',
    gap: 8,
  },
  title: {
    marginTop: 6,
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#111',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
  track: {
    marginTop: 10,
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#DFF4FF',
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#3cbbff',
  },
  percentText: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#8A8A8A',
  },
});

export default PostCropLoadingOverlay;
