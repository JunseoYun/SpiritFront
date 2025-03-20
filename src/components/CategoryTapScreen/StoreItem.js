import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ImageBackground,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Categorystyles from '../../screens/CategoryTap/CategoryTapStyles';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../hooks/useStoreStatus';

const StoreItem = ({store, location, navigation}) => {
  const {translateAlcohol} = useTranslateAlcohol();

  const {isOpen, isBreak, closed, starttime, endtime, breakstart, breakend} =
    useStoreStatus(store?.operationInfoDtos);
  console.log(store?.operationInfoDtos);
  return (
    <Pressable
      style={Categorystyles.itemContainer}
      onPress={() =>
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: store.id,
            innerlatitude: location.latitude,
            innerlongitude: location.longitude,
          },
        })
      }>
      <View style={Categorystyles.menuView}>
        {store.menuList && store.menuList.length > 0 ? (
          <ScrollView
            horizontal
            nestedScrollEnabled={true}
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{
              paddingHorizontal: 18,
              gap: 18,
              flexGrow: 1,
            }}>
            {store.menuList.map((menu, index) => (
              <View key={index} style={Categorystyles.menuItemView}>
                <ImageBackground
                  source={
                    menu.imgUrl
                      ? {uri: menu.imgUrl} // ✅ 네트워크 이미지
                      : require('../../assets/AppLogoNoback.png') // ✅ 로컬 이미지
                  }
                  style={Categorystyles.menuImageView}
                  imageStyle={
                    menu.imgUrl
                      ? Categorystyles.menuImg
                      : Categorystyles.menuNoImg
                  } // ✅ 스타일 조건부 적용
                >
                  {/* ✅ 영업 종료 표시 */}
                  {!isOpen && (
                    <View style={Categorystyles.overlay}>
                      {index === 0 && (
                        <Text style={Categorystyles.overlayText}>
                          영업 종료{'\n'}
                          {starttime ? `${starttime} 오픈` : ''}
                        </Text>
                      )}
                    </View>
                  )}
                  {/* ✅ 브레이크 타임 표시 */}
                  {isOpen && isBreak && (
                    <View style={Categorystyles.overlay}>
                      {index === 0 && (
                        <Text style={Categorystyles.overlayText}>
                          브레이크 타임{'\n'}
                          {breakend ? `${breakend} 종료` : ''}
                        </Text>
                      )}
                    </View>
                  )}
                </ImageBackground>

                <Text style={Categorystyles.menuName}>{menu.name}</Text>
                <Text style={Categorystyles.menuPrice}>
                  {/^\d+$/.test(menu?.price)
                    ? Number(menu.price).toLocaleString() + '원'
                    : menu?.price}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ImageBackground
            source={
              store.mainImgUrl
                ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
                : require('../../assets/AppLogoNoback.png') // ✅ 로컬 이미지
            }
            style={Categorystyles.storeMainView}
            imageStyle={
              store.mainImgUrl
                ? Categorystyles.storeMainImg
                : Categorystyles.menuNoImg
            }>
            {!isOpen && (
              <View style={Categorystyles.overlay}>
                <Text style={Categorystyles.overlayText}>
                  영업 종료{'\n'}
                  {starttime ? `${starttime} 오픈` : ''}
                </Text>
              </View>
            )}
            {/* ✅ 브레이크 타임 표시 */}
            {isOpen && isBreak && (
              <View style={Categorystyles.overlay}>
                <Text style={Categorystyles.overlayText}>
                  브레이크 타임{'\n'}
                  {endtime ? `${endtime} 종료` : ''}
                </Text>
              </View>
            )}
          </ImageBackground>
        )}
      </View>

      <View style={Categorystyles.infoTopView}>
        <View style={Categorystyles.infoTitleView}>
          <Text
            style={Categorystyles.storeName}
            numberOfLines={1}
            ellipsizeMode="tail">
            {store.name}
          </Text>
          <Text
            style={Categorystyles.alcoholText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
              ? store.mainDrinkDtos
                  .map(
                    drink =>
                      `${translateAlcohol(
                        drink.type,
                      )} ${drink.price.toLocaleString()}원`,
                  )
                  .join(' ')
              : '대표 주종 미등록'}
          </Text>
        </View>
        <View style={Categorystyles.infoView}>
          <FontAwesomeIcon name="star" size={15} color="#FCC104" />
          <Text style={Categorystyles.infoText}> {store.storeRate || 0}</Text>
          <Text style={Categorystyles.infoText}>
            {' '}
            . 고객리뷰 {store.reviewCount || 0}
          </Text>
          <Text style={Categorystyles.infoText}>
            {' '}
            . 찜 {store.storeLikeCount || 0}
          </Text>
        </View>
        <View style={Categorystyles.infoTimeView}>
          <View style={Categorystyles.infoView}>
            <Ionicons name="time-outline" size={15} color="#333" />
            <Text style={Categorystyles.infoText}>
              {' '}
              영업 중 · {endtime || ''}
            </Text>
          </View>
          {breakstart && breakend && (
            <View style={Categorystyles.infoView}>
              <MaterialCommunityIcons name="sleep" size={15} color="#333" />
              <Text style={Categorystyles.infoText}>
                {' '}
                {breakstart} ~ {breakend}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default StoreItem;
