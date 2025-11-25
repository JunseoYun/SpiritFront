import React from 'react';
import {Modal, View, Text, Pressable, StyleSheet} from 'react-native';
import CustomText from '../common/CustomText';

const RejectModal = ({data, onClose}) => {
  const body = data?.body || '';
  const lines = body.split('\n');

  const firstLine = lines[0] || '';
  const secondLine = lines[1] || '';

  // 매장명 추출
  const storeNameMatch = firstLine.match(/^(.+?) 매장의/);
  const storeName = storeNameMatch?.[1] || '';
  const firstLineSuffix = firstLine.replace(storeName, '');

  return (
    <Modal statusBarTranslucent={true} transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <CustomText style={styles.title}>매장 인증 거절됨</CustomText>

          {/* 굵은 매장명 + 이어지는 문장 */}
          <CustomText style={styles.mainText}>
            <CustomText style={styles.storeName}>{storeName}</CustomText>
            {firstLineSuffix}
          </CustomText>

          {/* 줄바꿈 후 거절 사유 */}
          {secondLine !== '' && (
            <CustomText style={styles.reason}>{secondLine}</CustomText>
          )}
          <CustomText style={{color: '#999', paddingVertical: 4}}>
            스피릿에 문의{'\n'}team19spirit@gmail.com
          </CustomText>
          <Pressable style={styles.button} onPress={onClose}>
            <CustomText style={styles.buttonText}>확인</CustomText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    marginBottom: 12,
  },
  storeName: {
    fontFamily: 'Pretendard-Bold',
    color: '#121212',
  },
  mainText: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
    fontFamily: 'Pretendard-Medium',
    color: '#121212',
  },
  reason: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 22,
    fontFamily: 'Pretendard-Medium',
    color: '#121212',
  },
  button: {
    backgroundColor: '#3CBBFF',
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
});

export default RejectModal;
