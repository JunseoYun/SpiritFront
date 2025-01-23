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
    source: require('../../assets/free-icon-barbecue-4039250.png'),
    text: '이자카야',
    value: 'IZAKAYA',
  },
  {
    source: require('../../assets/free-icon-soju-5789309.png'),
    text: '한식주점',
    value: 'KOREAN',
  },
  {
    source: require('../../assets/free-icon-pizza-3595458.png'),
    text: '양식주점',
    value: 'WESTERN',
  },
  {
    source: require('../../assets/free-icon-dumplings-6560368.png'),
    text: '중화주점',
    value: 'CHINESE',
  },
  {
    source: require('../../assets/bar-counter_3822705.png'),
    text: '감성주점',
    value: 'GAMSEONG',
  },
  {
    source: require('../../assets/free-icon-jokbal-8740559.png'),
    text: '족발 보쌈',
    value: 'JOGBO',
  },
  {
    source: require('../../assets/free-icon-soup-12404665.png'),
    text: '찜 찌개',
    value: 'STEW',
  },
  {
    source: require('../../assets/free-icon-barbecue-4039250.png'),
    text: '구이 탕',
    value: 'GRILLED',
  },
  {
    source: require('../../assets/free-icon-roast-chicken-2137000.png'),
    text: '치킨',
    value: 'CHICKEN',
  },
  {
    source: require('../../assets/mayonnaise_3376991.png'),
    text: '전 막걸리',
    value: 'JEONMAK',
  },
  {
    source: require('../../assets/free-icon-squid-12752294.png'),
    text: '마른안주',
    value: 'DRIED',
  },
  {
    source: require('../../assets/free-icon-steamed-fish-2885062.png'),
    text: '해산물',
    value: 'SEAFOOD',
  },
  {
    source: require('../../assets/free-icon-folder-3370758.png'),
    text: '룸',
    value: 'ROOM',
  },
  {
    source: require('../../assets/free-icon-disco-ball-3935116.png'),
    text: '단체 행사',
    value: 'GROUP',
  },
  {
    source: require('../../assets/beers_2302167.png'),
    text: '야장',
    value: 'OUTDOOR',
  },
  {
    source: require('../../assets/free-icon-stall-food-6734735.png'),
    text: '포차',
    value: 'POCHA',
  },
  {
    source: require('../../assets/free-icon-beer-1887156.png'),
    text: '호프',
    value: 'HOF',
  },
  {
    source: require('../../assets/free-icon-wine-6454589.png'),
    text: '와인바',
    value: 'WINE',
  },
  {
    source: require('../../assets/free-icon-cocktail-3086535.png'),
    text: '칵테일',
    value: 'COCKTAIL',
  },
  {
    source: require('../../assets/free-icon-bar-counter-4507564.png'),
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
