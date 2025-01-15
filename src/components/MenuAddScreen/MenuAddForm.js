import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import MainMenuCheck from './MainMenuCheck';
import MenuTextInput from './MenuTextInput';

const MenuAddForm = ({
  menu,
  index,
  handleMenuChange,
  handleCheckBoxChange,
  onDelete, // 삭제 함수
}) => {
  return (
    <View key={index}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuHeaderText}>메뉴 {index + 1}</Text>
        <Pressable
          style={styles.deleteButton}
          onPress={() => onDelete(index)}
        >
          <Text style={styles.deleteButtonText}>삭제</Text>
        </Pressable>
      </View>
      <MenuTextInput
        label="메뉴 이름*"
        value={menu.menuName}
        onChangeText={(text) => handleMenuChange(text, index, 'menuName')}
        placeholder="메뉴 이름*"
      />
      <MenuTextInput
        label="메뉴 가격*"
        value={menu.price}
        onChangeText={(text) => handleMenuChange(text, index, 'price')}
        placeholder="메뉴 가격*"
      />
      <MenuTextInput
        label="메뉴 소개"
        value={menu.menuContent}
        onChangeText={(text) => handleMenuChange(text, index, 'menuContent')}
        placeholder="메뉴를 간단하게 소개해주세요."
        multiline
      />
      <MainMenuCheck
        isChecked={menu.main}
        onToggle={() => handleCheckBoxChange(index)}
      />
      <View style={styles.line}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  menuHeader: {
    width: '100%',
    paddingHorizontal: 18,
    marginTop: 30,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuHeaderText: {
    fontWeight: '500',
    color: '#333',
    fontSize: 17,
    marginRight: 7,
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FF6B6B',
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  line: {
    width: '100%',
    marginVertical: 20,
    marginBottom: 10,
    paddingVertical: 4,
    backgroundColor: '#F2F2F2',
  },
});

export default MenuAddForm;
