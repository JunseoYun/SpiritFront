import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const OperatingHoursToggle = ({
  isSameEveryday,
  setIsSameEveryday,

  handleBottomClose,
  setIs24,
  isBottomOpen,
}) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>영업 시간을 알려주세요</Text>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, isSameEveryday && styles.selectedToggle]}
          disabled={isBottomOpen} // true일 때 비활성화
          onPress={() => {
            setIsSameEveryday(true);

            handleBottomClose();
          }}>
          <Text
            style={
              isSameEveryday ? styles.selectedText : styles.unselectedText
            }>
            매일 같음
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            !isSameEveryday && styles.selectedToggle,
          ]}
          disabled={isBottomOpen}
          onPress={() => {
            setIsSameEveryday(false);
            handleBottomClose();
            setIs24(false);
          }}>
          <Text
            style={
              !isSameEveryday ? styles.selectedText : styles.unselectedText
            }>
            요일마다 다름
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    marginTop: 25,
    marginHorizontal: 18,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    marginHorizontal: 18,
  },
  toggleButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
    paddingHorizontal: 15,
    borderRadius: 100,
    marginRight: 7,
  },
  selectedToggle: {
    backgroundColor: '#45C9FF',
    borderColor: '#45C9FF',
  },
  selectedText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
  unselectedText: {
    color: '#aaa',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default OperatingHoursToggle;
