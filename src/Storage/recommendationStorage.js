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
  }
  return null;
};
