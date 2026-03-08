export const drinkTabs = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '전통주', value: 'TRADITIONAL'},
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '데킬라', value: 'TEQUILA'},
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
  SOJU: {
    drink: '소주',
    category: '포차',
    priceBase: 3500,
    storeKeyword: '소주집',
    reviewBase: 120,
  },
  BEER: {
    drink: '맥주',
    category: '펍',
    priceBase: 4000,
    storeKeyword: '맥주창고',
    reviewBase: 110,
  },
  MAKGEOLLI: {
    drink: '막걸리',
    category: '전통주점',
    priceBase: 4500,
    storeKeyword: '막걸리상회',
    reviewBase: 95,
  },
  WINE: {
    drink: '와인',
    category: '와인바',
    priceBase: 6900,
    storeKeyword: '와인살롱',
    reviewBase: 140,
  },
  COCKTAIL: {
    drink: '칵테일',
    category: '칵테일바',
    priceBase: 7800,
    storeKeyword: '칵테일하우스',
    reviewBase: 105,
  },
  SAKE: {
    drink: '사케',
    category: '이자카야',
    priceBase: 8500,
    storeKeyword: '사케마루',
    reviewBase: 88,
  },
  KAOLIANG: {
    drink: '고량주',
    category: '중식주점',
    priceBase: 9000,
    storeKeyword: '고량주관',
    reviewBase: 82,
  },
  WHISKEY: {
    drink: '위스키',
    category: '바',
    priceBase: 12000,
    storeKeyword: '위스키하우스',
    reviewBase: 130,
  },
  VODKA: {
    drink: '보드카',
    category: '라운지바',
    priceBase: 9800,
    storeKeyword: '보드카클럽',
    reviewBase: 100,
  },
  TRADITIONAL: {
    drink: '전통주',
    category: '전통주점',
    priceBase: 6000,
    storeKeyword: '전통주당',
    reviewBase: 90,
  },
  HIGHBALL: {
    drink: '하이볼',
    category: '하이볼바',
    priceBase: 6500,
    storeKeyword: '하이볼포차',
    reviewBase: 150,
  },
  TEQUILA: {
    drink: '데킬라',
    category: '칵테일바',
    priceBase: 9900,
    storeKeyword: '데킬라바',
    reviewBase: 93,
  },
};

const buildTabItems = tab => {
  const meta = TAB_META[tab.value];

  return Array.from({length: 10}, (_, index) => {
    const order = index + 1;
    const area = AREA_NAMES[index % AREA_NAMES.length];

    return {
      id: `${tab.value}-${order}`,
      image: `https://picsum.photos/seed/${tab.value.toLowerCase()}-${order}/400/300`,
      drink: meta.drink,
      drinkType: tab.value,
      price: meta.priceBase + index * 300,
      storeName: `${area} ${meta.storeKeyword} ${order}asdasdasdadadsadsadasdsadasdasdsadasdd호`,
      category: meta.category,
      reviewCount: meta.reviewBase + index * 7,
      rating: Number((4.1 + ((index + tab.label.length) % 8) * 0.1).toFixed(1)),
      isCertified: index % 3 === 0,
    };
  });
};

export const mockDataByDrinkType = drinkTabs.reduce((acc, tab) => {
  acc[tab.value] = buildTabItems(tab);
  return acc;
}, {});

export const mockData = drinkTabs.flatMap(
  tab => mockDataByDrinkType[tab.value],
);
