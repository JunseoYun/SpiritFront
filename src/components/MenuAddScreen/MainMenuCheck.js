import React from 'react';
import {View, Text, Pressable, StyleSheet, Switch} from 'react-native';

const MainMenuCheck = ({isChecked, onToggle, imagecheck}) => {
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          marginLeft: 18,
          alignItems: 'center',
        }}>
        <Text style={styles.checkBoxText}>대표 메뉴로 설정</Text>
        <Switch
          value={isChecked}
          onValueChange={onToggle}
          trackColor={{false: '#ccc', true: '#16BBFF'}}
          thumbColor={'#fff'}
        />
      </View>
      {!imagecheck && isChecked && (
        <Text style={styles.textinfo}>
          대표 메뉴는 사진을 등록하지 않으면 카테고리 탭에 노출되지 않아요.
        </Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '40%',
    marginHorizontal: 18,
    flexDirection: 'row',
    paddingTop: 10,
    marginTop: 20,
  },
  checkBoxIndicator: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 10,
  },
  checkBoxText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginRight: 3,
  },
  textinfo: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    marginHorizontal: 18,
    marginVertical: 10,
    color: '#999',
  },
});

export default MainMenuCheck;
