import React from 'react';
import {Modal, View, Text, Pressable, StyleSheet} from 'react-native';

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
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>매장 인증 거절됨</Text>

          {/* 굵은 매장명 + 이어지는 문장 */}
          <Text style={styles.reason}>
            <Text style={styles.storeName}>{storeName}</Text>
            {firstLineSuffix}
          </Text>

          {/* 줄바꿈 후 거절 사유 */}
          {secondLine !== '' && <Text style={styles.reason}>{secondLine}</Text>}
          <Text style={{color: '#999', paddingVertical: 4}}>
            스피릿에 문의{'\n'}team19spirit@gmail.com
          </Text>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>확인</Text>
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
    fontWeight: 'bold',
    marginBottom: 12,
  },
  storeName: {
    fontWeight: 'bold',
    color: '#333',
  },
  reason: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#45C9FF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default RejectModal;
