import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MenuItem = ({ menu, onPressMenuOption, isExpanded, toggleExpand, setButtonPosition }) => {
  return (
    <View style={styles.SignatureMenuView}>
      <View style={styles.ImageContainer}>
        <Image
          source={
            menu.imgUrl ? { uri: menu.imgUrl } : require('../../assets/kim.png')
          }
          style={styles.Signatureimg}
        />
      </View>
      <View style={styles.SignatureMenuTextsview}>
        <View style={styles.menuTitleRow}>
          {/* <Text style={styles.Signaturetitle}>{menu.menuName || '메뉴 이름'}</Text> */}
          <Text style={styles.Signaturetitle}>매운갈비찜</Text>
          <Pressable
            onPress={(event) => {
              onPressMenuOption(menu.menuId);
              // 버튼의 위치 계산
              event.target.measure((x, y, width, height, pageX, pageY) => {
                setButtonPosition({ x: pageX, y: pageY + height }); // 버튼 아래로 모달 배치
              });
            }}
            style={styles.updateicons}>
            <MaterialCommunityIcons
              name={'dots-vertical'}
              size={20}
              color={'black'}
            />
          </Pressable>
        </View>
        <Pressable onPress={toggleExpand}>
          <Text
            style={styles.Signaturecontent}
            numberOfLines={isExpanded ? null : 3}
            ellipsizeMode="tail">
            {/* {menu.menuContent || '메뉴 설명'} */}
            시그니처 메뉴 매운갈비찜입니다. 맵기 조절 가능!
          </Text>
        </Pressable>
        <Text style={styles.Signatureprice}>{menu.price}원</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  SignatureMenuView: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#E7E7E7',
  },
  ImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  Signatureimg: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  SignatureMenuTextsview: {
    flex: 1,
    paddingLeft: 10,
    paddingVertical: 3,
  },
  menuTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  Signaturetitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  Signaturecontent: {
    paddingVertical: 5,
    width: '90%',
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
  },
  Signatureprice: {
    marginTop: 5,
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default MenuItem;
