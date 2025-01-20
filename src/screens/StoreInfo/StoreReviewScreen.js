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
import DatePicker from 'react-native-date-picker'; // 날짜 선택기
import ReviewForm from '../../components/StoreReviewScreen/ReviewForm';

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
  const [visitDate, setVisitDate] = useState(new Date()); // 방문 날짜 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 날짜 선택기 표시 상태

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

  const hadleIsWrite = () => {
    setIsWriting(true);
  };

  const hadleNoWrite = () => {
    showAlert({
      title: '작성한 내용이 저장되지 않았습니다',
      message: '리뷰 작성을 취소하시겠습니까?',
      onConfirm: () => setIsWriting(false),
      type: 'confirm',
    });
  };

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
      width: 500,
      height: 500,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
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
      await ReviewCreate(newReviewContent, newrate, storeId);
      setImages([]);
      setNewRate(0);
      setNewReviewContent(null);
      setVisitDate(new Date()); // 방문 날짜 초기화
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
      {isWriting ? (
        <ReviewForm
          onChangeText={onChangeText}
          newReviewContent={newReviewContent}
          visitDate={visitDate}
          setVisitDate={setVisitDate}
          isDatePickerOpen={isDatePickerOpen}
          setIsDatePickerOpen={setIsDatePickerOpen}
          images={images}
          setImages={setImages}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          renderStars={renderStars}
          selectImage={selectImage}
          handleImagePress={handleImagePress}
          handleSubmitReview={handleSubmitReview}
          hadleNoWrite={hadleNoWrite}
        />
      ) : (
        <>
          <View style={styles.MenuaddView}>
            <Pressable style={styles.addButton} onPress={hadleIsWrite}>
              <Text style={styles.addButtonText}>리뷰 작성하기</Text>
            </Pressable>
          </View>
          {reviewdata.map(item => (
            <ReviewItem key={item.reviewId} item={item} />
          ))}
        </>
      )}

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
  star: {
    marginHorizontal: 3, // 별 사이 간격
  },
});

export default StoreReviewScreen;
