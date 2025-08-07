import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View, ScrollView} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesomeIcon);

const AnimatedStar = ({size = 18, style}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loopAnim.start();

    return () => loopAnim.stop();
  }, [opacity]);

  return (
    <AnimatedIcon
      name="star"
      size={size}
      color="#eee"
      style={[style, {opacity}]}
    />
  );
};

const MyReviewSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.reviewCard}>
        {/* 상단 제목 + 날짜 */}
        <View style={styles.rowBetween}>
          <SkeletonBox style={styles.title} />
          <SkeletonBox style={styles.date} />
        </View>

        {/* 카테고리 */}
        <View style={{flexDirection: 'row', gap: 10}}>
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
        </View>

        {/* 별점 */}
        <View style={styles.rating}>
          {Array.from({length: 5}).map((_, index) => (
            <AnimatedStar key={index} style={{marginRight: 4}} />
          ))}
        </View>

        {/* 리뷰 본문 */}
        <SkeletonBox style={styles.body} />

        {/* 이미지 리스트 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Array.from({length: 3}).map((_, index) => (
            <SkeletonBox key={index} style={styles.image} />
          ))}
        </ScrollView>

        {/* 버튼 */}
        <View style={styles.buttons}>
          <SkeletonBox style={styles.button} />
          <SkeletonBox style={styles.button} />
        </View>
      </View>
    </View>
  );
};

// SkeletonBox 컴포넌트는 별도 파일에서 import 하거나 아래처럼 작성하세요
const SkeletonBox = ({style}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loopAnim.start();

    return () => loopAnim.stop();
  }, [opacity]);

  return <Animated.View style={[styles.skeleton, style, {opacity}]} />;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 5,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1, // Android 그림자
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    width: 150,
    height: 20,
    borderRadius: 4,
  },
  date: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  category: {
    width: 80,
    height: 14,
    borderRadius: 4,
    marginTop: 8,
  },
  rating: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  body: {
    width: '100%',
    height: 60,
    borderRadius: 6,
    marginBottom: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  button: {
    width: 50,
    height: 30,
    borderRadius: 8,
    marginRight: 12,
  },
  skeleton: {
    backgroundColor: '#eee',
    borderRadius: 4,
  },
});

export default MyReviewSkeleton;
