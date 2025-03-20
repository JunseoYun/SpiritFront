import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const OperatingHoursToggle = ({
  isSameEveryday,
  setIsSameEveryday,
  setIsSameEveryTime,
  handleBottomClose,
  setIs24,
}) => {
  return (
    <View>
      <Text style={styles.sectionTitle}>영업 시간을 알려주세요</Text>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, isSameEveryday && styles.selectedToggle]}
          onPress={() => {
            setIsSameEveryday(true);
            setIsSameEveryTime(true);
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
          onPress={() => {
            setIsSameEveryday(false);
            setIsSameEveryTime(false);
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
    fontWeight: '600',
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
    backgroundColor: '#16BBFF',
    borderColor: '#16BBFF',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  unselectedText: {
    color: '#aaa',
    fontWeight: '600',
  },
});

export default OperatingHoursToggle;
