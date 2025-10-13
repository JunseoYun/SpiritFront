import React, {useEffect, useMemo, useRef} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StoreOrderRequest = ({
  noteSectionOffset,
  setNoteSectionOffset,
  requestNote,
  setRequestNote,
  pendingNoteScrollRef,
  scrollViewRef,
}) => {
  return (
    <View
      key="note-section"
      style={styles.noteSection}
      onLayout={({nativeEvent}) => setNoteSectionOffset(nativeEvent.layout.y)}>
      <Text style={styles.sectionTitle}>요청 사항</Text>
      <TextInput
        style={styles.noteInput}
        value={requestNote}
        onChangeText={setRequestNote}
        placeholder="예: 여러 메뉴는 한 번에 내어주시고, 주류는 제가 도착해서 받을게요!"
        placeholderTextColor="#B0B0B0"
        multiline
        maxLength={200}
        textAlignVertical="top"
        onFocus={() => {
          pendingNoteScrollRef.current = true;
          requestAnimationFrame(() => {
            scrollViewRef.current?.scrollTo({
              y: Math.max(0, noteSectionOffset - 20),
              animated: true,
            });
          });
        }}
        onBlur={() => {
          pendingNoteScrollRef.current = false;
        }}
      />
      <Text style={styles.noteCount}>{requestNote?.length}/200</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2933',
    marginBottom: 10,
    marginLeft: 3,
  },
  noteSection: {
    marginBottom: 20,
    marginHorizontal: 18,
  },
  noteInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#222',
  },
  noteCount: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#999',
    textAlign: 'right',
    marginRight: 3,
  },
});

export default StoreOrderRequest;
