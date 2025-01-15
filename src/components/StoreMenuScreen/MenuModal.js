import React from 'react';
import { Modal, View, Pressable, Text, StyleSheet } from 'react-native';

const MenuModal = ({ isModalVisible, onPressModalClose, onUpdate, onDelete, buttonPosition }) => {
  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="none" // 기본 애니메이션 제거
      onRequestClose={onPressModalClose} // Android 뒤로가기 처리
    >
      <Pressable style={styles.modalBackground} onPress={onPressModalClose}>
        <View
          style={[
            styles.modalContainer,
            {
              position: 'absolute',
              top: buttonPosition?.y - 60 || 0, // 버튼 아래로 위치
              left: buttonPosition?.x ? buttonPosition.x + 120 : 0, // 버튼 중심으로 위치
            },
          ]}
        >
          <Pressable onPress={onUpdate} style={styles.modalUpdateButton}>
            <Text style={styles.modalupdetetext}>메뉴 수정</Text>
          </Pressable>
          <View style={styles.separator} />
          <Pressable onPress={onDelete} style={styles.modalDeleteButton}>
            <Text style={styles.deleButtonText}>메뉴 삭제</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '30%',
    height: 100,
    paddingVertical: 5,
    paddingTop: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    
    // Android용 그림자
    elevation: 10,
    
    // iOS용 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  separator: {
    width: '80%',              
    height: 1,         
    backgroundColor: '#E7E7E7', 
    marginHorizontal: 10,  
  },
  modalupdetetext: {
    color: '#333',
    fontSize: 17,
    fontWeight: '600',
  },
  deleButtonText: {
    color: '#F05650',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default MenuModal;
