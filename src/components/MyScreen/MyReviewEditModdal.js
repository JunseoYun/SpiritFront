import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker';
import {
  ReviewEdit,
  ReviewEditImage,
  ReviewDeleteImage,
} from '../../api/reviewApi';
import useCustomAlert from '../../hooks/useCustomAlert';
import forbiddenWords from '../../hooks/forbiddenWords';
import ImagePicker from 'react-native-image-crop-picker'; // 이미지 선택 라이브러리
import {ScrollView} from 'react-native-gesture-handler';

const MyReviewEditModal = ({visible, onClose, reviewdata, onSave}) => {
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

  const handleCancel = () => {
    onClose();
    setReviewContent(reviewdata.content || '');
    setRate(reviewdata.rate || 0);
    setVisitedAt(new Date(reviewdata.visitedAt));
    setAddedImages([]);
    setDeletedImages([]);
    return;
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
      //정보만 변경된 경우
      if (isInfoChanged && !isImageChanged && !isdeleteimgchanged) {
        await ReviewEdit(reviewData.id, updatedReview);
        showAlert({
          title: `수정 되었습니다.`,
          onConfirm: () => {
            onSave();
            onClose();
          },
          onCancel: null,
          type: 'confirm',
        });
      }

      //이미지 추가만 된 경우
      if (!isInfoChanged && isImageChanged && !isdeleteimgchanged) {
        await ReviewEditImage(reviewData.id, imageData);
        showAlert({
          title: `수정 되었습니다.`,
          onConfirm: () => {
            onSave();
            onClose();
          },
          onCancel: null,
          type: 'confirm',
        });
      }

      //이미지 삭제만 된 경우
      if (!isInfoChanged && !isImageChanged && isdeleteimgchanged) {
        await ReviewDeleteImage(reviewData.id, deletedImages);
        showAlert({
          title: `수정 되었습니다.`,
          onConfirm: () => {
            onSave();
            onClose();
          },
          onCancel: null,
          type: 'confirm',
        });
      }
      //정보변경, 이미지추가
      if (isInfoChanged && isImageChanged && !isdeleteimgchanged) {
        await ReviewEdit(reviewData.id, updatedReview);
        await ReviewEditImage(reviewData.id, imageData);
        showAlert({
          title: `수정 되었습니다.`,
          onConfirm: () => {
            onSave();
            onClose();
          },
          onCancel: null,
          type: 'confirm',
        });
      }
      //정보변경 이미지 삭제
      if (isInfoChanged && !isImageChanged && isdeleteimgchanged) {
        await ReviewEdit(reviewData.id, updatedReview);
        await ReviewDeleteImage(reviewData.id, deletedImages);
        showAlert({
          title: `수정 되었습니다.`,
          onConfirm: () => {
            onSave();
            onClose();
          },
          onCancel: null,
          type: 'confirm',
        });
      }

      //이미지 추가 및 삭제
      if (!isInfoChanged && isImageChanged && isdeleteimgchanged) {
        await ReviewEditImage(reviewData.id, imageData);
        await ReviewDeleteImage(reviewData.id, deletedImages);
        showAlert({
          title: `수정 되었습니다.`,
          onConfirm: () => {
            onSave();
            onClose();
          },
          onCancel: null,
          type: 'confirm',
        });
      }
      //다 한경우
      if (isInfoChanged && isImageChanged && isdeleteimgchanged) {
        await ReviewEdit(reviewData.id, updatedReview);
        await ReviewEditImage(reviewData.id, imageData);
        await ReviewDeleteImage(reviewData.id, deletedImages);
        showAlert({
          title: `수정 되었습니다.`,
          onConfirm: () => {
            onSave();
            onClose();
          },
          onCancel: null,
          type: 'confirm',
        });
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
    }
  };

  const selectImage = () => {
    // 서버에 있는 이미지와 추가된 이미지를 합쳐서 5개 이하로 제한
    if (addedImages.length + serverImages.length < 5) {
      ImagePicker.openPicker({
        width: 500,
        height: 500,
        mediaType: 'photo',
        cropping: true,
      })
        .then(images => {
          setAddedImages([...addedImages, images]); // 기존 이미지 배열에 새 이미지를 추가
        })
        .catch(error => {});
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
        showAlert({
          title: '삭제 되었습니다',
        });
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
          showAlert({
            title: '삭제 되었습니다',
          });
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

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* 상단 버튼 (취소 & 저장) */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="arrow-back-outline" size={25} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>리뷰 수정</Text>
            <TouchableOpacity onPress={handleSave}>
              <Ionicons name="paper-plane-sharp" size={25} color="#16BBFF" />
            </TouchableOpacity>
          </View>

          {/* 서버에서 받은 이미지들 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{marginVertical: 15}}>
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
                onPress={selectImage}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                }}>
                <MaterialCommunityIcons
                  name="image-plus"
                  size={40}
                  color="#333"
                />
              </Pressable>
            )}
          </ScrollView>

          {/* 리뷰 내용 입력 */}
          <Text style={styles.inputText}>리뷰 내용*</Text>
          <TextInput
            style={[
              styles.input,
              {borderBottomColor: isFocused ? '#16BBFF' : '#F2F2F2'},
            ]}
            value={reviewContent}
            onChangeText={setReviewContent}
            placeholder={'리뷰를 입력하세요*'}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            multiline
          />

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
            onConfirm={date => {
              setVisitedAt(date);
              setIsDatePickerOpen(false);
            }}
            onCancel={() => setIsDatePickerOpen(false)}
          />
        </View>
      </View>
      <AlertComponent />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '85%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    alignItems: 'flex-start',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 15,
  },
  selectImage: {
    width: 120,
    height: 120,
    margin: 5,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imagePressable: {
    margin: 5,
    position: 'relative',
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
    width: '100%',
    borderBottomColor: '#16BBFF',
    borderBottomWidth: 1,
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
    marginBottom: 20,
  },
  inputText: {
    marginVertical: 5,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginTop: 10,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dateButton: {
    padding: 10,
    backgroundColor: '#E7E7E7',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
});

export default MyReviewEditModal;
