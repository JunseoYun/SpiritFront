import React, {useRef, useEffect} from 'react';
import {Modal, View, Text, Pressable, StyleSheet, FlatList} from 'react-native';
import WheelPicker from '../../../../hooks/WheelPicker';
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);
const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));
const minutes = ['00', '10', '20', '30', '40', '50'];

const VisitTimeModal = ({
  visible,
  selectedHour = '00', // ✅ 기본값 '00'
  selectedMinute = '00',
  onHourChange,
  onMinuteChange,
  onPressClose,
  postbutton,
}) => {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>방문 예정 시간</Text>

          <View style={styles.scrollArea}>
            <View style={styles.selectionOverlay} pointerEvents="none" />

            <WheelPicker
              data={hours}
              selectedValue={selectedHour}
              onValueChange={onHourChange}
              scrollRef={hourRef}
              visibleCount={5}
              fontSize={20}
              style={styles.hourPicker}
            />
            {/* 콜론 */}
            <View style={styles.colonContainer}>
              <Text style={styles.colonText}>:</Text>
            </View>
            <WheelPicker
              data={minutes}
              selectedValue={selectedMinute}
              onValueChange={onMinuteChange}
              scrollRef={minuteRef}
              visibleCount={5}
              fontSize={20}
              style={styles.minutePicker}
            />
          </View>

          <View style={styles.buttonArea}>
            <Pressable
              style={[styles.button, {backgroundColor: '#fff'}]}
              onPress={onPressClose}>
              <Text style={[styles.buttonText, {color: '#16BBFF'}]}>닫기</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={postbutton}>
              <Text style={styles.buttonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 20,
    color: '#000',
  },
  scrollArea: {
    width: 270,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    marginBottom: 20,
    position: 'relative',
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * CENTER_INDEX,
    height: ITEM_HEIGHT,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    zIndex: 1,
    pointerEvents: 'none',
    borderRadius: 12,
  },
  flatList: {
    flex: 1,
    zIndex: 0,
  },
  colonContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colonText: {
    fontSize: 22,
    color: '#333',
    fontWeight: '400',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#999',
  },
  selectedText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 20,
  },
  buttonArea: {
    flexDirection: 'row',
    marginHorizontal: 12,
  },
  button: {
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 7,
    marginHorizontal: 5,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16BBFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    padding: 3,
  },
  hourPicker: {
    alignItems: 'flex-end',
  },
  minutePicker: {
    alignItems: 'flex-start',
  },
});

export default VisitTimeModal;
