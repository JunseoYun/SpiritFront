import {StoreMenuget} from '../../../api/menuApi';
import React, {
  useState,
  useMemo,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Loading from '../../../hooks/Loading';
import StoreMenuScreen from '../StoreMenuScreen';
const StoreMenuManageScreen = ({storeId, navigation, children}) => {
  const insets = useSafeAreaInsets();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    StoreMenuget(storeId)
      .then(data => {
        if (isMounted) setMenus(data);
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

  const refreshMenus = async () => {
    try {
      const Menus = await StoreMenuget(storeId);
      setMenus(Menus);
    } catch (error) {
      console.error('메뉴 다시 불러오기 실패', error);
    }
  };

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
        onMenuUpdateComplete={refreshMenus}
        isUpdatable="true"
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
