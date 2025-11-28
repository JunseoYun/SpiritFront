import React, {
  useCallback,
  useLayoutEffect,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-date-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  createEvent,
  deleteEventImage,
  updateEvent,
  updateEventImage,
} from '../../../api/eventApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import ImagePickermodal from '../../../hooks/ImagePickermodal';
import {
  requestCameraPermission,
  requestPhotoPermission,
} from '../../../hooks/usePhotopermis';
import ColorUtil from '../../../utils/ColorUtil';
import ImageAddButton from '../../../utils/ImageAddButton';
import BottomActionButton from '../../../utils/BottomActionButton';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../../constants/imagePickerLabels';
import FastImage from 'react-native-fast-image';
import Loading from '../../../hooks/Loading';
import CustomTextInput from '../../../utils/CustomTextInput';
import CustomText from '../../../utils/CustomText';
const EMPTY_FORM = {
  title: '',
  content: '',
  startAt: '',
  endAt: '',
};

const parseDateValue = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const toISOStringWithZone = date => {
  if (!date) return '';
  const pad = value => `${value}`.padStart(2, '0');
  const normalized = new Date(date);
  const year = normalized.getFullYear();
  const month = pad(normalized.getMonth() + 1);
  const day = pad(normalized.getDate());
  const hour = pad(normalized.getHours());
  const minute = pad(normalized.getMinutes());
  const second = pad(normalized.getSeconds());
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
};

const DATE_ORDER_ERROR_MESSAGE = '이벤트 종료 시간이 시작 시간보다 빠릅니다.';

const formatReadableDate = date => {
  if (!date) {
    return '';
  }
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatReadableDateOnly = date => {
  if (!date) {
    return '';
  }
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const validateDateOrder = (start, end) => {
  if (!start || !end) {
    return '';
  }
  const parsedStart = new Date(start);
  const parsedEnd = new Date(end);
  if (
    Number.isNaN(parsedStart.getTime()) ||
    Number.isNaN(parsedEnd.getTime())
  ) {
    return '';
  }
  if (parsedEnd <= parsedStart) {
    return DATE_ORDER_ERROR_MESSAGE;
  }
  return '';
};

const startOfDay = date => {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);
  return base;
};

const endOfDay = date => {
  const base = new Date(date);
  base.setHours(23, 59, 0, 0);
  return base;
};

const isFullDayEvent = (start, end) => {
  if (!start || !end) {
    return false;
  }
  return (
    start.toDateString() === end.toDateString() &&
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    end.getHours() === 23 &&
    end.getMinutes() === 59
  );
};

const buildFormFromEvent = event => ({
  title: event?.title || '',
  content: event?.content || '',
  startAt: event?.startAt || '',
  endAt: event?.endAt || '',
});

const StoreEventEditScreen = ({route, navigation}) => {
  const {
    storeId,
    initialEvent,
    mode = initialEvent ? 'edit' : 'create',
    onComplete,
  } = route.params || {};
  const initialStart = parseDateValue(initialEvent?.startAt);
  const initialEnd = parseDateValue(initialEvent?.endAt);

  const [isTitleFocused, setIsTitleFocused] = useState(false);
  const [isContentFocused, setIsContentFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(initialEvent || null);
  const [form, setForm] = useState(
    initialEvent ? buildFormFromEvent(initialEvent) : EMPTY_FORM,
  );
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
  const [isSameDayEvent, setIsSameDayEvent] = useState(
    isFullDayEvent(initialStart, initialEnd),
  );
  const [localImage, setLocalImage] = useState(null);
  const [serverImageUrl, setServerImageUrl] = useState(
    initialEvent?.imageUrl || initialEvent?.eventImageUrl || '',
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
  const [formErrors, setFormErrors] = useState({
    title: '',
    content: '',
    date: '',
  });

  const {AlertComponent, showAlert} = useCustomAlert();
  const isEditing = mode === 'edit';
  const previewUri = localImage?.path || serverImageUrl || '';

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <CustomText
          style={{
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
          }}>
          {initialEvent ? '이벤트 수정' : '이벤트 등록'}
        </CustomText>
      ),

      headerTitleAlign: 'center',
      gestureEnabled: false,
      headerShadowVisible: false,
    });
  }, [navigation]);

  const notifyCompletion = useCallback(() => {
    if (typeof onComplete === 'function') {
      try {
        onComplete();
      } catch (error) {
        console.log('StoreEventEditScreen onComplete error', error);
      }
    }
  }, [onComplete]);

  const resetForm = useCallback(() => {
    setSelectedEvent(null);
    setForm(EMPTY_FORM);
    setStartDate(null);
    setEndDate(null);
    setIsSameDayEvent(false);
    setLocalImage(null);
    setServerImageUrl('');
    setShouldDeleteImage(false);
    setFormErrors({
      title: '',
      content: '',
      date: '',
    });
  }, []);

  const hydrateFromEvent = useCallback(
    item => {
      if (!item) {
        resetForm();
        return;
      }
      setSelectedEvent(item);
      setForm(buildFormFromEvent(item));
      const parsedStart = parseDateValue(item?.startAt);
      const parsedEnd = parseDateValue(item?.endAt);
      setStartDate(parsedStart);
      setEndDate(parsedEnd);
      setIsSameDayEvent(isFullDayEvent(parsedStart, parsedEnd));
      setLocalImage(null);
      setServerImageUrl(item?.imageUrl || item?.eventImageUrl || '');
      setShouldDeleteImage(false);
      setFormErrors({
        title: '',
        content: '',
        date: '',
      });
    },
    [resetForm],
  );

  useEffect(() => {
    if (isEditing) {
      hydrateFromEvent(initialEvent);
    } else {
      resetForm();
    }
  }, [hydrateFromEvent, initialEvent, isEditing, resetForm]);

  const handleInputChange = (field, value) => {
    setForm(prev => {
      if (prev[field] === value) {
        return prev;
      }
      const nextForm = {...prev, [field]: value};
      if ((field === 'title' || field === 'content') && value.trim()) {
        setFormErrors(prevErrors => {
          if (!prevErrors[field]) {
            return prevErrors;
          }
          return {...prevErrors, [field]: ''};
        });
      }
      if (field === 'startAt' || field === 'endAt') {
        if (nextForm.startAt && nextForm.endAt) {
          const dateError = validateDateOrder(nextForm.startAt, nextForm.endAt);
          setFormErrors(prevErrors => {
            if (dateError) {
              if (prevErrors.date === dateError) {
                return prevErrors;
              }
              return {...prevErrors, date: dateError};
            }
            if (!prevErrors.date) {
              return prevErrors;
            }
            return {...prevErrors, date: ''};
          });
        } else {
          setFormErrors(prevErrors => {
            if (prevErrors.date !== DATE_ORDER_ERROR_MESSAGE) {
              return prevErrors;
            }
            return {...prevErrors, date: ''};
          });
        }
      }
      return nextForm;
    });
  };

  const enforceSameDayRange = dateValue => {
    if (!dateValue) {
      setStartDate(null);
      setEndDate(null);
      handleInputChange('startAt', '');
      handleInputChange('endAt', '');
      return;
    }
    const normalizedStart = startOfDay(dateValue);
    const normalizedEnd = endOfDay(dateValue);
    setStartDate(normalizedStart);
    setEndDate(normalizedEnd);
    handleInputChange('startAt', toISOStringWithZone(normalizedStart));
    handleInputChange('endAt', toISOStringWithZone(normalizedEnd));
  };

  const handleSameDayToggle = () => {
    const next = !isSameDayEvent;
    setIsSameDayEvent(next);
    if (next) {
      setIsEndPickerOpen(false);
      if (startDate) {
        enforceSameDayRange(startDate);
      } else {
        setEndDate(null);
        handleInputChange('endAt', '');
      }
    }
  };

  const ensureRequiredFields = () => {
    const errors = {
      title: '',
      content: '',
      date: '',
    };
    let hasError = false;
    if (!form.title.trim()) {
      errors.title = '이벤트 제목을 입력해주세요.';
      hasError = true;
    }
    if (!form.content.trim()) {
      errors.content = '이벤트 내용을 입력해주세요.';
      hasError = true;
    }
    if (!form.startAt.trim() || !form.endAt.trim()) {
      errors.date = '이벤트 기간을 입력해주세요.';
      hasError = true;
    }
    if (hasError) {
      setFormErrors(errors);
      return false;
    }
    const dateOrderError = validateDateOrder(form.startAt, form.endAt);
    if (dateOrderError) {
      setFormErrors({...errors, date: dateOrderError});
      return false;
    }
    setFormErrors(errors);
    return true;
  };

  const handleCreateEvent = async () => {
    if (!storeId || !ensureRequiredFields()) {
      return;
    }
    setSubmitting(true);
    try {
      await createEvent({
        storeId,
        title: form.title.trim(),
        content: form.content.trim(),
        startAt: form.startAt,
        endAt: form.endAt,
        file: localImage,
      });
      notifyCompletion();
      navigation.goBack();
      resetForm();
    } catch (error) {
      showAlert({
        title: '이벤트 등록 실패',
        message: '잠시 후 다시 시도해주세요.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent?.id || !ensureRequiredFields()) {
      return;
    }
    setSubmitting(true);
    try {
      await updateEvent(selectedEvent.id, {
        title: form.title.trim(),
        content: form.content.trim(),
        startAt: form.startAt,
        endAt: form.endAt,
      });

      if (localImage || shouldDeleteImage) {
        const imageResult = await commitImageChanges({
          silent: true,
          notify: false,
        });
        if (!imageResult) {
          setSubmitting(false);
          return;
        }
      }
      notifyCompletion();
      navigation.goBack();
    } catch (error) {
      showAlert({
        title: '이벤트 수정 실패',
        message: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const setPickedImage = image => {
    if (!image) {
      return;
    }
    setLocalImage(image);
    setShouldDeleteImage(false);
  };

  const handleCameraPick = useCallback(async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      return;
    }
    try {
      const image = await ImagePicker.openCamera({
        cropping: true,
        mediaType: 'photo',
        // 자유 크롭: width/height 미지정
        freeStyleCropEnabled: true,
        avoidEmptySpaceAroundImage: true,
        compressImageQuality: 0.95,
        // 해상도 상한(필요 시 조정)
        compressImageMaxWidth: 2160,
        compressImageMaxHeight: 2160,
        includeExif: false,
        ...IMAGE_PICKER_TEXTS,
        ...IMAGE_CROPPER_TEXTS,
        ...(Platform.OS === 'ios' && {
          width: 1600, // 원하는 와이드 사이즈
          height: 1600, // 원하는 와이드 사이즈
        }),
      });

      const picked = {
        path: image.path,
        mime: image.mime,
        filename: image.filename || image.path.split('/').pop(),
      };
      setPickedImage(picked);
    } catch (error) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.log('Camera pick error', error);
      }
    }
  }, []);

  const handleGalleryPick = async () => {
    const hasPermission = await requestPhotoPermission();
    if (!hasPermission) return;

    try {
      const img = await ImagePicker.openPicker({
        cropping: true,
        freeStyleCropEnabled: true,
        avoidEmptySpaceAroundImage: true,
        compressImageQuality: 0.95,
        compressImageMaxWidth: 2160,
        compressImageMaxHeight: 2160,
        ...IMAGE_CROPPER_TEXTS,
        cropperActiveWidgetColor: '#3CBBFF',
        cropperStatusBarLight: true,
        cropperToolbarColor: '#ffffff',
        cropperToolbarWidgetColor: '#333333',
        includeExif: false,
        ...(Platform.OS === 'ios'
          ? {
              width: 1600, // 원하는 와이드 사이즈
              height: 1600, // 원하는 와이드 사이즈
            }
          : {}),
      });

      setPickedImage(img);
    } catch (e) {
      // 취소 등 에러 무시
    }
  };

  const handleRemovePreview = () => {
    if (localImage) {
      setLocalImage(null);
      return;
    }
    if (serverImageUrl) {
      setServerImageUrl('');
      setShouldDeleteImage(true);
    }
  };

  const commitImageChanges = useCallback(
    async ({silent = false, notify = true} = {}) => {
      if (!selectedEvent?.id) {
        if (!silent) {
          showAlert({
            title: '이벤트를 먼저 선택해주세요',
            message: '이미지를 수정할 이벤트를 선택해야 합니다.',
          });
        }
        return false;
      }
      if (!localImage && !shouldDeleteImage) {
        if (!silent) {
          showAlert({
            title: '변경할 이미지가 없어요',
            message: '새로운 이미지 선택 또는 삭제 후 다시 시도해주세요.',
          });
        }
        return false;
      }
      setSubmitting(true);
      try {
        if (localImage) {
          const response = await updateEventImage(selectedEvent.id, localImage);
          const updatedUrl =
            typeof response === 'string'
              ? response
              : response?.imageUrl || response?.url || '';
          setLocalImage(null);
          if (updatedUrl) {
            setServerImageUrl(updatedUrl);
          }
          if (!silent) {
            showAlert({
              title: '이미지가 업데이트됐어요',
              message: '변경된 이미지가 곧 반영됩니다.',
              type: 'ok',
            });
          }
        } else if (shouldDeleteImage) {
          await deleteEventImage(selectedEvent.id);
          setServerImageUrl('');
          if (!silent) {
            showAlert({
              title: '이미지가 삭제됐어요',
              message: '변경 사항이 곧 반영됩니다.',
              type: 'ok',
            });
          }
        }
        setShouldDeleteImage(false);
        if (notify) {
          notifyCompletion();
        }
        return true;
      } catch (error) {
        showAlert({
          title: '이미지 처리 실패',
          message: '잠시 후 다시 시도해주세요.',
        });
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [
      localImage,
      notifyCompletion,
      selectedEvent?.id,
      shouldDeleteImage,
      showAlert,
    ],
  );

  const trimmedTitle = form.title.trim();
  const trimmedContent = form.content.trim();
  const isDateOrderInvalid = Boolean(
    form.startAt && form.endAt && validateDateOrder(form.startAt, form.endAt),
  );
  const hasBaseFields =
    Boolean(trimmedTitle) &&
    Boolean(trimmedContent) &&
    Boolean(form.startAt) &&
    Boolean(form.endAt);

  const hasFormChanged = useMemo(() => {
    if (!isEditing || !selectedEvent) {
      return true;
    }
    const initialTitle = (selectedEvent.title || '').trim();
    const initialContent = (selectedEvent.content || '').trim();
    const initialStartAt = selectedEvent.startAt || '';
    const initialEndAt = selectedEvent.endAt || '';
    const hasTextChange =
      initialTitle !== trimmedTitle || initialContent !== trimmedContent;
    const hasDateChange =
      initialStartAt !== form.startAt || initialEndAt !== form.endAt;
    const hasImageChange = Boolean(localImage) || shouldDeleteImage;
    return hasTextChange || hasDateChange || hasImageChange;
  }, [
    form.endAt,
    form.startAt,
    isEditing,
    localImage,
    selectedEvent,
    shouldDeleteImage,
    trimmedContent,
    trimmedTitle,
  ]);

  const canSubmitAction =
    (isEditing ? hasBaseFields && hasFormChanged : hasBaseFields) &&
    !isDateOrderInvalid;

  const actionLabel = useMemo(
    () => (isEditing ? '이벤트 수정하기' : '이벤트 생성하기'),
    [isEditing],
  );

  const onSubmitForm = () => {
    if (isEditing) {
      handleUpdateEvent();
    } else {
      handleCreateEvent();
    }
  };

  if (!storeId) {
    return (
      <View style={styles.centered}>
        <CustomText style={styles.centeredText}>
          매장 정보가 필요합니다.
        </CustomText>
      </View>
    );
  }

  if (isEditing && !selectedEvent) {
    return (
      <View style={styles.centered}>
        <CustomText style={styles.centeredText}>
          수정할 이벤트를 찾을 수 없습니다.
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inputGroup}>
          <CustomText style={styles.inputLabel}>이벤트 제목</CustomText>
          <CustomTextInput
            style={[
              styles.input,
              isTitleFocused && styles.focusedInput,
              form.title.length > 0 && {
                color: '#333',
              }, // 입력됐을 때 색상 변경
            ]}
            placeholder="이벤트 제목을 입력해주세요"
            placeholderTextColor={ColorUtil.placeholderText}
            value={form.title}
            onChangeText={text => handleInputChange('title', text)}
            onFocus={() => setIsTitleFocused(true)}
            onBlur={() => setIsTitleFocused(false)}
            returnKeyType="done"
          />
          {formErrors.title ? (
            <CustomText style={styles.errorText}>{formErrors.title}</CustomText>
          ) : null}
        </View>
        <View style={styles.inputGroup}>
          <CustomText style={styles.inputLabel}>이벤트 내용</CustomText>
          <CustomTextInput
            style={[
              styles.contentInput,
              isContentFocused && styles.focusedInput,
              form.content.length > 0 && {
                color: '#333',
              }, // 입력됐을 때 색상 변경
            ]}
            placeholder="이벤트 내용을 입력해주세요"
            multiline
            textAlignVertical="top"
            value={form.content}
            placeholderTextColor={ColorUtil.placeholderText}
            onChangeText={text => handleInputChange('content', text)}
            onFocus={() => setIsContentFocused(true)}
            onBlur={() => setIsContentFocused(false)}
            returnKeyType="done"
          />
          {formErrors.content ? (
            <CustomText style={styles.errorText}>
              {formErrors.content}
            </CustomText>
          ) : null}
        </View>
        <View style={styles.rowInputs}>
          <View style={[styles.inputGroup, styles.half]}>
            <View style={styles.startLabelRow}>
              <CustomText style={[styles.inputLabel, styles.startLabelText]}>
                시작일
              </CustomText>
              <Pressable
                style={styles.sameDayToggle}
                onPress={handleSameDayToggle}>
                <View
                  style={[
                    styles.sameDayRadio,
                    isSameDayEvent && styles.sameDayRadioSelected,
                  ]}>
                  {isSameDayEvent && <View style={styles.sameDayRadioDot} />}
                </View>
                <CustomText
                  style={[
                    styles.sameDayToggleText,
                    isSameDayEvent && styles.sameDayToggleTextSelected,
                  ]}>
                  당일 이벤트
                </CustomText>
              </Pressable>
            </View>
            <Pressable
              style={[styles.input, styles.dateButton]}
              onPress={() => setIsStartPickerOpen(true)}>
              <CustomText
                style={[
                  styles.dateButtonText,
                  !startDate && styles.placeholderText,
                ]}>
                {startDate
                  ? isSameDayEvent
                    ? formatReadableDateOnly(startDate)
                    : formatReadableDate(startDate)
                  : isSameDayEvent
                  ? '날짜를 선택하세요'
                  : '시작일을 선택하세요'}
              </CustomText>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={18}
                color="#666"
              />
            </Pressable>
            <DatePicker
              modal
              locale="ko"
              mode={isSameDayEvent ? 'date' : 'datetime'}
              title="시작일 선택"
              confirmText="완료"
              cancelText="취소"
              open={isStartPickerOpen}
              date={startDate || new Date()}
              onConfirm={date => {
                if (isSameDayEvent) {
                  enforceSameDayRange(date);
                } else {
                  setStartDate(date);
                  handleInputChange('startAt', toISOStringWithZone(date));
                }
                setIsStartPickerOpen(false);
              }}
              onCancel={() => setIsStartPickerOpen(false)}
            />
          </View>
        </View>
        {!isSameDayEvent && (
          <View style={[styles.inputGroup, styles.half, styles.endDateGroup]}>
            <CustomText style={styles.inputLabel}>종료일</CustomText>
            <Pressable
              style={[styles.input, styles.dateButton]}
              onPress={() => setIsEndPickerOpen(true)}>
              <CustomText
                style={[
                  styles.dateButtonText,
                  !endDate && styles.placeholderText,
                ]}>
                {endDate ? formatReadableDate(endDate) : '종료일을 선택하세요'}
              </CustomText>
              <MaterialCommunityIcons
                name="calendar-clock-outline"
                size={18}
                color="#666"
              />
            </Pressable>
            <DatePicker
              modal
              locale="ko"
              mode="datetime"
              title="종료일 선택"
              confirmText="완료"
              cancelText="취소"
              open={isEndPickerOpen}
              date={endDate || new Date()}
              onConfirm={date => {
                setEndDate(date);
                handleInputChange('endAt', toISOStringWithZone(date));
                setIsEndPickerOpen(false);
              }}
              onCancel={() => setIsEndPickerOpen(false)}
            />
          </View>
        )}
        {formErrors.date ? (
          <CustomText style={[styles.errorText, styles.dateErrorText]}>
            {formErrors.date}
          </CustomText>
        ) : null}
        <View style={styles.previewContainer}>
          <CustomText style={styles.inputLabel}>이벤트 이미지</CustomText>
          <View style={styles.previewRow}>
            <ImageAddButton
              currentCount={previewUri ? 1 : 0}
              maxCount={1}
              onPress={() => setPickerVisible(true)}
              disabled={submitting}
            />
            {previewUri ? (
              <View style={styles.previewImageWrapper}>
                <FastImage
                  source={{uri: previewUri}}
                  style={styles.selectImage}
                  resizeMode="cover"
                />
                <Pressable
                  style={styles.previewDeleteButton}
                  onPress={handleRemovePreview}
                  hitSlop={{top: 8, right: 8, bottom: 8, left: 8}}>
                  <MaterialCommunityIcons name="close" size={16} color="#fff" />
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <ImagePickermodal
        isBottomSheetVisible={pickerVisible}
        setBottomSheetVisible={setPickerVisible}
        handleCameraPick={handleCameraPick}
        handleGalleryPick={handleGalleryPick}
      />
      <BottomActionButton
        label={actionLabel}
        onPress={onSubmitForm}
        disabled={submitting || !canSubmitAction}
        cancel
        cancelLabel="취소"
        onCancel={() => navigation.goBack()}
      />
      <AlertComponent />
      <Loading loading={submitting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 140,
    marginHorizontal: 18,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredText: {
    fontSize: 16,
    color: '#555',
  },

  inputGroup: {
    marginTop: 18,
  },
  inputLabel: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
    marginBottom: 12,
    marginTop: 15,
  },
  input: {
    height: 52,
    borderColor: ColorUtil.placeholderBorder,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingRight: 42,
  },
  contentInput: {
    minHeight: 130,
    borderColor: ColorUtil.placeholderBorder,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingRight: 42,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },
  focusedInput: {
    borderColor: '#333',
  },
  multilineInput: {
    height: 120,
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Pretendard-Medium',
  },
  dateErrorText: {
    marginHorizontal: 2,
  },
  startLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 12,
  },
  startLabelText: {
    marginTop: 0,
    marginBottom: 0,
    marginRight: 10,
  },
  sameDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sameDayRadio: {
    width: 16,
    height: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  sameDayRadioSelected: {
    borderColor: '#3CBBFF',
  },
  sameDayRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#3CBBFF',
  },
  sameDayToggleText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  sameDayToggleTextSelected: {
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },

  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#111827',
  },
  placeholderText: {
    color: ColorUtil.placeholderText,
  },
  endDateGroup: {
    flex: 1,
  },
  previewContainer: {
    marginTop: 18,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewImageWrapper: {
    position: 'relative',
  },
  selectImage: {
    width: 100,
    height: 100,
    borderRadius: 9,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#F3F3F3',
  },
  previewDeleteButton: {
    position: 'absolute',
    top: -8,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerButton: {
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePicked: {
    borderColor: '#cfe3ff',
    backgroundColor: '#EFF6FF',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholderText: {
    color: '#6b7280',
  },
});

export default StoreEventEditScreen;
