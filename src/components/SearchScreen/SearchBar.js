import React, {useCallback, useRef, useState} from 'react';
import {View, TouchableOpacity, StyleSheet, Pressable} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CancelText from '../CancelText/CancelText';
import {useFocusEffect} from '@react-navigation/native';
import CustomTextInput from '../../utils/CustomTextInput';
import ColorUtil from '../../utils/ColorUtil';
import {AILogoIcon} from '../../assets/svg/AILogoIcon';
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
        <View style={styles.searchContainer}>
          <Pressable
            style={styles.backBtn}
            onPress={() => onBackPress && onBackPress()}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </Pressable>

          <View style={styles.inputWrapper}>
            {/* <AntDesign name="search1" size={18} color={'#A9A9A9'} /> */}
            <CustomTextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder={placeholder || '검색어를 입력해주세요.'}
              placeholderTextColor="#9E9E9E"
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
          style={[styles.homeButton]}
          onPress={() => onHomePress && onHomePress()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <View style={styles.homeButtonContent}>
            <AILogoIcon size={19} />
            <CustomText style={[styles.exploreText]}>탐색</CustomText>
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
    borderRadius: 9,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: ColorUtil.border,
    paddingHorizontal: 12,

    flex: 1,
    marginRight: 12,
  },
  backBtn: {
    marginRight: 8,
    paddingRight: 6,
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
    color: '#121212',
    fontFamily: 'Pretendard-Regular',
    paddingRight: 30,
  },
  homeButton: {
    width: 48,
    height: 48,
    borderRadius: 9,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: ColorUtil.border,
  },
  homeButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
  },
  exploreText: {
    fontSize: 12,
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },
});

export default SearchBar;
