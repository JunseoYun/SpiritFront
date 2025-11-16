import {StoreDrinkget} from '../../../api/drinkApi';
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import StoreAlcoholScreen from '../StoreAlcoholScreen';
import Loading from '../../../hooks/Loading';

const StoreAlcoholManageScreen = ({
  storeId,
  storeName,
  navigation,
  children,
}) => {
  const [alcohols, setAlcohols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sectionPositions, setSectionPositions] = useState({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    StoreDrinkget(storeId)
      .then(data => {
        if (isMounted) setAlcohols(data);
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

  const refreshAlcohols = async () => {
    try {
      const Alcohols = await StoreDrinkget(storeId);
      setAlcohols(Alcohols);
    } catch (error) {
      console.error('메뉴 다시 불러오기 실패', error);
    }
  };

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
      {error && <Text style={{color: 'red'}}>{error}</Text>}
      {!loading && !error && (
        <StoreAlcoholScreen
          navigation={navigation}
          storeId={storeId}
          alcohols={alcohols}
          sectionPositions={sectionPositions}
          setSectionPositions={setSectionPositions}
          isUpdatable={true}
          onAlcoholUpdateComplete={refreshAlcohols}
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
