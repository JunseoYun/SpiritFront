import React from 'react';
import {View, Text, Platform} from 'react-native';
import PopularStoreItem from './PopularStoreItem';
import PopularItemSkeleton from './PopularItemSkeleton';

const PopularStoresSection = ({
  popularstores = [],
  location,
  navigation,
  screenWidth,
  loading = false,
  popularloading = false,
  popularempty = false,
  onHeaderLayout = () => {},
}) => {
  return (
    <View>
      <View
        style={{
          backgroundColor: '#fff',
          paddingLeft: 20,
          paddingTop: 20,
          paddingBottom: 10,
        }}
        onLayout={e => {
          const {height} = e.nativeEvent.layout;
          onHeaderLayout(height);
        }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'Pretendard-SemiBold',
            color: '#181a1a',
          }}>
          현재 인기 매장
        </Text>
      </View>

      {/* 인기 매장 아이템 목록 */}
      {popularstores?.map(item => (
        <PopularStoreItem
          key={item?.id?.toString?.() ?? Math.random().toString(36)}
          store={item}
          location={location}
          navigation={navigation}
          screenWidth={screenWidth}
        />
      ))}

      {/* 하단: 로딩 스켈레톤 또는 빈 상태 */}
      {loading || popularloading ? (
        <View style={{backgroundColor: '#fff'}}>
          {[1, 2, 3, 4].map(i => (
            <PopularItemSkeleton key={i} />
          ))}
        </View>
      ) : (
        !loading && !popularloading && popularempty && (
          <Text
            style={{
              width: '100%',
              backgroundColor: '#fff',
              textAlign: 'center',
              paddingVertical: 60,
              fontFamily: 'Pretendard-Medium',
              fontSize: 17,
              color: '#c0c0c0',
              alignSelf: 'center',
            }}>
            조건에 해당하는 매장이 없어요.
          </Text>
        )
      )}
    </View>
  );
};

export default React.memo(PopularStoresSection);
