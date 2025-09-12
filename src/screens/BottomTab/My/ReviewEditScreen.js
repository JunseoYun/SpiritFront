import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import {
  ReviewEdit,
  ReviewEditImage,
  ReviewDeleteImage,
} from '../../../api/reviewApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import forbiddenWords from '../../../hooks/forbiddenWords';
import ImagePicker from 'react-native-image-crop-picker'; // 이미지 선택 라이브러리
import {requestPhotoPermission} from '../../../hooks/usePhotopermis';
import Loading from '../../../hooks/Loading';

const ReviewEditScreen = ({route, navigation}) => {
  // 👉 `params`에서 `reviewdata` 가져오기
  const {reviewdata} = route.params || {}; // `params`가 없을 경우 대비하여 기본값 처리

  const [reviewData, setReviewData] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [rate, setRate] = useState(0);
  const [visitedAt, setVisitedAt] = useState(new Date());
  const [serverImages, setServerImages] = useState([]); // 서버에서 받은 이미지들
  const [addedImages, setAddedImages] = useState([]); // 사용자가 추가한 이미지들
  const [isFocused, setIsFocused] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();
  const [deletedImages, setDeletedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (reviewdata) {
      setReviewData(reviewdata);
      setReviewContent(reviewdata.content || '');
      setRate(reviewdata.rate || 0);
      setVisitedAt(new Date(reviewdata.visitedAt));
      setServerImages(reviewdata.imgUrlList || []); // 서버에서 받은 이미지 설정
    }
  }, [reviewdata]);

  const renderStars = () => {
    return Array.from({length: 5}, (_, index) => (
      <TouchableOpacity key={index} onPress={() => setRate(index + 1)}>
        <FontAwesomeIcon
          name={index < rate ? 'star' : 'star-o'}
          size={30}
          color={index < rate ? '#FFD700' : '#C0C0C0'}
        />
      </TouchableOpacity>
    ));
  };
  const onSave = () => {
    if (route.params?.onRefresh) {
      route.params.onRefresh(); // MyReview 화면을 갱신하도록 호출
    }
    navigation.goBack();
  };

  const handleSave = async () => {
    let isImageChanged = addedImages.length > 0;
    let isdeleteimgchanged = deletedImages.length > 0;
    let isInfoChanged =
      reviewContent !== reviewData.content ||
      rate !== reviewData.rate ||
      new Date(visitedAt).getTime() !==
        new Date(reviewData.visitedAt).getTime();

    const containsForbiddenWord = forbiddenWords.some(word =>
      reviewContent.includes(word),
    );

    if (containsForbiddenWord) {
      showAlert({
        title: '가이드 위반',
        message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
      });
      return;
    }
    if (reviewContent == null || rate == null || visitedAt === null) {
      showAlert({
        title: '입력 누락',
        message: '모든 정보를 입력해 주세요.',
      });
      return;
    }

    const updatedReview = {
      content: reviewContent,
      rate: rate,
      visitedAt: visitedAt,
    };

    const imageData = {
      files: addedImages,
    };

    try {
      setLoading(true);
      //정보만 변경된 경우
      if (isInfoChanged && !isImageChanged && !isdeleteimgchanged) {
        await ReviewEdit(reviewData.id, updatedReview);

        onSave();
      }

      //이미지 추가만 된 경우
      if (!isInfoChanged && isImageChanged && !isdeleteimgchanged) {
        await ReviewEditImage(reviewData.id, imageData);

        onSave();
      }

      //이미지 삭제만 된 경우
      if (!isInfoChanged && !isImageChanged && isdeleteimgchanged) {
        await ReviewDeleteImage(reviewData.id, deletedImages);

        onSave();
      }
      //정보변경, 이미지추가
      if (isInfoChanged && isImageChanged && !isdeleteimgchanged) {
        await ReviewEdit(reviewData.id, updatedReview);
        await ReviewEditImage(reviewData.id, imageData);

        onSave();
      }
      //정보변경 이미지 삭제
      if (isInfoChanged && !isImageChanged && isdeleteimgchanged) {
        await ReviewEdit(reviewData.id, updatedReview);
        await ReviewDeleteImage(reviewData.id, deletedImages);

        onSave();
      }

      //이미지 추가 및 삭제
      if (!isInfoChanged && isImageChanged && isdeleteimgchanged) {
        await ReviewEditImage(reviewData.id, imageData);
        await ReviewDeleteImage(reviewData.id, deletedImages);

        onSave();
      }
      //다 한경우
      if (isInfoChanged && isImageChanged && isdeleteimgchanged) {
        await ReviewEdit(reviewData.id, updatedReview);
        await ReviewEditImage(reviewData.id, imageData);
        await ReviewDeleteImage(reviewData.id, deletedImages);

        onSave();
      }
      // 다 안한경우
      if (!isInfoChanged && !isImageChanged && !isdeleteimgchanged) {
        onClose();
        setDeletedImages([]);
        setAddedImages([]);
        return;
      }
      setAddedImages([]);
      setDeletedImages([]);
    } catch (error) {
      showAlert({
        title: '수정 실패',
        message: '잘못된 요청입니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectImage = async () => {
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) return;
    // 서버에 있는 이미지와 추가된 이미지를 합쳐서 5개 이하로 제한
    if (addedImages.length + serverImages.length < 5) {
      const remaining = 5 - (addedImages.length + serverImages.length);
      try {
        const pickedImages = await ImagePicker.openPicker({
          mediaType: 'photo',
          multiple: remaining > 1, // ✅ 2개 이상일 때만 multiple
          maxFiles: remaining > 1 ? remaining : 1, // multiple true일 때만 maxFiles 적용
          compressImageQuality: 0.95,
          compressImageMaxWidth: 2160,
          compressImageMaxHeight: 2160,
          cropping: false,
        });

        const newImages = Array.isArray(pickedImages)
          ? pickedImages
          : [pickedImages];
        setAddedImages(prev => [...prev, ...newImages]);
      } catch (error) {
        console.log('ImagePicker Error: ', error);
      }
    } else {
      showAlert({
        title: '이미지 추가 제한',
        message: '이미지는 최대 5개까지 추가할 수 있습니다.',
      });
    }
  };

  // 추가된 이미지를 삭제하는 함수
  const removeAddedImage = index => {
    showAlert({
      title: `이미지를 삭제하시겠습니까?`,
      onConfirm: async () => {
        setAddedImages(prevImages => prevImages.filter((_, i) => i !== index));
        // showAlert({
        //   title: '삭제 되었습니다',
        // });
      },
      onCancel: null,
      type: 'delete',
    });
  };

  // 서버에서 받아온 이미지를 삭제하는 함수
  const removeServerImage = async index => {
    showAlert({
      title: `이미지를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          const imageToRemove = serverImages[index]; // 삭제할 이미지

          setDeletedImages(prevDeleted => [...prevDeleted, imageToRemove]);

          setServerImages(prevImages =>
            prevImages.filter((_, i) => i !== index),
          );
          // showAlert({
          //   title: '삭제 되었습니다',
          // });
        } catch (error) {
          showAlert({
            title: '이미지 삭제 실패',
          });
        }
      },
      onCancel: null,
      type: 'delete',
    });
  };
  const [overText, setOverText] = useState(false);

  const handleContentChange = text => {
    const maxLines = 5; // 최대 줄 개수
    const maxChars = 300; // 최대 글자 수

    // 🔥 줄 개수 확인 (빈 줄 제외)
    const lines = text.split('\n'); // 🔥 입력된 줄 개수 확인
    if (lines.length > maxLines || text.length > maxChars) {
      setOverText(true);
      return;
    }

    setOverText(false);
    setReviewContent(text);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.inputText}>리뷰 내용</Text>
          <TextInput
            style={[
              styles.input,
              {borderBottomColor: isFocused ? '#16BBFF' : '#F2F2F2'},
            ]}
            value={reviewContent}
            onChangeText={handleContentChange}
            placeholder={'리뷰를 입력하세요'}
            placeholderTextColor={'#999'}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline
            maxLength={300}
          />
          {overText && (
            <Text style={styles.errorMessage}>
              리뷰는 최대 5줄, 최대 300자까지 입력 가능합니다.
            </Text>
          )}

          {/* 별점 입력 */}
          <Text style={styles.inputText}>별점 입력</Text>
          <View style={styles.starContainer}>{renderStars()}</View>

          {/* 방문 날짜 */}
          <Text style={styles.inputText}>방문 날짜</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setIsDatePickerOpen(true)}>
            <Text style={styles.dateButtonText}>
              {visitedAt.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          <DatePicker
            modal
            open={isDatePickerOpen}
            date={visitedAt}
            mode="date"
            locale="ko"
            maximumDate={new Date(new Date().setHours(23, 59, 59, 999))} // 한국 시간 기준 오늘까지 선택 가능
            onConfirm={date => {
              setVisitedAt(date);
              setIsDatePickerOpen(false);
            }}
            onCancel={() => setIsDatePickerOpen(false)}
          />
          <Text style={styles.inputText}>리뷰 이미지</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginHorizontal: 18}}>
            {serverImages.map((image, index) => (
              <Pressable key={index} style={styles.imagePressable}>
                <Image
                  source={{uri: image.uri ? image.uri : image}} // 선택한 이미지가 URL로 전달될 때
                  style={[
                    styles.selectImage,
                    {borderColor: '#E7E7E7', borderWidth: 2},
                  ]}
                />
                <TouchableOpacity
                  onPress={() => removeServerImage(index)}
                  style={[styles.removeButton, styles.shadowEffect]}>
                  <Ionicons name="trash-outline" size={30} color="#fff" />
                </TouchableOpacity>
              </Pressable>
            ))}
            {addedImages.map((image, index) => (
              <Pressable key={index} style={styles.imagePressable}>
                <Image
                  source={{uri: image.path}} // 추가한 이미지의 URI
                  style={[
                    styles.selectImage,
                    {borderColor: '#E7E7E7', borderWidth: 2},
                  ]}
                />
                <TouchableOpacity
                  onPress={() => removeAddedImage(index)}
                  style={[styles.removeButton, styles.shadowEffect]}>
                  <Ionicons name="trash-outline" size={30} color="#fff" />
                </TouchableOpacity>
              </Pressable>
            ))}
            {addedImages.length + serverImages.length < 5 && (
              <Pressable
                style={{
                  width: 120,
                  height: 120,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f2f2f2',
                  borderRadius: 10,
                }}
                onPress={selectImage}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <MaterialCommunityIcons name="plus" size={30} color="#999" />
                </View>
              </Pressable>
            )}
          </ScrollView>
          <Pressable style={styles.completeButton} onPress={handleSave}>
            <Text style={styles.completeButtonText}>수정 완료</Text>
          </Pressable>
          <AlertComponent />
        </ScrollView>

        <Loading loading={loading} />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  inputText: {
    marginVertical: 5,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 30,
    marginHorizontal: 18,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 16,
    color: '#333',
  },
  selectImage: {
    width: 120,
    height: 120,
    marginRight: 7,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imagePressable: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  shadowEffect: {
    shadowColor: '#000', // 그림자 색상
    shadowOffset: {width: 0, height: 4}, // 그림자 위치 (x, y)
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    borderBottomColor: '#16BBFF',
    borderBottomWidth: 1,
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
    marginBottom: 20,
    marginHorizontal: 18,
  },

  starContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    marginHorizontal: 18,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#E7E7E7',
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 18,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  completeButton: {
    backgroundColor: '#45C9FF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 18,
    marginTop: 50,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  footerloading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Pretendard-Medium',
    alignSelf: 'flex-start',
  },
});

export default ReviewEditScreen;
