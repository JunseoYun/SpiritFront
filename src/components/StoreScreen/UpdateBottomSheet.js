import React, {useCallback, useRef} from 'react';
import UpdateStoreImage from '../UpdateBottomSheet/UpdateStoreImage';
import UpdateStoreName from '../UpdateBottomSheet/UpdateStoreName';
import UpdateStoreCategory from '../UpdateBottomSheet/UpdateStoreCategory';
import UpdateStoreLocation from '../UpdateBottomSheet/UpdateStoreLocation';
import UpdateStoreOperatingTime from '../UpdateBottomSheet/UpdateStoreOperatingTime';
import UpdateStoreBreakingTime from '../UpdateBottomSheet/UpdateStoreBreakingTime';
import UpdateStoreClosedDays from '../UpdateBottomSheet/UpdateStoreClosedDays';
import UpdateStoreTV from '../UpdateBottomSheet/UpdateStoreTV';
import UpdateStoreGroup from '../UpdateBottomSheet/UpdateStoreGroup';
import UpdateStoreContact from '../UpdateBottomSheet/UpdateStoreContact';
import UpdateStoreDescription from '../UpdateBottomSheet/UpdateStoreDescription';
import {useFocusEffect} from '@react-navigation/native';
import {BackHandler, ToastAndroid} from 'react-native';
import {useToast} from '../../context/ToastContext';
const UpdateBottomSheet = ({
  updatedKey,
  updatedValue,
  setUpdatedValue,
  setUpdatedImgValue,
  handleUpdate,
  handleBottomClose,
  navigation,
  endUpdate,
  bottomSheetIndex,
  isUpdate,
}) => {
  const renderContent = () => {
    switch (updatedKey) {
      case 'images':
        return renderImages();
      case 'name':
        return renderName();
      case 'categories':
        return renderCategories();
      case 'locationDto':
        return renderLocation();
      case 'operatingTime':
        return renderOperatingTime();
      case 'breakingTime':
        return renderBreakingTime();
      case 'closedDays':
        return renderClosedDays();
      case 'hasScreen':
        return renderHasScreen();
      case 'isGroupAvailable':
        return renderGroupAvailability();
      case 'contact':
        return renderContact();
      case 'description':
        return renderDescription();
      default:
        return null;
    }
  };

  const {showToast} = useToast();

  const lastBackPressed = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (!isUpdate) return;

      if (Platform.OS === 'android') {
        const onBackPress = () => {
          const now = Date.now();
          const isBottomSheetOpen = bottomSheetIndex >= 0;
          console.log(isBottomSheetOpen);
          // ✅ 바텀시트 열려있을 때 → 무조건 닫기
          if (isBottomSheetOpen) {
            handleBottomClose();
            return true;
          }

          // ✅ 바텀시트 닫혀있을 때 → 기존 endUpdate 로직
          if (now - lastBackPressed.current < 2000) {
            endUpdate();
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

        return () => backHandler.remove();
      } else {
        const unsubscribe = navigation.addListener('beforeRemove', e => {
          const now = Date.now();
          const isBottomSheetOpen = bottomSheetIndex >= 0;

          // ✅ 바텀시트 열려있을 때 → 무조건 닫기
          if (isBottomSheetOpen) {
            e.preventDefault();
            handleBottomClose();
            return;
          }

          // ✅ 바텀시트 닫혀있을 때 → 기존 endUpdate 로직
          if (now - lastBackPressed.current < 2000) {
            e.preventDefault();
            endUpdate();
            navigation.dispatch(e.data.action);
          } else {
            e.preventDefault();
            lastBackPressed.current = now;
            showToast('한 번 더 누르면 작성한 내용이 사라집니다.', 'center');
          }
        });

        return unsubscribe;
      }
    }, [
      navigation,
      endUpdate,
      updatedKey,
      handleBottomClose,
      bottomSheetIndex,
      isUpdate,
    ]),
  );

  const renderImages = () => (
    <UpdateStoreImage
      images={updatedValue}
      setUpdatedImgValue={setUpdatedImgValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  const renderName = () => (
    <UpdateStoreName
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  const renderCategories = () => (
    <UpdateStoreCategory
      innerCategories={innerCategories}
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  const renderLocation = () => (
    <UpdateStoreLocation
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
      navigation={navigation}
    />
  );

  const renderOperatingTime = () => (
    <UpdateStoreOperatingTime
      hours={hours}
      minutes={minutes}
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  const renderBreakingTime = () => (
    <UpdateStoreBreakingTime
      hours={hours}
      minutes={minutes}
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  const renderClosedDays = () => (
    <UpdateStoreClosedDays
      days={days}
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  const renderHasScreen = () => (
    <UpdateStoreTV
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  const renderGroupAvailability = () => (
    <UpdateStoreGroup
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  const renderContact = () => (
    <UpdateStoreContact
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  const renderDescription = () => (
    <UpdateStoreDescription
      updatedValue={updatedValue}
      setUpdatedValue={setUpdatedValue}
      onCancel={handleBottomClose}
      onSave={handleUpdate}
    />
  );

  return <>{renderContent()}</>;
};

const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));

const minutes = ['00', '15', '30', '45'];

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

const alcohols = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '진', value: 'GIN'},
  {label: '럼', value: 'RUM'},
  {label: '데킬라', value: 'TEQUILA'},
];

const days = [
  {label: '월', value: 'MONDAY'},
  {label: '화', value: 'TUESDAY'},
  {label: '수', value: 'WEDNESDAY'},
  {label: '목', value: 'THURSDAY'},
  {label: '금', value: 'FRIDAY'},
  {label: '토', value: 'SATURDAY'},
  {label: '일', value: 'SUNDAY'},
  {label: '없음', value: null},
];

export default UpdateBottomSheet;
