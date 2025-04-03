import React from 'react';
import {View, TextInput, StyleSheet, Dimensions} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

const screenWidth = Dimensions.get('window').width;

const StoreSearchBar = ({value, onChangeText, placeholder, onPress}) => {
  return (
    <View style={styles.container}>
      <EvilIcons style={styles.icon} name="search" size={24} color="gray" />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder || '검색어를 입력해주세요.'}
        placeholderTextColor="#A9A9A9"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search" // ✅ 키보드에 '검색' 버튼 표시 (iOS & Android)
        onSubmitEditing={onPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // 부드러운 배경색
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000', // 그림자
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2, // Android 그림자
    width: screenWidth * 0.9,
    alignSelf: 'center', // 중앙 정렬
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#333', // 입력 텍스트 색상
    fontFamily: 'Pretendard-Medium',
  },
});

export default StoreSearchBar;
