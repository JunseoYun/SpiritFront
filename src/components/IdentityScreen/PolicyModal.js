import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
const basePolicyList = [
  '[필수] 개인정보 수집/이용 동의',
  '[필수] 고유식별정보 처리 동의',
  '[필수] 통신사 이용약관 동의',
  '[필수] 서비스 이용약관 동의',
];

const PolicyModal = ({
  isPolicyModalVisible,
  setIsPolicyModalVisible,
  navigation,
  handleAuth,
  selectedCarrier,
}) => {
  const {bottom} = useSafeAndroidInsets();
  const [shouldRender, setShouldRender] = useState(false);
  const translateY = useRef(new Animated.Value(500)).current;
  const policyList = selectedCarrier?.includes('알뜰폰')
    ? [...basePolicyList, '[필수] 개인정보 제3자 제공 동의']
    : basePolicyList;
  useEffect(() => {
    if (isPolicyModalVisible) {
      setShouldRender(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 500,
        duration: 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false); // 애니메이션 끝난 후에 사라지게
      });
    }
  }, [isPolicyModalVisible]);

  const handleClose = () => {
    setIsPolicyModalVisible(false);
  };

  const getPolicyScreen = index => {
    switch (index) {
      case 0:
        return 'PersonalInfo';
      case 1:
        return 'UniqueNumber';
      case 2:
        return 'CarrierUse';
      case 3:
        return 'Service';
      case 4:
        return 'ThirdPartyInfo';
      default:
        return 'PersonalInfo';
    }
  };

  if (!shouldRender) return null;

  return (
    <View style={[styles.overlay, {bottom: bottom}]}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <Animated.View style={[styles.container, {transform: [{translateY}]}]}>
        <View style={styles.header}>
          <Text style={styles.title}>서비스 이용을 위해</Text>
          <Pressable onPress={handleClose}>
            <Ionicons name="close" size={23} color="#333" />
          </Pressable>
        </View>

        <Text style={[styles.title, {marginBottom: 15}]}>
          꼭 필요한 약관만 추렸어요
        </Text>
        <Text style={styles.subtitle}>드림시큐리티 약관</Text>

        {policyList.map((item, index) => (
          <View key={index} style={styles.policyRow}>
            <Text style={styles.policyText}>{item}</Text>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                navigation.navigate(getPolicyScreen(index), {
                  carrier: selectedCarrier, // ⭐️ carrier를 route param으로 같이 전달
                })
              }>
              <Text style={styles.viewButtonText}>보기</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.confirmButton} onPress={handleAuth}>
          <Text style={styles.confirmText}>전체 동의하고 인증번호 받기</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34,34,34,0.4)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 20,
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    alignItems: 'center',
  },
  policyText: {
    fontSize: 13,
    color: '#777',
    flex: 1,
  },
  viewButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f7f7f7',
    borderRadius: 20,
  },
  viewButtonText: {
    fontSize: 11,
    color: '#333',
  },
  confirmButton: {
    marginTop: 30,
    backgroundColor: '#80D2F4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'Pretendard-Bold',
  },
});

export default PolicyModal;
