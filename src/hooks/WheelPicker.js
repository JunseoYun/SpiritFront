import React, {useRef, useState, useEffect} from 'react';
import {View, Text, ScrollView, Pressable, StyleSheet} from 'react-native';

const WheelPicker = ({
  data,
  selectedValue,
  onValueChange,
  itemHeight = 40,
  visibleCount = 5,
  style,
  type,
  selectedHour,
}) => {
  const scrollRef = useRef(null);
  const isScrollingRef = useRef(false);
  const containerHeight = visibleCount * itemHeight;
  const paddingHeight = Math.floor(visibleCount / 2) * itemHeight;

  const initialIndex = data.indexOf(selectedValue);
  const validInitialIndex = initialIndex !== -1 ? initialIndex : 0;
  const [selectedIndex, setSelectedIndex] = useState(validInitialIndex);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: validInitialIndex * itemHeight,
          animated: false,
        });
      }, 100);
    }
  }, [validInitialIndex, itemHeight]);

  const handleMomentumScrollEnd = e => {
    if (isScrollingRef.current) return;
    e.persist();

    isScrollingRef.current = true;

    setTimeout(() => {
      if (!e || !e.nativeEvent) return;
      const offsetY = e.nativeEvent.contentOffset?.y || 0;
      const index = Math.round(offsetY / itemHeight);

      if (index !== selectedIndex && index >= 0 && index < data.length) {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            y: index * itemHeight,
            animated: true,
          });
        }

        setTimeout(() => {
          setSelectedIndex(index);
          onValueChange?.(data[index]);
          isScrollingRef.current = false;
        }, 100);
      } else {
        isScrollingRef.current = false;
      }
    }, 250);
  };

  const handleItemPress = index => {
    if (isScrollingRef.current || index === selectedIndex) return;

    isScrollingRef.current = true;

    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: index * itemHeight,
        animated: true,
      });

      setTimeout(() => {
        setSelectedIndex(index);
        onValueChange?.(data[index]);
        isScrollingRef.current = false;
      }, 300);
    }
  };

  useEffect(() => {
    if (type === 'minute' && selectedHour === '33') {
      onValueChange('00');
    }
  }, [selectedHour]);

  return (
    <View style={[styles.pickerContainer, {height: containerHeight}]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{paddingVertical: paddingHeight}}
        nestedScrollEnabled={true} // ✅ 부모 ScrollView와 함께 동작하도록 설정
      >
        {type === 'minute' && selectedHour === '33' ? (
          <Pressable onPress={() => onValueChange?.('00')}>
            <View style={[styles.itemContainer, style]}>
              <Text
                style={{
                  fontSize: 18,
                  color: '#000',
                  textAlign: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 5,
                }}>
                00
              </Text>
            </View>
          </Pressable>
        ) : (
          data.map((item, idx) => (
            <Pressable key={idx} onPress={() => handleItemPress(idx)}>
              <View style={[styles.itemContainer, style]}>
                <Text
                  style={{
                    fontSize: 18,
                    color: idx === selectedIndex ? '#000' : '#999',
                    textAlign: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 5,
                  }}>
                  {type === 'hour' && item >= 24 ? (
                    idx === selectedIndex ? (
                      <>
                        <Text style={styles.nextText}>{'다음날  '}</Text>
                        {(item - 24).toString().padStart(2, '0')}
                      </>
                    ) : (
                      (item - 24).toString().padStart(2, '0')
                    )
                  ) : (
                    item.toString().padStart(2, '0')
                  )}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default WheelPicker;

const styles = StyleSheet.create({
  pickerContainer: {
    position: 'relative',
    minWidth: 160,
  },
  itemContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    textAlign: 'center',
    alignSelf: 'center',
    color: '#181ㅁ1ㅁ',
  },
});
