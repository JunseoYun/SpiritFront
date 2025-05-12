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
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>대표자</Text>
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
                      {index === 0 ? '대표자' : `공동 대표 ${index}`}
                    </Text>
                  ) : null}
                </View>
                {owners.length > 1 && (
                  <Pressable
                    onPress={() => removeOwner(index)}
                    hitSlop={10}
                    style={styles.deleteButton}>
                    {/* <Text style={styles.deleteButtonText}>삭제</Text> */}
                    <AntDesign name="minuscircleo" size={16} color="#ff4d4d" />
                  </Pressable>
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder={index === 0 ? '대표자 성명' : '공동 대표 성명'}
                placeholderTextColor="#999"
                value={owner.name}
                onChangeText={text => updateOwnerName(index, text)}
              />
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
            placeholder="성명"
            placeholderTextColor="#999"
            value={owners[0].name}
            onChangeText={text => updateOwnerName(0, text)}
          />
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
    fontWeight: '500',
    color: '#333',
    fontSize: 16,
    marginBottom: 10,
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
    borderColor: '#16BBFF',
    borderRadius: 4,
    alignItems: 'center',
  },
  selectedToggleButton: {
    backgroundColor: '#16BBFF',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#16BBFF',
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
    fontWeight: '500',
    color: '#333',
    fontSize: 16,
  },
  input: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
  },
  addButton: {
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#fff',
    paddingRight: 3,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#ff4d4d',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default StoreOwnerInput;
