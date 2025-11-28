import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CancelText from '../CancelText/CancelText';
import {normalizeFont} from '../../hooks/normalizeFont';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';

const NameInput = ({
  name,
  setName,
  nameRef,
  isnameFocused,
  nameplaceholder,
  nameerror,
  error,
  shownameLabel,
  handlenamechange,
  handleNameStepComplete,
  setIsnameFocused,
}) => {
  return (
    <View style={[styles.labeledInputContainer, {marginBottom: 20}]}>
      {shownameLabel && (
        <CustomText
          style={[styles.inputLabel, isnameFocused && {color: 'black'}]}>
          이름
        </CustomText>
      )}

      <CustomTextInput
        ref={nameRef}
        style={[
          styles.input,
          isnameFocused && styles.inputFocused,
          (error === 'name' || nameerror.name) && styles.errorFocused,
        ]}
        placeholder={nameplaceholder}
        placeholderTextColor="#999"
        value={name}
        onChangeText={handlenamechange}
        onSubmitEditing={handleNameStepComplete}
        onFocus={() => setIsnameFocused(true)}
        onBlur={() => {
          handleNameStepComplete();
          setIsnameFocused(false);
        }}
        returnKeyType="next"
      />
      {name?.length > 0 && isnameFocused && (
        <CancelText
          rightnum={10}
          topnum={12}
          paddingnum={4}
          handlecancel={handlenamechange}
          size={normalizeFont(20)}
        />
      )}
      {nameerror.name && (
        <CustomText style={styles.errorMessage}>{nameerror.name}</CustomText>
      )}
      {error === 'name' && (
        <CustomText style={styles.errorMessage}>
          이름을 입력해주세요.
        </CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  labeledInputContainer: {
    position: 'relative',
  },
  inputLabel: {
    position: 'absolute',
    top: -7,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#999',
    zIndex: 1,
    fontFamily: 'Pretendard-Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: 'black',
    paddingRight: 40,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: 'black',
  },
  errorFocused: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    marginHorizontal: 5,
    fontFamily: 'Pretendard-Medium',
  },
});

export default NameInput;
