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
  const {searchText} = useMapSearch();
  return (
    <>
      <View
        style={[
          {
            position: 'absolute',
            justifyContent: 'space-between',
            flex: 1,
            width: '100%',
            paddingTop: insets.top + 10,
            gap: 5,
            paddingHorizontal: 10,
          },
        ]}>
        <View style={{flexDirection: 'row'}}>
          <View style={[styles.searchContainer]}>
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
                ]}>
                {searchText?.trim()?.length > 0
                  ? searchText
                  : '원하는 술집이나 메뉴를 검색하세요'}
              </Text>
            </Pressable>
          </View>

          <TouchableOpacity
            onPress={onExplorePress}
            style={styles.exploreBtnWrap}>
            <LinearGradient
              colors={['#3CBBFF', '#30D4F9', '#9A6CFF']}
              locations={[0, 0.5, 1]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.exploreBtn}>
              <MaterialCommunityIcons
                name="navigation-variant"
                size={20}
                color="white"
                style={{marginBottom: 3}}
              />
              <Text style={styles.exploreText}>탐색</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {refresh && <MapSearchBar onPress={() => setcenterrefresh(radius)} />}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flex: 8,
    flexDirection: 'row',
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
  },
  exploreBtnWrap: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreBtn: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  exploreText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
  },
});

export default MapTopBar;
