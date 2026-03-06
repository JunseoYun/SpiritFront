import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, FlatList, Platform} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Loading from '../../hooks/Loading';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
import TodayRecommTotalItem from '../../components/TotalScreen/TodayRecommTotalItem';
import TotalItemSkeleton from '../../components/TotalScreen/TotalSkeleton/TotalItemSkeleton';
import ScrollToTopButton from '../../utils/ScrollToTopButton';
import CustomText from '../../utils/CustomText';

const TodayRecommStoreScreen = ({navigation}) => {
  const route = useRoute();
  const {bottom} = useSafeAndroidInsets();
  const insets = useSafeAreaInsets();

  const routeStores = route?.params?.stores;
  const location = route?.params?.location;

  const [refreshing, setRefreshing] = useState(false);
  const [firstloading, setFirstloading] = useState(true);

  const stores = useMemo(
    () => (Array.isArray(routeStores) ? routeStores.filter(Boolean) : []),
    [routeStores],
  );

  const {
    scrollRef,
    visible: showScrollToTop,
    handleScroll,
    updateVisibility,
    scrollToTop,
  } = useScrollToTopVisibility();
  const scrollButtonBottom = (bottom || 16) + 34;

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setFirstloading(false);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (firstloading || refreshing) {
      updateVisibility(0);
    }
  }, [firstloading, refreshing, updateVisibility]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    requestAnimationFrame(() => {
      setRefreshing(false);
    });
  }, []);

  const renderStoreItem = ({item}) => (
    <TodayRecommTotalItem store={item} location={location} navigation={navigation} />
  );

  return (
    <View style={styles.container}>
      {firstloading || refreshing ? (
        <FlatList
          data={[1, 2, 3]}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={() => <TotalItemSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          ref={scrollRef}
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={(item, index) => `${item?.id ?? 'recomm'}-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollViewContent,
            {paddingBottom: insets.bottom + 20},
          ]}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReachedThreshold={0.5}
        />
      )}

      {stores.length === 0 && !firstloading && !refreshing && (
        <CustomText style={styles.emptyText}>추천 매장이 없어요.</CustomText>
      )}

      <ScrollToTopButton
        visible={showScrollToTop}
        bottom={scrollButtonBottom}
        onPress={scrollToTop}
      />
      <Loading loading={refreshing} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 60,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default TodayRecommStoreScreen;
