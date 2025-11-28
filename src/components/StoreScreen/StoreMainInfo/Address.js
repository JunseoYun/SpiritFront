import React, {useRef, useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  ToastAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from 'react-native/Libraries/Components/Clipboard/Clipboard';
import {useToast} from '../../../context/ToastContext';
import CustomText from '../../../utils/CustomText';

const Address = ({locationDto}) => {
  const addressText = useMemo(() => {
    if (!locationDto) {
      return '';
    }
    const base = locationDto.address || '';
    const detail = locationDto.addressDetail
      ? `, ${locationDto.addressDetail}`
      : '';
    return `${base}${detail}`.trim();
  }, [locationDto]);

  if (!addressText) {
    return null;
  }

  const [showOverlay, setShowOverlay] = useState(false);
  const [triggerHeight, setTriggerHeight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {showToast} = useToast();

  const handleCopy = useCallback(() => {
    const base = locationDto?.address || '';
    Clipboard.setString(base);
    if (Platform.OS === 'android') {
      ToastAndroid.show('주소를 복사했어요.', ToastAndroid.SHORT);
    } else {
      showToast?.('주소를 복사했어요.');
    }
  }, [locationDto?.address, showToast]);

  const openOverlay = () => {
    setShowOverlay(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const closeOverlay = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => setShowOverlay(false));
  };

  const toggleOverlay = () => {
    if (showOverlay) {
      closeOverlay();
    } else {
      openOverlay();
    }
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={styles.addresssetview}
        onPress={toggleOverlay}
        onLayout={event => setTriggerHeight(event.nativeEvent.layout.height)}>
        <Ionicons name="storefront-outline" size={20} color="#333" />
        <View style={styles.textWrapper}>
          <CustomText style={styles.infoHidetext} numberOfLines={2}>
            {addressText}
          </CustomText>
        </View>
      </Pressable>

      {showOverlay && (
        <>
          <Pressable style={styles.backdrop} onPress={closeOverlay} />
          <Animated.View
            style={[
              styles.overlayCard,
              {
                top: triggerHeight + 12,
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.overlayHeader}>
              <CustomText style={styles.overlayTitle}>주소</CustomText>
              <Pressable onPress={closeOverlay} hitSlop={8}>
                <Ionicons name="close" size={18} color="#9AA0AF" />
              </Pressable>
            </View>

            <View style={styles.overlayAddressRow}>
              <CustomText style={styles.overlayAddressText}>
                {addressText}
              </CustomText>
              <Pressable onPress={handleCopy} style={styles.copyButton}>
                <CustomText style={styles.copyButtonText}>복사</CustomText>
              </Pressable>
            </View>
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 18,
    marginTop: 12,
    position: 'relative',
  },
  addresssetview: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 6,
  },
  infoHidetext: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    top: -2000,
    bottom: -2000,
    left: -2000,
    right: -2000,
    zIndex: 5,
  },
  overlayCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
    borderRadius: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F2F6',
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overlayTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#111',
  },

  overlayAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  overlayAddressText: {
    flex: 1,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#111',
    marginRight: 10,
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#E6F5FF',
  },
  copyButtonText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    color: '#0A84FF',
  },
});

export default Address;
