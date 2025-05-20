import React, {useState, useRef} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import {Portal} from 'react-native-paper';

const useCustomAlert = () => {
  const [isVisible, setIsVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'confirm',
  });

  // 모달 열기
  const showAlert = ({title, message, onConfirm, onCancel, type = 'ok'}) => {
    setAlertConfig({title, message, onConfirm, onCancel, type});
    setIsVisible(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // 모달 닫기 (애니메이션 후 onClose 실행)
  const closeAlert = callback => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      if (callback) callback(); // 모달이 완전히 닫힌 후 실행
    });
  };

  const AlertComponent = () => {
    if (!isVisible) return null;

    const {title, message, onConfirm, onCancel, type} = alertConfig;

    return (
      <Portal>
        <Modal
          transparent
          visible={isVisible}
          animationType="none"
          onRequestClose={() => closeAlert()}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.alertBox, {opacity}]}>
              {title && <Text style={styles.alertTitle}>{title}</Text>}
              {message && <Text style={styles.alertMessage}>{message}</Text>}

              <View style={styles.buttonContainer}>
                {type === 'confirm' && (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onCancel)}>
                      <Text style={styles.buttonText}>취소</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onConfirm)}>
                      <Text style={styles.buttonText}>확인</Text>
                    </TouchableOpacity>
                  </>
                )}
                {type === 'marketingConsent' && (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onCancel)}>
                      <Text style={styles.buttonText}>거절</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onConfirm)}>
                      <Text style={styles.buttonText}>동의하기</Text>
                    </TouchableOpacity>
                  </>
                )}
                {type === 'delete' && (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onCancel)}>
                      <Text style={styles.buttonText}>취소</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onConfirm)}>
                      <Text style={styles.buttonDeleteText}>삭제</Text>
                    </TouchableOpacity>
                  </>
                )}
                {type === 'withdraw' && (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onCancel)}>
                      <Text style={styles.buttonText}>취소</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onConfirm)}>
                      <Text style={styles.buttonDeleteText}>탈퇴하기</Text>
                    </TouchableOpacity>
                  </>
                )}

                {type === 'ok' && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => closeAlert(onConfirm)}>
                    <Text style={styles.buttonText}>확인</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>
      </Portal>
    );
  };

  return {showAlert, AlertComponent};
};

export default useCustomAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBox: {
    width: '80%',
    backgroundColor: 'white',
    alignItems: 'center',
    borderRadius: 10,
  },
  alertTitle: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    lineHeight: 20,
    marginBottom: 15,
    marginTop: 20,
    color: '#181A1A',
  },
  alertMessage: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
    marginBottom: 20,
    marginHorizontal: 18,
    flexWrap: 'wrap',
    color: '#181A1A',
    height: 'auto',
    lineHeight: 22,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDeleteText: {
    color: '#f44336',

    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
});
