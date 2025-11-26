import {StoreDrinkget} from '../../../api/drinkApi';
import React, {useState, useEffect, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import StoreAlcoholScreen from '../StoreAlcoholScreen';
import Loading from '../../../hooks/Loading';
import CustomText from '../../../utils/CustomText';

const alcoholCache = new Map();
const sectionPositionsCache = new Map();

const StoreAlcoholManageScreen = ({
  storeId,
  storeName,
  navigation,
  children,
  onSortDirtyChange,
}) => {
  const [alcohols, setAlcohols] = useState(
    () => alcoholCache.get(storeId) || [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sectionPositions, setSectionPositions] = useState(
    () => sectionPositionsCache.get(storeId) || {},
  );

  useEffect(() => {
    let isMounted = true;
    const cachedAlcohols = alcoholCache.get(storeId);
    if (cachedAlcohols) {
      setAlcohols(cachedAlcohols);
      setError(null);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);
    setError(null);
    StoreDrinkget(storeId)
      .then(data => {
        if (isMounted) {
          setAlcohols(data);
          alcoholCache.set(storeId, data);
        }
      })
      .catch(e => {
        if (isMounted) setError('주류 불러오기 실패');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [storeId]);

  useEffect(() => {
    sectionPositionsCache.set(storeId, sectionPositions);
  }, [storeId, sectionPositions]);

  useEffect(() => {
    setSectionPositions(sectionPositionsCache.get(storeId) || {});
  }, [storeId]);

  const refreshAlcohols = useCallback(async () => {
    try {
      setLoading(true);
      const Alcohols = await StoreDrinkget(storeId);
      alcoholCache.set(storeId, Alcohols);
      setAlcohols(Alcohols);
      setError(null);
    } catch (error) {
      console.error('메뉴 다시 불러오기 실패', error);
      setError('주류 불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  if (typeof children === 'function') {
    return children({
      alcohols,
      loading,
      error,
      refreshAlcohols,
      sectionPositions,
      setSectionPositions,
    });
  }

  return (
    <View style={styles.container}>
      {error && <CustomText style={{color: 'red'}}>{error}</CustomText>}
      {!loading && !error && (
        <StoreAlcoholScreen
          navigation={navigation}
          storeId={storeId}
          alcohols={alcohols}
          sectionPositions={sectionPositions}
          setSectionPositions={setSectionPositions}
          isUpdatable={true}
          onAlcoholUpdateComplete={refreshAlcohols}
          onSortDirtyChange={onSortDirtyChange}
        />
      )}
      <Loading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

export default StoreAlcoholManageScreen;
