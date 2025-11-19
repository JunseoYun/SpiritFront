import React from 'react';
import {StyleSheet, View, Text, Pressable, Platform} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useMapSearch} from '../../context/MapSearchContext';
import MapSearchBar from './MapSearchBar';
import CancelText from '../CancelText/CancelText';

const MapTopBar = ({
  navigation,
  onBackPress,
  onSearchPress,
  onExplorePress,
  refresh,
  setcenterrefresh,
  radius,
}) => {
  const insets = useSafeAreaInsets();
  const {searchText, setSearchText} = useMapSearch();
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 10,
        },
      ]}>
      <View style={[styles.searchContainer, {flex: 1}]}>
        <Pressable
          onPress={() => {
            navigation.navigate('MainScreen');
          }}
          style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#333" />
        </Pressable>

        <Pressable
          style={styles.searchBox}
          onPress={() => {
            navigation.navigate('SearchStack', {
              screen: 'SearchScreen',
            });
          }}>
          <Text
            style={[
              styles.placeholder,
              searchText?.trim()?.length > 0 && {color: 'black'},
            ]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {searchText?.trim()?.length > 0
              ? searchText
              : '원하는 술집이나 메뉴를 검색하세요'}
          </Text>
          {searchText?.trim()?.length > 0 && (
            <CancelText
              rightnum={0}
              topnum={0}
              paddingnum={0}
              handlecancel={() => setSearchText('')}
              size={20}
            />
          )}
        </Pressable>
      </View>

      {refresh && <MapSearchBar onPress={() => setcenterrefresh(radius)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flex: 1,
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 9,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    shadowOffset: {width: 0, height: 2},
    marginHorizontal: 18,
  },
  backBtn: {
    marginRight: 6,
    paddingRight: 6,
  },
  searchBox: {
    flex: 1,
    justifyContent: 'center',
  },
  placeholder: {
    color: '#9E9E9E',
    fontSize: 16,
    paddingRight: 30,
    fontFamily: 'Pretendard-Regular',
  },
});

export default MapTopBar;
