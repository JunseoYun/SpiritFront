import {drinkTabs} from '../../components/ExploreScreen/TodayRecomm/mockRecommData';

const DAY_ORDER = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const AREA_NAMES = [
  '강남',
  '홍대',
  '성수',
  '연남',
  '이태원',
  '잠실',
  '신촌',
  '을지로',
  '건대',
  '합정',
];

const TAB_META = {
  SOJU: {label: '소주', category: '포차', basePrice: 3500},
  BEER: {label: '맥주', category: '펍', basePrice: 4200},
  MAKGEOLLI: {label: '막걸리', category: '전통주점', basePrice: 4700},
  WINE: {label: '와인', category: '와인바', basePrice: 6900},
  COCKTAIL: {label: '칵테일', category: '칵테일바', basePrice: 8200},
  SAKE: {label: '사케', category: '이자카야', basePrice: 8600},
  KAOLIANG: {label: '고량주', category: '중식주점', basePrice: 9200},
  WHISKEY: {label: '위스키', category: '바', basePrice: 12000},
  VODKA: {label: '보드카', category: '라운지바', basePrice: 9800},
  TRADITIONAL: {label: '전통주', category: '전통주점', basePrice: 6100},
  HIGHBALL: {label: '하이볼', category: '하이볼바', basePrice: 6500},
  TEQUILA: {label: '데킬라', category: '칵테일바', basePrice: 10100},
};

const formatWon = value => `${Number(value).toLocaleString('ko-KR')}원`;

const buildOperationInfoDtos = index =>
  DAY_ORDER.map((day, dayIndex) => ({
    dayOfWeek: day,
    isClosed: dayIndex === (index + 2) % 7 && index % 5 === 0,
    openTime: '17:00:00',
    closeTime: '02:00:00',
    breakStartTime: index % 4 === 0 ? '22:30:00' : null,
    breakEndTime: index % 4 === 0 ? '23:00:00' : null,
  }));

const buildMainDrinkDtos = (drinkType, basePrice, index) => {
  const fallbackTypes = ['SOJU', 'BEER', 'HIGHBALL', 'WINE'];
  const sideType = fallbackTypes[(index + 1) % fallbackTypes.length];

  return [
    {type: drinkType, price: formatWon(basePrice + index * 250)},
    {type: sideType, price: formatWon(basePrice + 1200 + index * 180)},
    {type: 'COCKTAIL', price: formatWon(basePrice + 2100 + index * 160)},
  ];
};

const buildMenuList = (tabValue, drinkLabel, basePrice, index) => [
  {
    name: `${drinkLabel} 세트`,
    price: String(basePrice + index * 220),
    imgUrl: `https://picsum.photos/seed/${tabValue}-menu-${
      index + 1
    }-a/400/400`,
  },
  {
    name: `${drinkLabel} 안주`,
    price: String(basePrice + 1700 + index * 130),
    imgUrl: `https://picsum.photos/seed/${tabValue}-menu-${
      index + 1
    }-b/400/400`,
  },
];

const buildStoreItem = (tab, tabIndex, index) => {
  const meta = TAB_META[tab.value];
  const area = AREA_NAMES[index % AREA_NAMES.length];
  const id = Number(`${tabIndex + 1}${String(index + 1).padStart(2, '0')}`);

  return {
    id,
    name: `${area} ${meta.label} 추천술집 ${index + 1}호`,
    isCertified: index % 3 === 0,
    categories: [meta.category],
    mainImgUrl: `https://picsum.photos/seed/${tab.value}-store-${
      index + 1
    }/900/650`,
    menuList: buildMenuList(tab.value, meta.label, meta.basePrice, index),
    mainDrinkDtos: buildMainDrinkDtos(tab.value, meta.basePrice, index),
    storeRate: Number((4.1 + ((index + tabIndex) % 8) * 0.1).toFixed(1)),
    postCount: 80 + tabIndex * 11 + index * 9,
    isAlwaysOpen: index % 8 === 0,
    operationInfoDtos: buildOperationInfoDtos(index),
  };
};

export const mockTodayRecommStoresByType = drinkTabs.reduce(
  (acc, tab, tabIdx) => {
    acc[tab.value] = Array.from({length: 10}, (_, idx) =>
      buildStoreItem(tab, tabIdx, idx),
    );
    return acc;
  },
  {},
);
