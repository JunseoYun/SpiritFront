const FILTER_KEYS = Object.freeze({
  distance: '\uac70\ub9ac',
  category: '\uce74\ud14c\uace0\ub9ac',
  alcohol: '\uc8fc\uc885',
  priceOrder: '\uac00\uaca9\uc21c',
  moods: '\ub9e4\uc7a5\ubd84\uc704\uae30',
  visitTime: '\ubc29\ubb38\uc2dc\uac04',
  people: '\uc778\uc6d0',
  parking: '\uc8fc\ucc28',
  corkage: '\ucf5c\ud0a4\uc9c0',
  screen: '\uc2a4\ud06c\ub9b0',
  room: '\ub8f8',
  outdoor: '\uc57c\uc7a5',
});

const CATEGORY_MAP = {
  '\uc774\uc790\uce74\uc57c': 'IZAKAYA', // 이자카야
  '\ud55c\uc2dd': 'KOREAN', // 한식
  '\uc591\uc2dd': 'WESTERN', // 양식
  '\uc911\uc2dd': 'CHINESE', // 중식
  '\ud3ec\uc7a5\ub9c8\ucc28': 'POCHA', // 포장마차
  '\uac10\uc131\uc8fc\uc810': 'GAMSEONG', // 감성주점
  '\uad6c\uc774\u00b7\uc9c4': 'GRILLED_STEW', // 구이·찜
  '\uce58\ud0a8\u00b7\ud638\ud504': 'CHICKEN_HOF', // 치킨·호프
  '\ud68c\u00b7\ud574\uc0b0\ubb3c': 'RAW_SEAFOOD', // 회·해산물
  '\ud38d\u00b7\ubc14': 'PUB_BAR', // 펍·바
};

const DRINK_MAP = {
  '\uc18c\uc8fc': 'SOJU',
  '\ub9e5\uc8fc': 'BEER',
  '\ub9c9\uac78\ub9ac': 'MAKGEOLLI',
  '\uc640\uc778': 'WINE',
  '\uce75\ud14c\uc77c': 'COCKTAIL',
  '\uc0ac\ucf00': 'SAKE',
  '\uace0\ub7c9\uc8fc': 'KAOLIANG',
  '\uc704\uc2a4\ud0a4': 'WHISKEY',
  '\ubcf4\ub4dc\uce74': 'VODKA',
  '\uc804\ud1b5\uc8fc': 'TRADITIONAL',
  '\ud558\uc774\ubcfc': 'HIGHBALL',
  '\ub370\ud0ac\ub77c': 'TEQUILA',
};

const MOOD_MAP = {
  '\ub300\ud654\ud558\uae30\u0020\uc88b\uc740': 'QUIET',
  '\ud65c\uae30\ucc2c': 'LIVELY',
  '\ud63c\uc220': 'SOLO_FRIENDLY',
  '\ub370\uc774\ud2b8': 'DATE',
  '\ud30c\ud2f0\u00b7\uc774\ubca4\ud2b8': 'PARTY_EVENT',
  '\uc804\ud1b5\uc801\uc778': 'TRADITIONAL',
  '\uc774\uad6d\uc801\uc778': 'EXOTIC',
  '\ubaa8\ub358\u00b7\uae54\ub054\ud55c': 'MODERN',
  '\ub178\ud3ec\u0020\uac10\uc131': 'OLD_SCHOOL',
  '\ubdf0\u0020\ub9db\uc9d1': 'VIEW_SPOT',
  '\ub85c\uceec\u0020\ub9db\uc9d1': 'LOCAL_FAVORITE',
  '\u0032\ucc28\u0020\ub9db\uc9d1': 'SECOND_ROUND',
};

const GROUP_VALUE = '\ub2e8\uccb4\u0020\ubc29\ubb38';
const AVAILABLE_VALUE = '\uac00\ub2a5';
const SCREEN_VALUE = '\uc124\uce58';

const toIsoTime = value => {
  if (typeof value !== 'string' || !value.includes(':')) return null;
  const [hoursRaw, minutesRaw] = value.split(':');
  const hours = Number.parseInt(hoursRaw, 10);
  const minutes = Number.parseInt(minutesRaw, 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  const pad = num => String(num).padStart(2, '0');

  // Keep the selected local time instead of converting to UTC
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(hours)}:${pad(minutes)}:00`;
};
const toArray = val => {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string' && val.trim().length > 0) {
    return [val.trim()];
  }
  return [];
};

const extractStoreList = data => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  return [];
};

export const buildConditionSearchDto = ({
  filters = {},
  searchKeyword = '',
} = {}) => {
  const dto = {};
  const trimmedKeyword =
    typeof searchKeyword === 'string' ? searchKeyword.trim() : '';
  if (trimmedKeyword) {
    dto.searchKeyword = trimmedKeyword;
  }

  const categoryLabel = filters[FILTER_KEYS.category];
  if (categoryLabel && CATEGORY_MAP[categoryLabel]) {
    dto.category = CATEGORY_MAP[categoryLabel];
  }

  const drinkLabel = filters[FILTER_KEYS.alcohol];
  if (drinkLabel && DRINK_MAP[drinkLabel]) {
    dto.drinkType = DRINK_MAP[drinkLabel];
  }

  const moodsValue = filters[FILTER_KEYS.moods];
  const moodList = toArray(moodsValue)
    .map(label => MOOD_MAP[label])
    .filter(Boolean);
  if (moodList.length > 0) {
    dto.moods = moodList.join(', ');
  }

  const timeValue = filters[FILTER_KEYS.visitTime];
  const isoTime = toIsoTime(timeValue);
  if (isoTime) {
    dto.conditionTime = isoTime;
  }

  if (filters[FILTER_KEYS.people] === GROUP_VALUE) {
    dto.isGroupAvailable = true;
  }
  if (filters[FILTER_KEYS.parking] === AVAILABLE_VALUE) {
    dto.isParkingAvailable = true;
  }
  if (filters[FILTER_KEYS.corkage] === AVAILABLE_VALUE) {
    dto.isCorkageAvailable = true;
  }
  if (filters[FILTER_KEYS.room] === AVAILABLE_VALUE) {
    dto.hasRoom = true;
  }
  if (filters[FILTER_KEYS.outdoor] === AVAILABLE_VALUE) {
    dto.hasOutdoor = true;
  }
  if (filters[FILTER_KEYS.screen] === SCREEN_VALUE) {
    dto.hasScreen = true;
  }

  const priceOrder = filters[FILTER_KEYS.priceOrder];
  if (priceOrder === 'ASC' || priceOrder === 'DESC') {
    dto.priceOrder = priceOrder;
  } else {
    dto.priceOrder = '';
  }
  return dto;
};

export const normalizeStoreResponse = storeData => {
  const list = extractStoreList(storeData);
  if (list.length === 0) return [];
  const sorted = [...list];
  sorted.sort((a, b) => {
    const aAddress = a?.locationDto?.address || '';
    const bAddress = b?.locationDto?.address || '';
    return aAddress.localeCompare(bAddress);
  });
  return sorted;
};

export const conditionSearchFilterKeys = FILTER_KEYS;
