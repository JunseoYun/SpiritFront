import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';

const {width, height} = Dimensions.get('window');

const MySplashScreen = ({isVersionValid}) => {
  const storeUrl =
    Platform.OS === 'android'
      ? 'https://play.google.com/store/apps/details?id=com.spiritfront'
      : 'https://apps.apple.com/kr/app/%ED%95%9C%EC%9E%94%ED%95%A0%EA%B9%8C/id6740095371';

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logoWhite.png')} style={styles.logo} />
      <Text style={styles.text}>TEAM SPIRIT</Text>

      {!isVersionValid && (
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Image
              source={require('../assets/logoWhite.png')} // 앱 아이콘 이미지
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>한잔할까 업데이트 안내</Text>
            <Text style={styles.modalDesc}>
              더 나은 서비스 이용을 위해{'\n'}앱 업데이트가 필요해요.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => Linking.openURL(storeUrl)}>
              <Text style={styles.modalButtonText}>앱 업데이트</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

export default MySplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  text: {
    position: 'absolute',
    bottom: 70,
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 반투명 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  modalIcon: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#111',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'Pretendard-Medium',
  },
  modalButton: {
    width: '90%',
    backgroundColor: '#45C9FF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
});
