import React, {useRef, useEffect} from 'react';
import {Modal, View, Text, Pressable, StyleSheet, FlatList} from 'react-native';

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

  const getIndex = (list, value) => Math.max(0, list.indexOf(value));

  const scrollToSelected = () => {
    const hourIndex = getIndex(hours, selectedHour);
    const minuteIndex = getIndex(minutes, selectedMinute);

    setTimeout(() => {
      if (hourRef.current) {
        hourRef.current.scrollToIndex({index: hourIndex, animated: false});
      }
      if (minuteRef.current) {
        minuteRef.current.scrollToIndex({index: minuteIndex, animated: false});
      }
    }, 100); // 모달 열릴 때 스크롤이 부드럽게 보이도록 딜레이
  };

  useEffect(() => {
    if (visible) {
      onHourChange('00');
      onMinuteChange('00');
      scrollToSelected();
    }
  }, [visible]);

  const handleScrollEnd = (event, type) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);

    if (type === 'hour') {
      onHourChange(hours[index]);
    } else {
      onMinuteChange(minutes[index]);
    }
  };

  const renderItem = (item, selected) => (
    <View style={styles.item}>
      <Text
        style={[
          styles.itemText,
          selected && styles.selectedText,
          {paddingHorizontal: 0},
        ]}>
        {item}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>방문 예정 시간</Text>

          <View style={styles.scrollArea}>
            <View style={styles.selectionOverlay} pointerEvents="none" />

            {/* 시 */}
            <FlatList
              ref={hourRef}
              data={hours}
              keyExtractor={item => item}
              style={styles.flatList}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              onMomentumScrollEnd={e => handleScrollEnd(e, 'hour')}
              contentContainerStyle={{
                paddingVertical: ITEM_HEIGHT * CENTER_INDEX,
              }}
              renderItem={({item}) => renderItem(item, item === selectedHour)}
            />

            {/* 콜론 */}
            <View style={styles.colonContainer}>
              <Text style={styles.colonText}>:</Text>
            </View>

            {/* 분 */}
            <FlatList
              ref={minuteRef}
              data={minutes}
              keyExtractor={item => item}
              style={styles.flatList}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
              onMomentumScrollEnd={e => handleScrollEnd(e, 'minute')}
              contentContainerStyle={{
                paddingVertical: ITEM_HEIGHT * CENTER_INDEX,
              }}
              renderItem={({item}) => renderItem(item, item === selectedMinute)}
            />
          </View>

          <View style={styles.buttonArea}>
            <Pressable style={styles.button} onPress={postbutton}>
              <Text style={styles.buttonText}>확인</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={onPressClose}>
              <Text style={styles.buttonText}>닫기</Text>
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
    fontWeight: '700',
    marginBottom: 20,
    color: '#000',
  },
  scrollArea: {
    width: 180,
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
    fontWeight: '600',
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
    gap: 10,
  },
  button: {
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default VisitTimeModal;
