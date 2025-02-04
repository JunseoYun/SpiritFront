import React from 'react';
import UpdateStoreImage from '../UpdateBottomSheet/UpdateStoreImage';
import UpdateStoreName from '../UpdateBottomSheet/UpdateStoreName';
import UpdateStoreCategory from '../UpdateBottomSheet/UpdateStoreCategory';
import UpdateStoreDrink from '../UpdateBottomSheet/UpdateStoreDrink';
import UpdateStoreLocation from '../UpdateBottomSheet/UpdateStoreLocation';
import UpdateStoreOperatingTime from '../UpdateBottomSheet/UpdateStoreOperatingTime';
import UpdateStoreBreakingTime from '../UpdateBottomSheet/UpdateStoreBreakingTime';
import UpdateStoreClosedDays from '../UpdateBottomSheet/UpdateStoreClosedDays';
import UpdateStoreTV from '../UpdateBottomSheet/UpdateStoreTV';
import UpdateStoreGroup from '../UpdateBottomSheet/UpdateStoreGroup';
import UpdateStoreContact from '../UpdateBottomSheet/UpdateStoreContact';
import UpdateStoreDescription from '../UpdateBottomSheet/UpdateStoreDescription';

const UpdateBottomSheet = ({
  updatedKey,
  updatedValue,
  setUpdatedValue,
  setUpdatedImgValue,
  handleUpdate,
  handleBottomClose,
  navigation,
}) => {
  const renderContent = () => {
    switch (updatedKey) {
      case 'images':
        return renderImages();
      case 'name':
        return renderName();
      case 'categories':
        return renderCategories();
      case 'mainDrinkDtos':
        return renderMainDrinks();
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

  const renderMainDrinks = () => (
    <UpdateStoreDrink
      alcohols={alcohols}
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
    text: '한식주점',
    value: 'KOREAN',
  },
  {
    source: require('../../assets/category/Westernfood.png'),
    text: '양식주점',
    value: 'WESTERN',
  },
  {
    source: require('../../assets/category/Chinesefood.png'),
    text: '중화주점',
    value: 'CHINESE',
  },
  {
    source: require('../../assets/category/Emotional.png'),
    text: '감성주점',
    value: 'GAMSEONG',
  },
  {
    source: require('../../assets/category/Jokbal.png'),
    text: '족발 보쌈',
    value: 'JOGBO',
  },
  {
    source: require('../../assets/category/Steamedfood.png'),
    text: '찜 찌개',
    value: 'STEW',
  },
  {
    source: require('../../assets/category/Grilled.png'),
    text: '구이',
    value: 'GRILLED',
  },
  {
    source: require('../../assets/category/Chicken.png'),
    text: '치킨',
    value: 'CHICKEN',
  },
  {
    source: require('../../assets/category/Pancake.png'),
    text: '전 막걸리',
    value: 'JEONMAK',
  },
  {
    source: require('../../assets/category/Dried.png'),
    text: '마른안주',
    value: 'DRIED',
  },
  {
    source: require('../../assets/category/Seafood.png'),
    text: '해산물',
    value: 'SEAFOOD',
  },
  {
    source: require('../../assets/category/Room.png'),
    text: '룸',
    value: 'ROOM',
  },
  {
    source: require('../../assets/category/Group.png'),
    text: '단체 행사',
    value: 'GROUP',
  },
  {
    source: require('../../assets/category/Yajang.png'),
    text: '야장',
    value: 'OUTDOOR',
  },
  {
    source: require('../../assets/category/Pocha.png'),
    text: '포차',
    value: 'POCHA',
  },
  {
    source: require('../../assets/category/Hope.png'),
    text: '호프',
    value: 'HOF',
  },
  {
    source: require('../../assets/category/Winebar.png'),
    text: '와인바',
    value: 'WINE',
  },
  {
    source: require('../../assets/category/Cocktail.png'),
    text: '칵테일',
    value: 'COCKTAIL',
  },
  {
    source: require('../../assets/category/Pupbar.png'),
    text: '펍 바',
    value: 'PUBBAR',
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
