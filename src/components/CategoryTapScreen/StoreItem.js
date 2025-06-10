import React from 'react';
import {View, Text, Pressable, ScrollView, ImageBackground} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Categorystyles from '../../screens/CategoryTap/CategoryTapStyles';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../hooks/useStoreStatus';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import FastImage from 'react-native-fast-image';

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

  const {token} = useAuth();
  const {showToast} = useToast();
  const handleStorePress = () => {
    if (!token) {
      showToast('로그인 후 이용할 수 있어요!', 'center');
      return;
    }

    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: store.id},
    });
  };

  return (
    <View style={Categorystyles.itemContainer}>
      <View style={Categorystyles.imageView}>
        <ScrollView
          horizontal
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          onStartShouldSetResponder={() => true}
          contentContainerStyle={{
            paddingHorizontal: 18,
            gap: 18,
          }}>
          <Pressable
            onPress={handleStorePress}
            style={Categorystyles.menuItemView}>
            {store.mainImgUrl ? (
              <ImageBackground
                resizeMode={FastImage.resizeMode.cover}
                source={
                  {uri: store.mainImgUrl} // ✅ 네트워크 이미지
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

                {isOpen && isBreak && (
                  <View style={Categorystyles.overlay}>
                    <Text style={Categorystyles.overlayText}>
                      브레이크 타임{'\n'}
                      {breakend ? `${breakend} 종료` : ''}
                    </Text>
                  </View>
                )}
              </ImageBackground>
            ) : (
              <ImageBackground style={Categorystyles.noneImageView}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <FastImage
                    source={require('../../assets/store.png')}
                    style={Categorystyles.noneImg}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </View>
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

                {isOpen && isBreak && (
                  <View style={Categorystyles.overlay}>
                    <Text style={Categorystyles.overlayText}>
                      브레이크 타임{'\n'}
                      {breakend ? `${breakend} 종료` : ''}
                    </Text>
                  </View>
                )}
              </ImageBackground>
            )}
          </Pressable>
          {store.menuList?.length > 0 &&
            store.menuList
              .filter(menu => !!menu.imgUrl)
              .map((menu, index) => (
                <Pressable
                  onPress={handleStorePress}
                  key={index}
                  style={Categorystyles.menuItemView}>
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
                </Pressable>
              ))}
        </ScrollView>
      </View>

      <Pressable onPress={handleStorePress} style={Categorystyles.infoTopView}>
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
          {store.isCertified == true && (
            <FastImage
              source={require('../../assets/verifyMaker.png')}
              style={Categorystyles.imageStyle}
            />
          )}
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
      </Pressable>
    </View>
  );
};

export default StoreItem;
