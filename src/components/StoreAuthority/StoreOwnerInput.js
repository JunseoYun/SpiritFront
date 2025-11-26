import React, {useState} from 'react';
import {View, Text, Pressable, TextInput, StyleSheet} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import CancelText from '../CancelText/CancelText';
import {normalizeFont} from '../../hooks/normalizeFont';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';
const StoreOwnerInput = ({
  owners,
  hasCoRepresentative,
  setHasCoRepresentative,
  addOwner,
  updateOwnerName,
  removeOwner,
  nameRef,
  ownerRefs,
  businessNumberRef,
  businessData,
  error,
  errorMessage,
  owneRef,
}) => {
  const [focused, setFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [isfocused, setIsFocused] = useState({});
  return (
    <View style={styles.container}>
      <CustomText ref={owneRef} style={styles.sectionTitle}>
        대표자
      </CustomText>
      {hasCoRepresentative ? (
        <CustomText style={styles.guidetext}>
          ※ 신청자는 주 대표자 또는 공동 대표자여야 합니다.
        </CustomText>
      ) : (
        <CustomText style={styles.guidetext}>
          ※ 신청자는 해당 사업자의 대표자여야 합니다.
        </CustomText>
      )}
      {/* 단일/공동 대표 토글 */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => setHasCoRepresentative(false)}
          style={[
            styles.toggleButton,
            !hasCoRepresentative && styles.selectedToggleButton,
          ]}>
          <CustomText
            style={[
              styles.toggleButtonText,
              !hasCoRepresentative && styles.selectedToggleButtonText,
            ]}>
            단일 대표
          </CustomText>
        </Pressable>
        <Pressable
          onPress={() => setHasCoRepresentative(true)}
          style={[
            styles.toggleButton,
            hasCoRepresentative && styles.selectedToggleButton,
          ]}>
          <CustomText
            style={[
              styles.toggleButtonText,
              hasCoRepresentative && styles.selectedToggleButtonText,
            ]}>
            공동 대표
          </CustomText>
        </Pressable>
      </View>

      {hasCoRepresentative ? (
        <>
          {owners.map((owner, index) => (
            <View key={index} style={styles.inputContainer}>
              <View style={styles.inputHeaderContainer}>
                <View style={styles.labelContainer}>
                  {owner.name ? (
                    <CustomText style={styles.inputLabel}>
                      {index === 0 ? '주 대표자' : `공동 대표`}
                    </CustomText>
                  ) : null}
                </View>
                {owners.length > 1 && (
                  <Pressable
                    onPress={() => removeOwner(index)}
                    hitSlop={10}
                    style={styles.deleteButton}>
                    <AntDesign name="minuscircleo" size={16} color="#ff4d4d" />
                  </Pressable>
                )}
              </View>
              <CustomTextInput
                ref={ref => (ownerRefs.current[index] = ref)}
                style={styles.input}
                placeholder={index === 0 ? '주 대표자 성명' : '공동 대표 성명'}
                placeholderTextColor="#999"
                value={owner.name}
                onChangeText={text => updateOwnerName(index, text)}
                returnKeyType="next"
                onSubmitEditing={() => {
                  const nextRef = ownerRefs.current[index + 1];
                  if (nextRef) {
                    nextRef.focus();
                  }
                  if (!nextRef) {
                    if (!businessData.businessNumber) {
                      businessNumberRef.current?.focus();
                    }
                  }
                }}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
              />
              {owner.name.length > 0 && focusedIndex === index && (
                <CancelText
                  rightnum={0}
                  topnum={normalizeFont(43)}
                  paddingnum={0}
                  handlecancel={() => updateOwnerName(index, '')}
                  size={normalizeFont(20)}
                />
              )}
              {error === 'ownerGroup' && !owner.name && (
                <CustomText style={styles.errorText}>{errorMessage}</CustomText>
              )}
            </View>
          ))}
          <Pressable style={styles.addButton} onPress={addOwner}>
            <CustomText style={styles.addButtonText}>
              대표자 추가하기
            </CustomText>
          </Pressable>
        </>
      ) : (
        <View style={styles.inputContainer}>
          <View style={styles.inputHeaderContainer}>
            <View style={styles.labelContainer}>
              {owners[0].name && (
                <CustomText style={styles.inputLabel}>성명</CustomText>
              )}
            </View>
          </View>
          <CustomTextInput
            style={styles.input}
            ref={nameRef}
            placeholder="성명"
            placeholderTextColor="#999"
            value={owners[0].name}
            onChangeText={text => updateOwnerName(0, text)}
            returnKeyType="next"
            onSubmitEditing={() => {
              if (!businessData.businessNumber) {
                businessNumberRef.current?.focus();
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {owners[0].name.length > 0 && focused && (
            <CancelText
              rightnum={0}
              topnum={normalizeFont(43)}
              paddingnum={0}
              handlecancel={() => updateOwnerName(0, '')}
              size={normalizeFont(20)}
            />
          )}
          {error === 'owner' && !owners[0].name && (
            <CustomText style={styles.errorText}>{errorMessage}</CustomText>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    fontSize: 16,
    marginBottom: 5,
  },
  guidetext: {
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#3CBBFF',
    borderRadius: 4,
    alignItems: 'center',
  },
  selectedToggleButton: {
    backgroundColor: '#3CBBFF',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#3CBBFF',
  },
  selectedToggleButtonText: {
    color: '#fff',
  },
  inputContainer: {
    marginVertical: 10,
  },
  inputHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  labelContainer: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: 'Pretendard-Medium',
    color: '#121212',
    fontSize: 16,
  },
  input: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 7,
    paddingLeft: 1,
    color: 'black',
  },
  addButton: {
    backgroundColor: '#3CBBFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 7,
    alignSelf: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },
  deleteButton: {
    backgroundColor: '#fff',
    paddingRight: 3,
    borderRadius: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginVertical: 7,
    fontFamily: 'Pretendard-Regular',
  },
});

export default StoreOwnerInput;
