import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {ReviewStoreGet} from '../../api/reviewApi';
import ReviewItem from '../../components/StoreReviewScreen/ReviewItem';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ReviewCreate} from '../../api/reviewApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCustomAlert from '../../hooks/useCustomAlert';
import ImagePicker from 'react-native-image-crop-picker';

const StoreReviewScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId} = route.params;
  const [reviewdata, setReviewdata] = useState([]);
  const {showAlert, AlertComponent} = useCustomAlert();

  const [isWriting, setIsWriting] = useState(false); // 작성 상태

  const [newrate, setNewRate] = useState(0);
  const [newReviewContent, setNewReviewContent] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  console.log(newrate, newReviewContent, images);
  const getReviewData = async () => {
    try {
      const reviewData = await ReviewStoreGet(storeId);
      setReviewdata(reviewData);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getReviewData();
    }, [storeId]),
  );

  const renderStars = () => {
    return Array.from({length: 5}, (_, index) => {
      const starIndex = index + 1; // 별의 번호 (1부터 시작)
      return (
        <TouchableOpacity key={index} onPress={() => setNewRate(starIndex)}>
          <Ionicons
            name="star"
            size={30}
            color={starIndex <= newrate ? '#FFD700' : '#D3D3D3'} // 노란색(#FFD700) 또는 회색(#D3D3D3)
            style={styles.star}
          />
        </TouchableOpacity>
      );
    });
  };

  const onChangeText = inputText => {
    setNewReviewContent(inputText);
  };

  const selectImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        console.log(image);
        setImages(prevImages => [...prevImages, image]); // 이미지를 배열에 추가
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const handleImagePress = index => {
    setSelectedImageIndex(index); // 선택된 이미지 인덱스 설정
    showAlert({
      title: '사진 삭제',
      message: '선택한 사진을 삭제하시겠습니까?',
      onConfirm: () => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index)); // 선택된 사진 삭제
        setSelectedImageIndex(null); // 선택된 이미지 초기화
      },
      onCancel: () => {
        setSelectedImageIndex(null); // 취소 시 선택된 이미지 초기화
      },
      type: 'delete',
    });
  };

  const handleSubmitReview = async () => {
    try {
      await ReviewCreate(newReviewContent, newrate, images);
      showAlert({
        title: '등록되었습니다',
        message: '',
        onConfirm: () => navigation.navigate('StoreMainScreen', {storeId}),
      });
      setIsWriting(false);
    } catch (error) {
      showAlert({
        title: '등록에 실패하였습니다',
        message: '잠시 후 다시 시도해주세요.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.MenuaddView}>
        <Pressable
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('ReviewAddScreen', {storeId: storeId})
          }>
          <Text style={styles.addButtonText}>리뷰 작성하기</Text>
        </Pressable>
      </View>
      {reviewdata.map(item => (
        <ReviewItem key={item.reviewId} item={item} />
      ))} */}

      <View style={styles.writeContainer}>
        <Text style={styles.titleText}>리뷰 작성</Text>
        <TextInput
          style={[styles.textarea, {color: '#333'}]} // 텍스트 색상 변경
          multiline
          onChangeText={onChangeText}
          value={newReviewContent}
          placeholder="소중한 리뷰를 남겨주세요."
          placeholderTextColor="gray" // Placeholder 텍스트 색상
        />

        <Text style={styles.titleText}>별점 입력</Text>
        <View style={styles.starcontainer}>{renderStars()}</View>
        <Text style={styles.titleText}>리뷰 사진 추가 (최대 5장)</Text>
        <View style={styles.imageContainer}>
          {images.map((image, index) => (
            <Pressable
              key={index}
              onPress={() => handleImagePress(index)} // 클릭 시 showAlert 실행
              style={styles.imagePressable}>
              <Image
                source={{uri: `file://${image.path}`}}
                style={[
                  styles.selectImage,
                  index === selectedImageIndex && styles.selectedEffect, // 눌렀을 때 효과 적용
                ]}
              />
            </Pressable>
          ))}
          {images.length < 5 && (
            <Pressable onPress={selectImage}>
              <MaterialCommunityIcons
                name="image-plus"
                size={40}
                color="#333"
              />
            </Pressable>
          )}
        </View>
        <TouchableOpacity
          style={styles.savebutton}
          onPress={handleSubmitReview}>
          <Text style={styles.savetext}>작성완료</Text>
        </TouchableOpacity>
      </View>

      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
  },
  MenuaddView: {
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 18,
  },
  addButton: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'rgba(16, 190, 251, 0.7)',
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    marginBottom: 10,
    marginTop: 10,
  },
  writeContainer: {
    height: 640,
    marginBottom: 10,
    marginTop: 30,
    marginHorizontal: 18,
  },
  titleText: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 3,
  },
  textarea: {
    backgroundColor: '#E9E9E9',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 100,
    padding: 10,
  },
  starcontainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 15,
  },
  star: {
    marginHorizontal: 3, // 별 사이 간격
  },
  savebuttonview: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  savebutton: {
    alignItems: 'center',
    marginBottom: 40,
    borderRadius: 10,
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
  },
  savetext: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  selectImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  selectedEffect: {
    borderWidth: 3,
    borderColor: '#FF6B6B', // 선택된 이미지를 강조
  },
});

export default StoreReviewScreen;
