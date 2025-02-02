import React, {useState} from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const useCustomAlert = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
    type: 'confirm',
  });

  const showAlert = ({title, message, onConfirm, onCancel, type = 'ok'}) => {
    setAlertConfig({title, message, onConfirm, onCancel, type});
    setIsVisible(true);
  };

  const closeAlert = () => {
    setIsVisible(false);
  };

  const AlertComponent = () => {
    if (!isVisible) return null;

    const {title, message, onConfirm, onCancel, type} = alertConfig;

    return (
      <Modal transparent visible={isVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            {title && <Text style={styles.alertTitle}>{title}</Text>}
            {message && <Text style={styles.alertMessage}>{message}</Text>}

            <View style={styles.buttonContainer}>
              {type === 'confirm' && (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      closeAlert();
                      onCancel && onCancel();
                    }}>
                    <Text style={styles.buttonText}>취소</Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      width: 1,
                      height: '100%',
                      backgroundColor: '#E0E0E0',
                    }}
                  />
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={() => {
                      closeAlert();
                      onConfirm && onConfirm();
                    }}>
                    <Text style={styles.buttonText}>확인</Text>
                  </TouchableOpacity>
                </>
              )}
              {type === 'delete' && (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      closeAlert();
                      onCancel && onCancel();
                    }}>
                    <Text style={styles.buttonText}>취소</Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      width: 1,
                      height: '100%',
                      backgroundColor: '#E0E0E0',
                    }}
                  />
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      closeAlert();
                      onConfirm && onConfirm();
                    }}>
                    <Text style={styles.buttonDeleteText}>삭제</Text>
                  </TouchableOpacity>
                </>
              )}
              {type === 'ok' && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    closeAlert();
                    onConfirm && onConfirm();
                  }}>
                  <Text style={styles.buttonText}>확인</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 30,
    color: '#333',
  },
  alertMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: -15,
    marginBottom: 20,
    fontWeight: '400',
    marginHorizontal: 18,
    flexWrap: 'wrap',
    color: '#333',
  },
  buttonContainer: {
    height: 55,
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
    fontWeight: '600',
    fontSize: 16,
  },
  buttonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
