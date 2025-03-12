import React, {useRef, useState, useEffect} from 'react';
import {View, Text, ScrollView, Pressable, StyleSheet} from 'react-native';

const WheelPicker = ({
  data,
  selectedValue,
  onValueChange,
  itemHeight = 40,
  visibleCount = 5,
  style,
}) => {
  const scrollRef = useRef(null);
  const isScrollingRef = useRef(false); // 스크롤 중인지 추적 (useRef 사용)
  const containerHeight = visibleCount * itemHeight;
  const paddingHeight = Math.floor(visibleCount / 2) * itemHeight;

  const initialIndex = data.indexOf(selectedValue);
  const validInitialIndex = initialIndex !== -1 ? initialIndex : 0;
  const [selectedIndex, setSelectedIndex] = useState(validInitialIndex);

  // 초기 선택된 값 중앙 정렬
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

  // 스크롤 이벤트 발생 시 처리
  const handleMomentumScrollEnd = e => {
    if (isScrollingRef.current) return; // 스크롤 중이면 이벤트 무시
    e.persist(); // 이벤트 풀링 방지 (이벤트 객체를 유지)

    isScrollingRef.current = true;

    setTimeout(() => {
      if (!e || !e.nativeEvent) return; // 이벤트 객체가 사라졌다면 실행 중단
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
    }, 250); // 빠른 스크롤 방지
  };

  // 특정 항목 클릭 시 선택 및 중앙 정렬
  const handleItemPress = index => {
    if (isScrollingRef.current || index === selectedIndex) return; // 스크롤 중이면 클릭 무시

    isScrollingRef.current = true; // 클릭 시 스크롤 방지

    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: index * itemHeight,
        animated: true,
      });

      setTimeout(() => {
        setSelectedIndex(index);
        onValueChange?.(data[index]);
        isScrollingRef.current = false; // 스크롤 종료 후 상태 변경
      }, 300); // 애니메이션 완료 후 선택 적용
    }
  };

  return (
    <View style={[styles.pickerContainer, {height: containerHeight}]}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight} // 아이템 단위로 스냅
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{paddingVertical: paddingHeight}}
        scrollEnabled={!isScrollingRef.current} // 스크롤 중이면 터치 방지
      >
        {data.map((item, idx) => (
          <Pressable key={idx} onPress={() => handleItemPress(idx)}>
            <View style={[styles.itemContainer, style]}>
              <Text
                style={{
                  fontSize: 18,
                  color: idx === selectedIndex ? '#000' : '#999',
                }}>
                {item}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default WheelPicker;

const styles = StyleSheet.create({
  pickerContainer: {
    position: 'relative',
    minWidth: 160, // 최소 너비를 지정하여 넓게 보이게 설정
  },
  itemContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center', // 텍스트 중앙 정렬
  },
});
