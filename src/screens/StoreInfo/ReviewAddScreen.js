import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute} from '@react-navigation/native';
import useAlert from '../../hooks/useAlert';
import {ReviewCreate} from '../../api/reviewApi';

const ReviewAddScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId} = route.params;

  console.log('스토어' + storeId);

  const [rate, setRate] = useState(0); // 현재 별점 상태 (0 ~ 5)
  const [reviewContent, setReviewContent] = useState(null);
  const [images, setImages] = useState([]); // 여러 이미지를 저장
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // 선택된 이미지 인덱스

  const {showAlert} = useAlert();

  const renderStars = () => {
    return Array.from({length: 5}, (_, index) => {
      const starIndex = index + 1; // 별의 번호 (1부터 시작)
      return (
        <TouchableOpacity key={index} onPress={() => setRate(starIndex)}>
          <Ionicons
            name="star"
            size={30}
            color={starIndex <= rate ? '#FFD700' : '#D3D3D3'} // 노란색(#FFD700) 또는 회색(#D3D3D3)
            style={styles.star}
          />
        </TouchableOpacity>
      );
    });
  };

  const onChangeText = inputText => {
    setReviewContent(inputText);
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
    showAlert(
      '사진 삭제',
      '선택한 사진을 삭제하시겠습니까?',
      () => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index)); // 선택된 사진 삭제
        setSelectedImageIndex(null); // 선택된 이미지 초기화
      },
      () => {
        setSelectedImageIndex(null); // 취소 시 선택된 이미지 초기화
      },
    );
  };

  const savereview = async () => {
    try {
      await ReviewCreate(reviewContent, rate, storeId);
      Alert.alert(
        '등록 되었습니다',
        '',
        [
          {
            text: '확인',
            style: 'destructive',
            onPress: () => navigation.navigate('StoreMainPage', {storeId}),
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      Alert.alert(
        '등록에 실패하였습니다.',
        '',
        [
          {
            text: '확인',
            style: 'destructive',
          },
        ],
        {cancelable: false},
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Text style={styles.text}>리뷰 작성</Text>
      <TextInput
        style={styles.textarea}
        multiline
        onChangeText={onChangeText}
        value={reviewContent}
      />
      <Text style={styles.text}>별점 입력</Text>
      <View style={styles.starcontainer}>{renderStars()}</View>
      <Text style={styles.text}>리뷰 사진 추가 (최대 5장)</Text>
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
            <MaterialCommunityIcons name="image-plus" size={40} color="#333" />
          </Pressable>
        )}
      </View>
      <View style={styles.savebuttonview}>
        <TouchableOpacity style={styles.savebutton} onPress={savereview}>
          <Text style={styles.savetext}>작성완료</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingHorizontal: 40,
    paddingTop: 30,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    marginBottom: 10,
    marginTop: 10,
  },
  textarea: {
    backgroundColor: 'lightgray',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
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

export default ReviewAddScreen;
