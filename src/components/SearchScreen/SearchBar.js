import React, {useCallback, useRef, useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Pressable} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CancelText from '../CancelText/CancelText';
import {useFocusEffect} from '@react-navigation/native';
import CustomTextInput from '../../utils/CustomTextInput';
import ColorUtil from '../../utils/ColorUtil';
import ChatbotIcon from '../../assets/svg/ChatbotIcon';
import CustomText from '../../utils/CustomText';
const SearchBar = ({
  value,
  onChangeText,
  placeholder,
  onPress,
  onBackPress,
  onHomePress,
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }, []),
  );
  return (
    <View style={[styles.container, {paddingTop: 10}]}>
      <View style={styles.contentRow}>
        <View
          style={[
            styles.searchContainer,
            {borderColor: focused ? '#3cbbff' : ColorUtil.border},
          ]}>
          <Pressable
            style={styles.backBtn}
            onPress={() => onBackPress && onBackPress()}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </Pressable>

          <View style={styles.inputWrapper}>
            <CustomTextInput
              ref={inputRef}
              maxScale={1.1}
              style={[styles.textInput, value.length > 0 && {marginRight: 30}]}
              placeholder={placeholder || '검색어를 입력해주세요.'}
              placeholderTextColor="#7E8081"
              value={value}
              onChangeText={onChangeText}
              returnKeyType="search"
              onSubmitEditing={onPress}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            {value.length > 0 && focused && (
              <CancelText
                rightnum={6}
                paddingnum={0}
                centerVertical
                handlecancel={onChangeText}
                size={18}
              />
            )}
          </View>
        </View>
        <Pressable
          style={[styles.exploreButton]}
          onPress={() => onHomePress && onHomePress()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <View style={styles.exploreButtonContent}>
            <ChatbotIcon size={35} color="#333" />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 48,
    borderRadius: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  backBtn: {
    marginRight: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
    // marginRight: 30,
  },
  exploreButton: {
    width: 48,
    height: 48,
    borderRadius: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: ColorUtil.border,
  },
  exploreButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 1,
  },
  exploreText: {
    fontSize: 12,
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },
});

export default SearchBar;
