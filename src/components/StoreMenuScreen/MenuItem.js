// ✅ MenuItem.js 전체 코드 (UX/UI 개선, 정렬 아이콘 왼쪽 고정)
import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../../utils/CustomText';

const ICON_WIDTH = 45; // 좌측 정렬 아이콘 공간 고정값

const MenuItem = ({
  menu,
  isUpdatable,
  isLast,
  navigation,
  onMenuUpdateComplete,
  onMoveUp,
  onMoveDown,
}) => {
  const Wrapper = isUpdatable ? Pressable : View;

  const handleImagePress = () => {
    if (isUpdatable) return;
    navigation.navigate('StoreStack', {
      screen: 'ImageViewerScreen',
      params: {
        images: menu.imgUrl,
      },
    });
  };

  const handlePress = () => {
    if (!isUpdatable) return;
    navigation.navigate('StoreStack', {
      screen: 'MenuEditScreen',
      params: {
        menuId: menu.id,
        menuName: menu.name,
        menuType: menu.menuType,
        menuPrice: menu.price,
        menuImgUrl: menu.imgUrl,
        menudescription: menu.description,
      },
    });

    const unsubscribe = navigation.addListener('focus', async () => {
      if (typeof onMenuUpdateComplete === 'function') {
        await onMenuUpdateComplete();
      }
      unsubscribe();
    });
  };

  return (
    <View style={[styles.container, isLast && {borderBottomWidth: 0}]}>
      {/* 🔵 왼쪽 정렬 버튼 고정 공간 */}
      {isUpdatable && (
        <View style={styles.sortIconBox}>
          <Pressable
            hitSlop={{top: 10}}
            style={styles.sortButton}
            onPress={onMoveUp}>
            <Feather name="chevron-up" size={20} color="#B5BAC3" />
          </Pressable>
          <Pressable
            hitSlop={{bottom: 10}}
            style={styles.sortButton}
            onPress={onMoveDown}>
            <Feather name="chevron-down" size={20} color="#B5BAC3" />
          </Pressable>
        </View>
      )}

      {/* 🔵 메뉴 내용 영역 */}
      <Wrapper
        onPress={isUpdatable ? handlePress : undefined}
        style={styles.menuContainer}>
        <View
          style={[
            styles.textView,
            menu.description == '' && {justifyContent: 'space-evenly'},
          ]}>
          <View style={styles.menuTitleRow}>
            <CustomText style={styles.nameText}>{menu.name}</CustomText>
            {menu?.menuType === 'MAIN' && (
              <CustomText style={styles.mainMenu}>대표</CustomText>
            )}
          </View>

          {menu.description && (
            <CustomText style={styles.desc}>{menu.description}</CustomText>
          )}

          <CustomText style={styles.priceText}>
            {menu.price === '변동'
              ? '변동'
              : `${Number(menu.price).toLocaleString()}원`}
          </CustomText>
        </View>

        <View style={styles.ImageContainer}>
          {menu.imgUrl &&
            (isUpdatable ? (
              <FastImage source={{uri: menu.imgUrl}} style={styles.image} />
            ) : (
              <Pressable onPress={handleImagePress}>
                <FastImage source={{uri: menu.imgUrl}} style={styles.image} />
              </Pressable>
            ))}

          {/* 🔵 오른쪽 화살표 (수정 화면 안내) */}
          {isUpdatable && (
            <View style={styles.arrowBox}>
              <Feather name="chevron-right" size={25} color="#ccc" />
            </View>
          )}
        </View>
      </Wrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.7,
    borderColor: '#eee',
    flexDirection: 'row',
    paddingLeft: 6, // 왼쪽 좀 더 여백
  },

  // 🔵 왼쪽 정렬 아이콘 (고정폭)
  sortIconBox: {
    width: ICON_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4, // 전체 영역 기본 패딩
    gap: 8,
  },

  sortButton: {
    width: '100%', // 좌측 전체 영역에서 터치 가능
    alignItems: 'center',
  },

  menuContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },

  textView: {
    flex: 1,
    justifyContent: 'space-between',
  },

  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  nameText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },

  mainMenu: {
    fontSize: 10,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
    marginLeft: 7,
    backgroundColor: 'rgba(16, 190, 251, 0.7)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },

  desc: {
    paddingVertical: 5,
    width: '97%',
    fontSize: 15,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
    lineHeight: 22,
  },

  priceText: {
    marginTop: 7,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },

  ImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    marginHorizontal: 10,
  },

  // 🔵 오른쪽 화살표 박스
  arrowBox: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 6,
  },
});

export default MenuItem;
