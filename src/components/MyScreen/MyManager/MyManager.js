import React, {
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import ColorUtil from '../../../utils/ColorUtil';
import FastImage from 'react-native-fast-image';
import {Store_getby_managed} from '../../../api/storeApi';
import Loading from '../../../hooks/Loading';
import CustomText from '../../../utils/CustomText';

const MyManager = forwardRef(
  ({navigation, onRefreshingChange, onContentLayout}, ref) => {
    const [page, setPage] = useState(0);
    const [totalpage, setTotalpage] = useState(0);
    const [mysotredata, setMystoredata] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const MyStore = async (targetPage, reset = false) => {
      if (reset) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const data = await Store_getby_managed(targetPage);
        setTotalpage(data?.totalPages ?? 0);
        if (targetPage === 0) {
          setMystoredata(data?.content ?? []);
        } else {
          setMystoredata(prev => [...prev, ...(data?.content ?? [])]);
        }
        setPage(targetPage);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    useFocusEffect(
      useCallback(() => {
        if (mysotredata.length === 0) {
          MyStore(0, true);
        }
      }, [mysotredata.length]),
    );

    useEffect(() => {
      onRefreshingChange?.(refreshing);
    }, [refreshing, onRefreshingChange]);

    const handleOpenStore = store => {
      if (!store?.storeId) {
        return;
      }

      navigation.navigate('StoreStack', {
        screen: 'StoreMainScreen',
        params: {storeId: store.storeId},
      });
    };

    const handleManageStore = store => {
      if (!store?.storeId) {
        return;
      }

      navigation.navigate('StoreStack', {
        screen: 'StoreManageScreen',
        params: {
          storeId: store.storeId,
          storedata: store,
          storeName: store.storeName,
        },
      });
    };

    const loadMore = () => {
      if (loading || mysotredata.length === 0) {
        return;
      }

      const isLastPage = totalpage !== 0 && page >= totalpage - 1;
      if (isLastPage) {
        return;
      }

      MyStore(page + 1, false);
    };

    const refresh = () => {
      if (refreshing) {
        return;
      }
      MyStore(0, true);
    };

    useImperativeHandle(
      ref,
      () => ({
        refresh,
        loadMore,
      }),
      [refresh, loadMore],
    );

    const renderStoreItem = ({item, index}) => {
      const isLast = index === mysotredata.length - 1;
      const address = item.locationDto?.address || 'No address';
      const detail = item.locationDto?.addressDetail
        ? ` ${item.locationDto.addressDetail}`
        : '';

      return (
        <View style={[styles.storeRow, !isLast && styles.storeRowDivider]}>
          <Pressable
            style={styles.rowContent}
            onPress={() => handleOpenStore(item)}>
            <FastImage
              source={
                item.mainImgUrl
                  ? {uri: item.mainImgUrl}
                  : require('../../../assets/default_store6.png')
              }
              style={styles.storeImage}
            />
            <View style={styles.textWrapper}>
              <CustomText style={styles.storeName} numberOfLines={1}>
                {item.storeName || 'No store name'}
              </CustomText>
              <CustomText style={styles.storeAddress} numberOfLines={1}>
                {address}
                {detail ? `,${detail}` : null}
              </CustomText>
            </View>
          </Pressable>
          <Pressable
            style={styles.manageButton}
            hitSlop={15}
            onPress={() => handleManageStore(item)}>
            <CustomText style={styles.manageText}>Manage</CustomText>
          </Pressable>
        </View>
      );
    };

    const renderEmptyComponent = () => (
      <View style={styles.emptyState}>
        <CustomText style={styles.emptyTitle}>No managed stores.</CustomText>
        <CustomText style={styles.emptySubtitle}>
          Register a store to manage it here.
        </CustomText>
      </View>
    );
    return (
      <View style={styles.container}>
        <View style={styles.listCard} onLayout={onContentLayout}>
          {mysotredata.length > 0
            ? mysotredata.map((item, index) => (
                <View key={item.storeId ? item.storeId.toString() : `${index}`}>
                  {renderStoreItem({item, index})}
                </View>
              ))
            : !loading && renderEmptyComponent()}
        </View>
        <Loading loading={loading} />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
  },
  listCard: {
    backgroundColor: '#fff',
    paddingVertical: 6,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  storeRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E4E4',
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: '#EFEFEF',
  },
  textWrapper: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 13,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
  },
  manageButton: {
    borderRadius: 50,
    borderWidth: 1,
    borderColor: ColorUtil.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: '#F5F6F7',
  },
  manageText: {
    color: '#333',
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 18,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#7B7B7B',
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default MyManager;
