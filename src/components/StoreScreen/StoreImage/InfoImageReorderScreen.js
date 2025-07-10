import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';
import {StoreImageUpdateSort, UpdateStore} from '../../../api/storeApi';
import Loading from '../../../hooks/Loading';

const {width} = Dimensions.get('window');
const IMAGE_WIDTH = width - 120;
const IMAGE_HEIGHT = (IMAGE_WIDTH * 3) / 4;

const InfoImageReorderScreen = ({navigation, route}) => {
  const {storeId, Source} = route.params;
  //const [imageList, setImageList] = useState(images);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // const imageUrls = imageList.map(img => img.imageUrl);
    // const originalUrls = images.map(img => img.imageUrl);
    // const isSame = JSON.stringify(imageUrls) === JSON.stringify(originalUrls);
    // if (isSame) {
    //   navigation.goBack();
    //   return;
    // }
    // try {
    //   setLoading(true);
    //   await StoreImageUpdateSort(storeId, imageUrls);
    //   await UpdateStore(storeId, {mainImgUrl: imageUrls[0]});
    //   if (onSave) {
    //     onSave(imageList); // 변경된 리스트 전달
    //   }
    //   navigation.goBack();
    // } catch (error) {
    //   console.error('이미지 순서 변경 실패:', error);
    // } finally {
    //   setLoading(false);
    // }
  };

  const lastBackPressed = useRef(0);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();

        if (now - lastBackPressed.current < 2000) {
          navigation.goBack();
          return true;
        }

        lastBackPressed.current = now;
        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true; // 기본 동작 막기
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove(); // cleanup
    }, [navigation]),
  );

  const renderItem = ({item, drag, isActive}) => {
    // const index = imageList.findIndex(i => i.imageUrl === item.imageUrl);
    // const scaleAnim = useRef(new Animated.Value(1)).current;
    // const opacityAnim = useRef(new Animated.Value(1)).current;
    // useEffect(() => {
    //   if (isActive) {
    //     Animated.parallel([
    //       Animated.spring(scaleAnim, {
    //         toValue: 1.03,
    //         useNativeDriver: true,
    //       }),
    //       Animated.timing(opacityAnim, {
    //         toValue: 0.9,
    //         duration: 200,
    //         useNativeDriver: true,
    //       }),
    //     ]).start();
    //   } else {
    //     Animated.parallel([
    //       Animated.spring(scaleAnim, {
    //         toValue: 1,
    //         useNativeDriver: true,
    //       }),
    //       Animated.timing(opacityAnim, {
    //         toValue: 1,
    //         duration: 200,
    //         useNativeDriver: true,
    //       }),
    //     ]).start();
    //   }
    // }, [isActive]);
    // return (
    //   <Animated.View
    //     style={[
    //       styles.itemWrapper,
    //       {
    //         transform: [{scale: scaleAnim}],
    //         opacity: opacityAnim,
    //       },
    //     ]}>
    //     <View style={styles.imageWrapper}>
    //       <FastImage
    //         source={{uri: item.imageUrl}}
    //         style={styles.image}
    //         resizeMode={FastImage.resizeMode.cover}
    //       />
    //       {index === 0 && (
    //         <View style={styles.representativeBadge}>
    //           <Text style={styles.representativeText}>대표</Text>
    //         </View>
    //       )}
    //     </View>
    //     <Pressable
    //       onLongPress={drag}
    //       delayLongPress={100}
    //       hitSlop={10}
    //       style={styles.dragIcon}>
    //       <Ionicons name="reorder-three-outline" size={30} color="#999" />
    //     </Pressable>
    //   </Animated.View>
    // );
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="reorder-three-outline" size={24} color="#999" />
          <Text style={styles.headerText}>
            아이콘을 꾹 눌러 원하는 순서로 바꿔보세요
          </Text>
        </View>
        <View style={styles.listWrapper}>
          {/* <DraggableFlatList
            data={imageList}
            onDragEnd={({data}) => setImageList(data)}
            keyExtractor={(item, index) => `${item.imageUrl}_${index}`}
            renderItem={renderItem}
            activationDistance={Platform.OS === 'ios' ? 10 : 20}
            scrollPercent={5}
            contentContainerStyle={{paddingBottom: 100}}
          /> */}
        </View>

        <View style={styles.fixedButtonWrapper}>
          <Pressable onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>변경 완료</Text>
          </Pressable>
        </View>
        <Loading loading={loading} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default InfoImageReorderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  headerText: {
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    fontSize: 15,
    marginLeft: 3,
  },
  listWrapper: {
    flex: 1,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 1,
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 10,
  },
  image: {
    width: IMAGE_WIDTH + 20,
    height: IMAGE_HEIGHT - 20,
    borderRadius: 12,
  },
  dragIcon: {
    marginLeft: 10,
  },
  fixedButtonWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    paddingTop: 10,
  },
  saveButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45C9FF',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
  imageWrapper: {
    position: 'relative',
  },
  representativeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#45C9FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  representativeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Pretendard-SemiBold',
  },
});
