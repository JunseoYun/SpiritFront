import React from 'react';
import {View, Text, Pressable, TextInput, StyleSheet} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
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
  return (
    <View style={styles.container}>
      <Text ref={owneRef} style={styles.sectionTitle}>
        대표자
      </Text>
      {hasCoRepresentative ? (
        <Text style={styles.guidetext}>
          ※ 신청자는 주 대표자 또는 공동 대표자여야 합니다.
        </Text>
      ) : (
        <Text style={styles.guidetext}>
          ※ 신청자는 해당 사업자의 대표자여야 합니다.
        </Text>
      )}
      {/* 단일/공동 대표 토글 */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => setHasCoRepresentative(false)}
          style={[
            styles.toggleButton,
            !hasCoRepresentative && styles.selectedToggleButton,
          ]}>
          <Text
            style={[
              styles.toggleButtonText,
              !hasCoRepresentative && styles.selectedToggleButtonText,
            ]}>
            단일 대표
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setHasCoRepresentative(true)}
          style={[
            styles.toggleButton,
            hasCoRepresentative && styles.selectedToggleButton,
          ]}>
          <Text
            style={[
              styles.toggleButtonText,
              hasCoRepresentative && styles.selectedToggleButtonText,
            ]}>
            공동 대표
          </Text>
        </Pressable>
      </View>

      {hasCoRepresentative ? (
        <>
          {owners.map((owner, index) => (
            <View key={index} style={styles.inputContainer}>
              <View style={styles.inputHeaderContainer}>
                <View style={styles.labelContainer}>
                  {owner.name ? (
                    <Text style={styles.inputLabel}>
                      {index === 0 ? '주 대표자' : `공동 대표`}
                    </Text>
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
              <TextInput
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
              />
              {error === 'ownerGroup' && !owner.name && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}
            </View>
          ))}
          <Pressable style={styles.addButton} onPress={addOwner}>
            <Text style={styles.addButtonText}>대표자 추가하기</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.inputContainer}>
          <View style={styles.inputHeaderContainer}>
            <View style={styles.labelContainer}>
              {owners[0].name && <Text style={styles.inputLabel}>성명</Text>}
            </View>
          </View>
          <TextInput
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
          />
          {error === 'owner' && !owners[0].name && (
            <Text style={styles.errorText}>{errorMessage}</Text>
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
    borderColor: '#45C9FF',
    borderRadius: 4,
    alignItems: 'center',
  },
  selectedToggleButton: {
    backgroundColor: '#45C9FF',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#45C9FF',
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
    backgroundColor: '#45C9FF',
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
