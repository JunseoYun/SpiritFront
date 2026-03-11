import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERRED_DRINK_TAB_KEY = 'preferredRecommDrinkTab';

export const DEFAULT_RECOMM_DRINK_TAB = 'SOJU';

let cachedPreferredDrinkTab = null;

export const setPreferredDrinkTab = async value => {
  if (typeof value !== 'string' || value.length === 0) return;
  try {
    await AsyncStorage.setItem(PREFERRED_DRINK_TAB_KEY, value);
    cachedPreferredDrinkTab = value;
  } catch (error) {
    console.error('추천 주종 저장 중 오류가 발생했습니다:', error);
  }
};

export const getPreferredDrinkTab = async () => {
  if (cachedPreferredDrinkTab) return cachedPreferredDrinkTab;
  try {
    const stored = await AsyncStorage.getItem(PREFERRED_DRINK_TAB_KEY);
    if (stored) {
      cachedPreferredDrinkTab = stored;
      return stored;
    }
  } catch (error) {
    console.error('추천 주종 가져오기 중 오류가 발생했습니다:', error);
  }
  return null;
};
