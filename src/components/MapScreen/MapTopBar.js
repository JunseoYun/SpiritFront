import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useMapSearch} from '../../context/MapSearchContext';
import MapSearchBar from './MapSearchBar';
import FastImage from 'react-native-fast-image';
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
    <>
      <View
        style={[
          {
            position: 'absolute',
            flex: 1,
            width: '100%',
            paddingTop: insets.top + 10,
            gap: 5,
            paddingHorizontal: 18,
          },
        ]}>
        {/* <View
          style={{
            flexDirection: 'row',
            gap: 18,
          }}> */}
        <View style={[styles.searchContainer, {flex: 1}]}>
          <Pressable
            onPress={() => {
              navigation.navigate('MainScreen');
            }}
            style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#555" />
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
        {/* <Pressable onPress={onExplorePress} style={styles.exploreBtnWrap}>
            <View style={styles.exploreContainer}>
              <FastImage
                source={require('../../assets/SearchAiButton.png')}
                style={styles.exploreImage}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.exploreLabelWrap}>
                <Text style={styles.exploreLabel}>탐색</Text>
              </View>
            </View>
          </Pressable> */}
        {/* </View> */}
        {refresh && <MapSearchBar onPress={() => setcenterrefresh(radius)} />}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    height: 46,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
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
    color: '#8E8E8E',
    fontSize: 14,
    paddingRight: 30,
  },
  exploreBtnWrap: {
    width: 48,
    height: 48,
  },
  exploreContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  exploreImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  exploreLabelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 4,
    alignItems: 'center',
  },
  exploreLabel: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Pretendard-Medium',
  },
});

export default MapTopBar;
