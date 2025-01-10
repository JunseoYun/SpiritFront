import React from 'react';
import {View, Text, Pressable, Modal, Alert, StyleSheet} from 'react-native';
// import styles from '../../styles/StoreMainStyle';
// import {StoreMaindelete} from '../../api/storeApi';

const StoreModal = ({
  isModalVisible,
  setIsModalVisible,
  onPressModalClose,
  storeId,
  navigation,
}) => {
  const opendeletestore = async () => {
    Alert.alert(
      '삭제하시겠습니까?',
      '',
      [
        {
          text: '확인',
          style: 'destructive',
          // onPress: async () => {
          //   try {
          //     await StoreMaindelete(storeId); // StoreMaindelete 함수 호출
          //     Alert.alert(
          //       '삭제되었습니다.',
          //       '',
          //       [
          //         {
          //           text: '확인',
          //           style: 'destructive',
          //           onPress: () => {
          //             setIsModalVisible(false);
          //             navigation.goBack(); // 삭제 후 메인 페이지로 이동
          //           },
          //         },
          //       ],
          //       {cancelable: false},
          //     );
          //   } catch (error) {
          //     console.error('Error:', error);
          //     Alert.alert('오류가 발생했습니다. 다시 시도해주세요.');
          //   }
          // },
        },
        {
          text: '취소',
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const handlePress = index => {
    if (index == 0) {
      navigation.navigate('UpdateStoreScreen', {
        storeId: storeId,
      });
    }
    onPressModalClose();
  };

  return (
    <Modal visible={isModalVisible} animationType="slide" transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.modaltopview}>
            <View>
              <Pressable
                style={styles.modalupdeteview}
                onPress={() => handlePress(0)}>
                <Text style={styles.modalupdetetext}>매장 수정</Text>
              </Pressable>
              <View style={styles.line}></View>
              <Pressable onPress={opendeletestore} style={styles.deleButton}>
                <Text style={styles.deleButtonText}>매장 삭제</Text>
              </Pressable>
              <Pressable onPress={onPressModalClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
});
export default StoreModal;
