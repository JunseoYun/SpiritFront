import {StoreMenuget} from '../../../api/menuApi';
import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import Loading from '../../../hooks/Loading';
import StoreMenuScreen from '../StoreMenuScreen';

const menuCache = new Map();

const StoreMenuManageScreen = ({
  storeId,
  navigation,
  children,
  onSortDirtyChange,
}) => {
  const initialMenus = menuCache.get(storeId) || [];
  const [menus, setMenus] = useState(initialMenus);
  const [loading, setLoading] = useState(initialMenus.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const cachedMenus = menuCache.get(storeId);
    if (cachedMenus) {
      setMenus(cachedMenus);
      setError(null);
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setLoading(true);
    setError(null);
    StoreMenuget(storeId)
      .then(data => {
        if (isMounted) {
          setMenus(data);
          menuCache.set(storeId, data);
        }
      })
      .catch(e => {
        if (isMounted) setError('메뉴 불러오기 실패');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [storeId]);

  const refreshMenus = useCallback(async () => {
    try {
      setLoading(true);
      const menusData = await StoreMenuget(storeId);
      menuCache.set(storeId, menusData);
      setMenus(menusData);
      setError(null);
    } catch (error) {
      console.error('메뉴 다시 불러오기 실패', error);
      setError('메뉴 불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  if (typeof children === 'function') {
    return children({
      menus,
      loading,
      error,
      refreshMenus,
    });
  }

  return (
    <View style={[styles.container]}>
      <StoreMenuScreen
        navigation={navigation}
        storeId={storeId}
        menus={menus}
        loading={loading}
        onMenuUpdateComplete={refreshMenus}
        isUpdatable="true"
        onSortDirtyChange={onSortDirtyChange}
      />
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

export default StoreMenuManageScreen;
