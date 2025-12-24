import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RejectModal from '../../components/Reject/RejectModal';
import useHandlePendingNotification from '../../hooks/notification/useHandlePendingNotification';
import {useNotification} from '../../context/NotificationContext';
import CustomText from '../../utils/CustomText';

const MainScreen = ({navigation}) => {
  const [rejectModalData, setRejectModalData] = useState(null);
  const {pendingNotification, setPendingNotification} = useNotification();

  useHandlePendingNotification(
    false,
    pendingNotification,
    () => setPendingNotification(null),
    data => setRejectModalData(data),
  );

  useEffect(() => {
    const checkStoredNotification = async () => {
      const stored = await AsyncStorage.getItem('PENDING_NOTIFICATION');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setPendingNotification(data);
          await AsyncStorage.removeItem('PENDING_NOTIFICATION');
        } catch (e) {}
      }
    };

    checkStoredNotification();
  }, [setPendingNotification]);

  return (
    <View style={styles.container}>
      <CustomText style={styles.title}>메인 화면</CustomText>
      <CustomText style={styles.subtitle}>
        원하는 화면으로 이동해 보세요.
      </CustomText>

      {rejectModalData && (
        <RejectModal
          data={rejectModalData}
          onClose={() => setRejectModalData(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Pretendard-Medium',
    marginBottom: 18,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#333',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'Pretendard-Bold',
  },
});

export default MainScreen;
