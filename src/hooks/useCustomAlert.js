import React, {useState, useRef, useCallback} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
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
    confirmText: '확인',
    cancelText: '취소',
  });

  // ✅ 모달 열기
  const showAlert = useCallback(
    ({
      title,
      message,
      onConfirm,
      onCancel,
      type = 'ok',
      confirmText = '확인',
      cancelText = '취소',
    }) => {
      setAlertConfig({
        title,
        message,
        onConfirm,
        onCancel,
        type,
        confirmText,
        cancelText,
      });
      setIsVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
    [opacity],
  );

  // ✅ 모달 닫기
  const closeAlert = useCallback(
    callback => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
        if (callback) callback(); // 모달 완전히 닫힌 후 실행
      });
    },
    [opacity],
  );

  // ✅ Alert 컴포넌트
  const AlertComponent = () => {
    if (!isVisible) return null;

    const {
      title,
      message,
      onConfirm,
      onCancel,
      type,
      confirmText = '확인',
      cancelText = '취소',
    } = alertConfig;

    return (
      <Portal>
        <Modal
          transparent
          visible={isVisible}
          animationType="none"
          statusBarTranslucent={true}
          onRequestClose={() => closeAlert()}>
          <View style={styles.overlay}>
            <Animated.View style={[styles.alertBox, {opacity}]}>
              {title && <Text style={styles.alertTitle}>{title}</Text>}
              {message && <Text style={styles.alertMessage}>{message}</Text>}

              <View style={styles.buttonContainer}>
                {/* ✅ 일반 확인/취소 */}
                {type === 'confirm' && (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onCancel)}>
                      <Text style={styles.buttonText}>{cancelText}</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onConfirm)}>
                      <Text style={styles.buttonText}>{confirmText}</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* ✅ 마케팅 동의 */}
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

                {/* ✅ 삭제 */}
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

                {/* ✅ 회원 탈퇴 */}
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

                {/* ✅ 알림 설정 */}
                {type === 'notificationSetting' && (
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
                      <Text style={styles.buttonText}>설정 이동</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* ✅ 단일 확인 버튼 */}
                {type === 'ok' && (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => closeAlert(onConfirm)}>
                    <Text style={styles.buttonText}>확인</Text>
                  </TouchableOpacity>
                )}

                {type === 'unsavedLeave' && (
                  <>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onCancel)}>
                      <Text style={styles.buttonText}>{cancelText || '취소'}</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => closeAlert(onConfirm)}>
                      <Text style={styles.buttonDeleteText}>
                        {confirmText || '나가기'}
                      </Text>
                    </TouchableOpacity>
                  </>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    lineHeight: 22,
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
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
  },
  buttonDeleteText: {
    color: '#f44336',
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
});
