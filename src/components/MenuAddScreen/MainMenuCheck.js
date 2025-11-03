import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {normalizeFont} from '../../hooks/normalizeFont';

const MENU_TYPES = [
  {label: '일반', value: 'NORMAL'},
  {label: '대표', value: 'MAIN'},
  {label: '사이드', value: 'SIDE'},
];

const MainMenuCheck = ({selectedType, imagecheck, onChangeType, isUpdate}) => {
  return (
    <View
      style={[
        styles.container,
        isUpdate && {marginHorizontal: 0, marginTop: 10},
      ]}>
      {!isUpdate && <Text style={styles.labelText}>메뉴 구분</Text>}
      <View style={styles.typeView}>
        {MENU_TYPES.map(type => {
          const isSelected = selectedType === type.value;
          return (
            <Pressable
              key={type.value}
              style={[styles.button, isSelected && styles.buttonSelected]}
              onPress={() => onChangeType(type.value)}>
              <Text
                allowFontScaling={false}
                style={[styles.text, isSelected && styles.textSelected]}>
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!imagecheck && selectedType === 'MAIN' && (
        <Text style={styles.textinfo}>
          대표 메뉴는 사진이 없으면 카테고리 탭에 표시되지 않아요.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: 20,
  },
  labelText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  typeView: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSelected: {
    backgroundColor: '#E8F7FF',
    borderColor: '#3CBBFF',
  },
  text: {
    fontSize: normalizeFont(14, 1.5),
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  textSelected: {
    color: '#3CBBFF',
    fontWeight: '600',
  },
  textinfo: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    fontFamily: 'Pretendard-Medium',
  },
});

export default MainMenuCheck;
