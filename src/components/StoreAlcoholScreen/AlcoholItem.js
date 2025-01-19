import React, {useState} from 'react';
import {View, Text, Pressable, Image, StyleSheet} from 'react-native';

const AlcoholItem = ({alcohol, onPressMenuOption, setButtonPosition}) => {
  const [isPressed, setIsPressed] = useState(false); // 눌림 상태 관리

  const handleLongPress = event => {
    // 모달 위치 설정
    event.target.measure((x, y, width, height, pageX, pageY) => {
      setButtonPosition({x: pageX, y: pageY + height}); // 버튼 아래로 모달 배치
    });
    // 모달 열기
    onPressMenuOption(menu.menuId);
  };

  return (
    <Pressable
      onLongPress={handleLongPress} // 꾹 눌렀을 때 동작
      onPressIn={() => setIsPressed(true)} // 눌렀을 때 배경색 변경
      onPressOut={() => setIsPressed(false)} // 뗐을 때 배경색 복원
      style={[
        styles.SignatureMenuView,
        isPressed && {backgroundColor: 'rgba(16, 190, 251, 0.1)'}, // 눌렸을 때 배경색
      ]}>
      <View style={styles.SignatureMenuTextsview}>
        <View style={styles.menuTitleRow}>
          {/* <Text style={styles.Signaturetitle}>{menu.menuName || '메뉴 이름'}</Text> */}
          <Text style={styles.Signaturetitle}>매운갈비찜</Text>
          {menu.isMain && <Text style={styles.mainMenu}>대표</Text>}
        </View>
        <Text
          style={styles.Signaturecontent}
          numberOfLines={3}
          ellipsizeMode="tail">
          {/* {menu.menuContent || '메뉴 설명'} */}
          시그니처 메뉴 매운갈비찜입니다, 맵기 조절 가능!
        </Text>
        <Text style={styles.Signatureprice}>{menu.price}원</Text>
      </View>
      <View style={styles.ImageContainer}>
        <Image
          source={
            menu.imgUrl ? {uri: menu.imgUrl} : require('../../assets/kim.png')
          }
          style={styles.Signatureimg}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  SignatureMenuView: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 20,
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
    alignItems: 'center',
    textAlign: 'center',
  },
  Signaturetitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  mainMenu: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 7,
    backgroundColor: 'rgba(16, 190, 251, 0.7)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  Signaturecontent: {
    paddingVertical: 5,
    width: '90%',
    fontSize: 13,
    color: '#999',
    fontWeight: '400',
    marginTop: 1,
  },
  Signatureprice: {
    marginTop: 5,
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default AlcoholItem;
