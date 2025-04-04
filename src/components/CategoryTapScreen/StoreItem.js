import React from 'react';
import {View, Text, Pressable, ScrollView, ImageBackground} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Categorystyles from '../../screens/CategoryTap/CategoryTapStyles';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../hooks/useStoreStatus';
import {PanGestureHandler} from 'react-native-gesture-handler';

const StoreItem = ({store, location, navigation}) => {
  const {translateAlcohol} = useTranslateAlcohol();

  const {
    isOpen,
    isBreak,
    closed,
    nextclosed,
    starttime,
    endtime,
    breakstart,
    breakend,
  } = useStoreStatus(store?.operationInfoDtos, store?.isAlwaysOpen);
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
      <View style={Categorystyles.imageView}>
        <ScrollView
          horizontal
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled={true} // 👈 추가
          contentContainerStyle={{
            paddingHorizontal: 18,
            gap: 18,
          }}>
          <View style={Categorystyles.menuItemView}>
            <ImageBackground
              source={
                store.mainImgUrl
                  ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
                  : require('../../assets/AppLogoNoback.png') // ✅ 로컬 이미지
              }
              style={Categorystyles.menuImageView}
              imageStyle={Categorystyles.menuImg}>
              {!isOpen && !nextclosed && !closed && (
                <View style={Categorystyles.overlay}>
                  <Text style={Categorystyles.overlayText}>
                    영업 종료{'\n'}
                    {starttime ? `${starttime} 오픈` : ''}
                  </Text>
                </View>
              )}
              {!isOpen && nextclosed && !closed && (
                <View style={Categorystyles.overlay}>
                  <Text style={Categorystyles.overlayText}>
                    영업 종료{'\n'}익일 휴무
                  </Text>
                </View>
              )}
              {!isOpen && !nextclosed && closed && (
                <View style={Categorystyles.overlay}>
                  <Text style={Categorystyles.overlayText}>금일 휴무</Text>
                </View>
              )}
              {/* ✅ 브레이크 타임 표시 */}
              {isOpen && isBreak && (
                <View style={Categorystyles.overlay}>
                  <Text style={Categorystyles.overlayText}>
                    브레이크 타임{'\n'}
                    {breakend ? `${breakend} 종료` : ''}
                  </Text>
                </View>
              )}
            </ImageBackground>
          </View>
          {store.menuList.length > 0 &&
            store.menuList.map(
              (menu, index) =>
                menu.imgUrl && (
                  <View key={index} style={Categorystyles.menuItemView}>
                    <ImageBackground
                      source={
                        {uri: menu.imgUrl} // ✅ 네트워크 이미지
                        // ✅ 로컬 이미지
                      }
                      style={Categorystyles.menuImageView}
                      imageStyle={Categorystyles.menuImg} // ✅ 스타일 조건부 적용
                    >
                      {(!isOpen && !nextclosed && !closed) ||
                      (!isOpen && nextclosed && !closed) ||
                      (!isOpen && !nextclosed && closed) ||
                      (isOpen && isBreak) ? (
                        // 오버레이만 표시 (내용 없음)
                        <View style={Categorystyles.overlay}></View>
                      ) : (
                        // 메뉴 정보가 포함된 오버레이
                        <View style={Categorystyles.semiOverlay}>
                          <Text
                            style={Categorystyles.menuName}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {menu.name}
                          </Text>
                          <Text
                            style={Categorystyles.menuPrice}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {/^\d+$/.test(menu?.price)
                              ? Number(menu.price).toLocaleString() + '원'
                              : menu?.price}
                          </Text>
                        </View>
                      )}
                    </ImageBackground>
                  </View>
                ),
            )}
          {store.menuList?.length === 1 && (
            <View style={Categorystyles.menuItemView}>
              <ImageBackground
                source={require('../../assets/PorkBack.png')}
                // ✅ 로컬 "메뉴 더보기" 이미지
                style={Categorystyles.menuImageView2}
                imageStyle={Categorystyles.menuNoImg}>
                <Text style={Categorystyles.moreText}>메뉴 더보기 {'>'}</Text>
              </ImageBackground>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={Categorystyles.infoTopView}>
        <View style={Categorystyles.drinkView}>
          {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
            ? store.mainDrinkDtos?.map((drink, index) => {
                return (
                  <React.Fragment key={index}>
                    <Text style={[Categorystyles.drinkText]}>
                      {translateAlcohol(drink.type)} {drink.price}
                    </Text>
                    {index !== store.mainDrinkDtos.length - 1 && (
                      <View style={Categorystyles.division} />
                    )}
                  </React.Fragment>
                );
              })
            : '메인주류가 없습니다.'}
        </View>
        <View style={Categorystyles.infoTitleView}>
          <Text
            style={Categorystyles.storeName}
            numberOfLines={1}
            ellipsizeMode="tail">
            {store.name}
          </Text>
        </View>
        <View style={Categorystyles.infoReviewView}>
          <FontAwesomeIcon name="star" size={16} color="#FED348" />
          <Text style={Categorystyles.infoText}> {store.storeRate || 0}</Text>
          <Text
            style={[
              Categorystyles.infoText,
              {color: '#999', fontFamily: 'Pretendard-Regular', marginLeft: 3},
            ]}>
            ({store.reviewCount || 0})
          </Text>
          <Ionicons
            name="heart"
            size={16}
            color={'#F85656'}
            style={{marginLeft: 7}}
          />
          <Text style={[Categorystyles.infoText, {marginLeft: 3}]}>
            {store.storeLikeCount || 0}
          </Text>
        </View>
        <View style={Categorystyles.infoTimeView}>
          <View style={Categorystyles.infoView}>
            {store?.isAlwaysOpen == true ? (
              <Text style={Categorystyles.subInfoText}>24시간 영업</Text>
            ) : store?.isAlwaysOpen == false && closed ? (
              <Text style={Categorystyles.subInfoText}>금일 휴무</Text>
            ) : (
              <Text style={Categorystyles.subInfoText}>
                영업 종료 {endtime || '정보 없음'}
              </Text>
            )}
          </View>
          {breakstart && breakend && (
            <View style={Categorystyles.infoView}>
              <Text style={Categorystyles.subInfoText}>
                휴게시간 {breakstart} ~ {breakend}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default StoreItem;
