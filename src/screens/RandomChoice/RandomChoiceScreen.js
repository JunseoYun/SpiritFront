import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Modal,
  Image,
} from 'react-native';

const {width} = Dimensions.get('window');

// innerCategories 배열로 랜덤 선택 대상 설정
const innerCategories = [
  {
    source: require('../../assets/category/Izakaya.png'),
    text: '이자카야',
    value: 'IZAKAYA',
  },
  {
    source: require('../../assets/category/Koreafood.png'),
    text: '한식',
    value: 'KOREAN',
  },
  {
    source: require('../../assets/category/Westernfood.png'),
    text: '양식',
    value: 'WESTERN',
  },
  {
    source: require('../../assets/category/Chinesefood.png'),
    text: '중식',
    value: 'CHINESE',
  },
  {
    source: require('../../assets/category/Emotional.png'),
    text: '감성주점',
    value: 'GAMSEONG',
  },
  {
    source: require('../../assets/category/Grilled.png'),
    text: '구이 찜',
    value: 'GRILLED_STEW',
  },
  {
    source: require('../../assets/category/Hope.png'),
    text: '치킨 호프',
    value: 'CHICKEN_HOF',
  },
  {
    source: require('../../assets/category/Seafood.png'),
    text: '회 해산물',
    value: 'RAW_SEAFOOD',
  },
  {
    source: require('../../assets/category/Pupbar.png'),
    text: '펍 바',
    value: 'PUB_BAR',
  },
  {
    source: require('../../assets/category/Pocha.png'),
    text: '포장마차',
    value: 'POCHA',
  },
];

const RandomChoiceScreen = ({navigation}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false); // 애니메이션 중 여부
  const animatedValue = useRef(new Animated.Value(0)).current;
  const explosionAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const previousEndValue = useRef(0);

  const pickRandomCategory = () => {
    if (isAnimating) return; // 애니메이션 중이면 실행하지 않음
    if (innerCategories && innerCategories.length > 0) {
      setIsAnimating(true); // 애니메이션 시작
      const randomIndex = Math.floor(Math.random() * innerCategories.length);
      const targetValue =
        previousEndValue.current + innerCategories.length * 2 + randomIndex;

      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: previousEndValue.current + innerCategories.length * 2, // 리스트를 여러 번 스크롤
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: targetValue, // 선택된 항목에서 멈춤
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start(() => {
        const finalIndex = Math.floor(targetValue % innerCategories.length);
        setSelectedCategory(innerCategories[finalIndex]);
        setModalVisible(true);
        previousEndValue.current = targetValue;

        // 애니메이션 종료
        setIsAnimating(false);
        // 애니메이션 실행
        explosionAnimation.setValue(0);
        Animated.timing(explosionAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
      });
    } else {
      setSelectedCategory(null);
    }
  };

  useEffect(() => {
    const listener = animatedValue.addListener(({value}) => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: (value % innerCategories.length) * width,
          animated: false,
        });
      }
    });
    return () => animatedValue.removeListener(listener);
  }, [innerCategories]);

  const explosionStyle = {
    transform: [
      {
        scale: explosionAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 5],
        }),
      },
    ],
    opacity: explosionAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 0.7, 0],
    }),
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>오늘은 어디로?</Text>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        scrollEnabled={false} // 사용자가 직접 스크롤 불가능
      >
        {[...innerCategories, ...innerCategories].map((category, index) => (
          <View key={index} style={[styles.categoryContainer, {width}]}>
            <Image source={category.source} style={styles.categoryImage} />
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.button} onPress={pickRandomCategory}>
        <Text style={styles.buttonText}>랜덤 선택</Text>
      </Pressable>

      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}>
          <Animated.View style={[styles.explosion, explosionStyle]} />
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}>
            <View>
              <Text style={styles.modalTitle}>
                오늘은 {selectedCategory?.text} !
              </Text>
              <Text style={styles.modalSubTitle}>
                해당 주점들을 찾으러 떠나 볼까요?
              </Text>
            </View>

            {selectedCategory && (
              <>
                <Image
                  source={selectedCategory?.source}
                  style={styles.modalImage}
                />
              </>
            )}
            <View style={styles.modalButtonVuew}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => {
                  setModalVisible(false);
                }}>
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </Pressable>
              <Pressable
                style={styles.modalButton}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('CategoryListTabbar', {
                    screen: selectedCategory?.value, // 선택된 카테고리를 전달
                  });
                }}>
                <Text style={styles.modalButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
  },
  scrollView: {
    flexGrow: 0,
  },
  categoryContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10BEFB',
  },
  button: {
    backgroundColor: '#10BEFB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '70%',
    height: '50%',
    padding: 10,
    paddingTop: 30,
    paddingBottom: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    color: '#333',
    alignSelf: 'center',
  },
  modalSubTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 30,
    color: '#333',
    alignSelf: 'center',
  },
  modalImage: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  modalCategoryText: {
    fontSize: 20,
    color: '#007bff',
    marginBottom: 20,
  },
  modalButtonVuew: {
    flexDirection: 'row',
  },
  modalCancelButton: {
    backgroundColor: '#EDEDED',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '43%',
    alignItems: 'center',
    marginRight: 7,
  },
  modalButton: {
    backgroundColor: '#10BEFB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '43%',
    alignItems: 'center',
    marginLeft: 7,
  },
  modalCancelButtonText: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  explosion: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 200, 0, 0.5)',
    borderRadius: 50,
  },
});

export default RandomChoiceScreen;
