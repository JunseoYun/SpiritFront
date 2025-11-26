import React, {useRef, useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트
import {useToast} from '../../context/ToastContext';
import CancelText from '../CancelText/CancelText';
import {normalizeFont} from '../../hooks/normalizeFont';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';

const UpdateStoreName = ({updatedValue, setUpdatedValue, onCancel, onSave}) => {
  const {showToast} = useToast();
  const curLenRef = useRef((updatedValue || '').length);
  const [overText, setOverText] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.bottomSheetContent}>
      <CustomText style={styles.title}>매장 이름</CustomText>
      <View>
        <CustomTextInput
          style={styles.input}
          defaultValue={updatedValue}
          onChangeText={text => {
            curLenRef.current = text.length;
            // 50자 도달 시 안내문 노출되도록 처리
            setOverText(text.length >= 50);
            setUpdatedValue(text);
          }}
          placeholder="매장 이름*"
          placeholderTextColor="#999"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {updatedValue.length > 0 && focused && (
          <CancelText
            rightnum={12}
            topnum={normalizeFont(19)}
            paddingnum={0}
            handlecancel={setUpdatedValue}
            size={normalizeFont(22)}
          />
        )}
      </View>
      {overText && (
        <CustomText style={styles.errorText}>
          매장 이름은 최대 50자까지 입력 가능합니다.
        </CustomText>
      )}
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreName;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 20,
  },
  input: {
    fontSize: 20,
    fontFamily: 'Pretendard-Medium',
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#999',
    padding: 10,
    paddingVertical: 15,
    color: 'black',
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
  },
});
