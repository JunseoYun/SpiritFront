import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {ReviewStoreGet, review_delete_reply} from '../../api/reviewApi';
import ReviewItem from '../../components/StoreReviewScreen/ReviewItem';
import {ReviewCreate} from '../../api/reviewApi';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCustomAlert from '../../hooks/useCustomAlert';
import ImagePicker from 'react-native-image-crop-picker';
import ReviewForm from '../../components/StoreReviewScreen/ReviewForm';
import forbiddenWords from '../../hooks/forbiddenWords';
import {useToast} from '../../context/ToastContext';
import {requestPhotoPermission} from '../../hooks/usePhotopermis';
import Loading from '../../hooks/Loading';
import ReviewItemSkeleton from '../../components/StoreReviewScreen/ReviewItemSkeleton';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../constants/imagePickerLabels';
const StoreReviewScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storename, isOwner} = route.params;
  const [reviewdata, setReviewdata] = useState([]);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();
  const {bottom} = useSafeAndroidInsets();

  const [isWriting, setIsWriting] = useState(false); // 작성 상태

  const [newrate, setNewRate] = useState(0);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [visitDate, setVisitDate] = useState(new Date()); // 방문 날짜 상태
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false); // 날짜 선택기 표시 상태
  const [firstloading, setFirstloading] = useState(true);
  const [page, setPage] = useState(0); // 페이지 번호
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [isEnd, setIsEnd] = useState(false); // 데이터 끝 여부
  const [totalpage, setTotalpage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [addloading, setAddloading] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);

  const getReviewData = async currentPage => {
    setLoading(true);

    try {
      const reviewData = await ReviewStoreGet(storeId, currentPage);
      setTotalpage(reviewData.totalPages);

      if (reviewData.content.length === 0) {
        setIsEnd(true); // 더 이상 데이터가 없으면
      } else {
        // 기존 데이터와 병합하고 중복 제거
        setReviewdata(prevReviews => {
          const mergedReviews = [...prevReviews, ...reviewData.content];
          const uniqueReviews = Array.from(
            new Map(mergedReviews.map(review => [review.id, review])).values(),
          );
          return uniqueReviews;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (firstloading == true) {
        setFirstloading(false);
      }
    }
  };

  const loadMoreReviews = () => {
    if (!loading && !isEnd) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        getReviewData(nextPage); // 다음 페이지 데이터를 가져옴
        return nextPage;
      });
    }
  };

  useEffect(() => {
    setReviewdata([]); // 기존 데이터 초기화
    setPage(0); // 페이지 초기화
    setIsEnd(false);
    getReviewData(0);
  }, []);

  const handleRefresh = () => {
    setReviewdata([]); // 기존 stores 초기화
    setIsEnd(true); // 추가 데이터 여부 초기화
    setPage(0);
    setRefreshing(true); // 새로고침 시작
    getReviewData(0); // 새로고침
  };

  const hadleIsWrite = () => {
    setIsWriting(true);
  };

  const hadleNoWrite = () => {
    showAlert({
      title: '작성한 내용이 저장되지 않았습니다',
      message: '리뷰 작성을 취소하시겠습니까?',
      onConfirm: () => {
        setIsWriting(false);
        setImages([]); // 이미지 초기화
        setNewRate(0); // 별점 초기화
        setNewReviewContent(''); // 리뷰 내용 초기화
        setVisitDate(new Date()); // 방문 날짜 초기화
      },
      type: 'confirm',
    });
  };

  const renderStars = onRateSelect => {
    return Array.from({length: 5}, (_, index) => {
      const starIndex = index + 1;
      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setNewRate(starIndex);
            onRateSelect?.(starIndex); // ✅ 올바른 콜백 호출
          }}>
          <FontAwesomeIcon
            name="star"
            size={30}
            color={starIndex <= newrate ? '#FFD700' : '#F0F0F0'}
            style={styles.star}
          />
        </TouchableOpacity>
      );
    });
  };

  const onChangeText = inputText => {
    setNewReviewContent(inputText);
  };

  const selectImage = async () => {
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) return;
    ImagePicker.openCamera({
      cropping: true,
      freeStyleCropEnabled: true, // 자유 크롭
      mediaType: 'photo',
      avoidEmptySpaceAroundImage: true,
      compressImageQuality: 0.95, // 품질 고정
      compressImageMaxWidth: 2160,
      compressImageMaxHeight: 2160,
      includeExif: false,
      ...IMAGE_PICKER_TEXTS,
      ...IMAGE_CROPPER_TEXTS,
      ...(Platform.OS === 'ios' && {
        width: 1600, // 원하는 와이드 사이즈
        height: 1600, // 원하는 와이드 사이즈
      }),
    })
      .then(image => {
        setImages(prevImages => [...prevImages, image]); // 이미지를 배열에 추가
      })
      .catch(error => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const handleGalleryPick = async () => {
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) {
      return;
    }
    const remaining = 5 - images.length;

    try {
      const pickedImages = await ImagePicker.openPicker({
        mediaType: 'photo',
        multiple: remaining > 1, // 2개 이상일 때만 multiple
        maxFiles: remaining > 1 ? remaining : 1,
        cropping: false, // 우선 crop 안함 (아래에서 개별 크롭)
        includeExif: false,
        ...IMAGE_PICKER_TEXTS,
      });

      const selectedImages = Array.isArray(pickedImages)
        ? pickedImages
        : [pickedImages];

      const croppedImages = [];

      // 각 이미지 자유 비율 크롭 (0.95 품질, 최대 해상도 제한)
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const cropped = await ImagePicker.openCropper({
          path: image.path,
          cropping: true,
          freeStyleCropEnabled: true,
          avoidEmptySpaceAroundImage: true,
          compressImageQuality: 0.95,
          compressImageMaxWidth: 2160,
          compressImageMaxHeight: 2160,
          ...IMAGE_CROPPER_TEXTS,
          cropperActiveWidgetColor: '#45C9FF',
          cropperStatusBarLight: true,
          cropperToolbarColor: '#ffffff',
          cropperToolbarWidgetColor: '#333333',
          includeExif: false,
          ...(Platform.OS === 'ios' && {
            width: 1600, // 원하는 와이드 사이즈
            height: 1600, // 원하는 와이드 사이즈
          }),
          // forceJpg: true,
        });
        croppedImages.push(cropped);
      }

      // 상태에 추가
      setImages(prev => [...prev, ...croppedImages]);
    } catch (error) {
      console.log('ImagePicker Error: ', error);
    }
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
    setAddloading(true);
    try {
      // 금지된 단어 확인
      const containsForbiddenWord = forbiddenWords.some(
        word =>
          newReviewContent.includes(word) || newrate.toString().includes(word),
      );

      if (containsForbiddenWord) {
        showAlert({
          title: '가이드 위반',
          message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
        });
        return;
      }

      // 리뷰 내용과 별점이 비어있는지 확인
      if (!newReviewContent.trim()) {
        showToast('리뷰 내용을 적어주세요.');
        return;
      }

      if (newrate === 0) {
        showToast('별점을 입력해주세요.');
        return;
      }

      // 리뷰 등록 성공 처리
      const data = {
        files: images, // 이미지 배열
        createReviewDto: {
          content: newReviewContent,
          rate: newrate,
          visitedAt: new Date(visitDate.getTime() + 9 * 60 * 60 * 1000),
          storeId: storeId,
        },
      };
      await ReviewCreate(data);
      showToast('리뷰가 등록되었습니다.');
      handleRefresh();
    } catch (error) {
      console.log(error, '리뷰 등록 중 에러');
      showAlert({
        title: '등록 실패',
        message: '리뷰 등록에 실패했습니다. 다시 시도해 주세요.',
      });
    } finally {
      setAddloading(false);
      setIsWriting(false);
      setImages([]); // 이미지 초기화
      setNewRate(0); // 별점 초기화
      setNewReviewContent(''); // 리뷰 내용 초기화
      setVisitDate(new Date()); // 방문 날짜 초기화
    }
  };

  const handleDeleteReply = reviewId => {
    showAlert({
      title: '답글 삭제',
      message: '해당 답글 삭제하시겠습니까?',
      onConfirm: () => {
        deleteReply(reviewId);
      },
      type: 'delete',
    });
  };

  const deleteReply = async reviewId => {
    setLoading(true);
    try {
      await review_delete_reply(reviewId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <ReviewItem
      key={item.id}
      item={item}
      navigation={navigation}
      isOwner={isOwner}
      handleDeleteReply={handleDeleteReply}
    />
  );

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={[styles.container, , {paddingBottom: bottom}]}>
        {!isWriting ? (
          <View style={{width: '100%'}}>
            <View style={styles.MenuaddView}>
              <Pressable style={styles.addButton} onPress={hadleIsWrite}>
                <Text style={styles.addButtonText}>리뷰 작성하기</Text>
              </Pressable>
            </View>
            {firstloading || refreshing ? (
              <FlatList
                data={[1, 2, 3]} // 임의의 더미 데이터
                keyExtractor={(item, index) => index.toString()}
                renderItem={() => <ReviewItemSkeleton />}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <FlatList
                data={reviewdata}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                keyboardDismissMode="none"
                keyboardShouldPersistTaps="always"
                onEndReached={loadMoreReviews}
                onEndReachedThreshold={0.5}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                contentContainerStyle={{paddingBottom: 0}}
                ListFooterComponent={
                  <View style={styles.footer}>
                    {loading && !isEnd ? (
                      <Text style={styles.emptyText}>Loading...</Text>
                    ) : !loading && reviewdata.length === 0 ? (
                      <Text style={styles.emptyText}>등록된 리뷰가 없어요</Text>
                    ) : null}
                  </View>
                }
              />
            )}
          </View>
        ) : (
          <View visible={isWriting} style={{flex: 1}}>
            <View style={{flex: 1}}>
              <ReviewForm
                storeName={storename} // 스토어 이름 넘겨주기
                newReviewContent={newReviewContent}
                onChangeText={onChangeText}
                renderStars={renderStars}
                visitDate={visitDate}
                setVisitDate={setVisitDate}
                isDatePickerOpen={isDatePickerOpen}
                setIsDatePickerOpen={setIsDatePickerOpen}
                images={images}
                selectedImageIndex={selectedImageIndex}
                handleImagePress={handleImagePress}
                selectImage={selectImage}
                handleSubmitReview={handleSubmitReview}
                hadleNoWrite={hadleNoWrite}
                setIsWriting={setIsWriting}
                isBottomSheetVisible={isBottomSheetVisible}
                setBottomSheetVisible={setBottomSheetVisible}
                handleGalleryPick={handleGalleryPick}
                setSelectedImageIndex={setSelectedImageIndex}
              />
            </View>
          </View>
        )}
      </SafeAreaView>
      <AlertComponent />
      <Loading loading={addloading || loading} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 15,
    marginLeft: 15,
    textAlign: 'center',
    color: '#333', // ✅ 더 진한 색상 적용
  },
  MenuaddView: {
    width: '100%',
    marginTop: 10,

    paddingHorizontal: 18,
    paddingBottom: 10,

    borderBottomWidth: 0.5,
    borderColor: '#E5E5E5',
  },
  addButton: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#45C9FF',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    padding: 16,
  },
  star: {
    marginHorizontal: 3, // 별 사이 간격
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#E7E7E7',
  },
  loadMoreText: {
    color: '#1E90FF',
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 16,
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
    height: 100,
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
    fontFamily: 'Pretendard-Medium', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#c0c0c0',
  },

  modalContent: {
    flex: 1,
    width: '100%',
  },
});

export default StoreReviewScreen;
