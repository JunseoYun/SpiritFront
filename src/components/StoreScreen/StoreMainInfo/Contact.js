import React, {useRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  Linking,
  View,
  Animated,
  Platform,
  ToastAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from 'react-native/Libraries/Components/Clipboard/Clipboard';
import {useToast} from '../../../context/ToastContext';
import CustomText from '../../../utils/CustomText';

const Contact = ({contact}) => {
  if (!contact) {
    return null;
  }

  const [showPopover, setShowPopover] = useState(false);
  const [copied, setCopied] = useState(false);
  const [triggerHeight, setTriggerHeight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {showToast} = useToast();

  const formatNumber = value => {
    if (typeof value !== 'string') return value;
    const digitsOnly = value.replace(/[^0-9]/g, '');
    const match = digitsOnly.match(/^(\d{2,3})(\d{3,4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return value;
  };

  const formattedContact = formatNumber(contact);

  const handleCall = () => {
    Linking.openURL(`tel:${contact}`);
  };

  const handleCopy = () => {
    Clipboard.setString(contact);
    setCopied(true);
    if (Platform.OS === 'android') {
      ToastAndroid.show('전화번호가 복사되었어요.', ToastAndroid.SHORT);
    } else {
      showToast?.('전화번호가 복사되었어요.');
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const openPopover = () => {
    setShowPopover(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const closePopover = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => setShowPopover(false));
  };

  const togglePopover = () => {
    if (showPopover) {
      closePopover();
    } else {
      openPopover();
    }
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={styles.triggerRow}
        onPress={togglePopover}
        onLayout={event => setTriggerHeight(event.nativeEvent.layout.height)}>
        <Ionicons name="call-outline" size={20} color="#333" />
        <View style={styles.triggerLabelWrapper}>
          <CustomText style={styles.triggerLabel}>
            {formattedContact}
          </CustomText>
        </View>
      </Pressable>

      {showPopover && (
        <>
          <Pressable style={styles.backdrop} onPress={closePopover} />
          <Animated.View
            style={[
              styles.popover,
              {
                top: triggerHeight + 8,
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.popoverHeader}>
              <CustomText style={styles.popoverTitle}>
                매장과 직접 연결되는 번호입니다.
              </CustomText>
              <Pressable onPress={closePopover}>
                <Ionicons name="close" size={18} color="#9AA0AF" />
              </Pressable>
            </View>
            <CustomText style={styles.popoverDescription}>
              예약, 문의 등 필요한 내용을 전화로 바로 확인할 수 있어요.
            </CustomText>

            <View style={styles.numberRow}>
              <CustomText style={styles.numberLabel}>전화번호</CustomText>
              <CustomText selectable style={styles.numberValue}>
                {formattedContact}
              </CustomText>
              <Pressable onPress={handleCopy}>
                <CustomText style={styles.copyText}>
                  {copied ? '복사됨' : '복사'}
                </CustomText>
              </Pressable>
            </View>
            <Pressable style={styles.callButton} onPress={handleCall}>
              <CustomText style={styles.callButtonText}>전화하기</CustomText>
            </Pressable>
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 18,
    marginTop: 16,
    position: 'relative',
    marginBottom: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    top: -2000,
    bottom: -2000,
    left: -2000,
    right: -2000,
    zIndex: 5,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerLabelWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  triggerLabel: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    color: '#333',
  },
  infoIcon: {
    marginLeft: 4,
  },
  popover: {
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
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popoverTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#111',
    flex: 1,
    marginRight: 12,
  },
  popoverDescription: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#6C7382',
    marginTop: 6,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  numberLabel: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
    color: '#7D8493',
  },
  numberValue: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    color: '#111',
    marginLeft: 6,
  },
  copyText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    color: '#3CBBFF',
    marginLeft: 8,
  },
  callButton: {
    marginTop: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#3CBBFF',
    alignItems: 'center',
  },
  callButtonText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    color: '#fff',
  },
});

export default Contact;
