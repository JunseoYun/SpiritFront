import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  PanGestureHandler,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import MenuModal from './MenuModal';

const MenuItem = ({
  menu,
  isOpen,
  onOpen,
  onClose,
  onEdit,
  onDelete,
  scrollViewRef,
}) => {
  const translateX = useSharedValue(0); // 스와이프 애니메이션 값
  const [isModalVisible, setIsModalVisible] = useState(false); // 수정 모달 상태

  // Animated 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const BUTTON_WIDTH = 150; // 수정+삭제 버튼의 총 너비
  const SWIPE_THRESHOLD = BUTTON_WIDTH * 0.3; // ✅ 버튼 크기의 30% 이상 스와이프해야 활성화

  const handleGestureEvent = event => {
    const translationX = event.nativeEvent.translationX;
    if (translationX < 0) {
      translateX.value = Math.max(translationX / 2, -BUTTON_WIDTH); // ✅ 속도를 줄이기 위해 4로 나눔
    }
  };

  const handleGestureEnd = event => {
    const {translationX, velocityX} = event.nativeEvent;

    if (velocityX < -800 || translationX < -SWIPE_THRESHOLD * 2) {
      // ✅ 속도가 너무 빠를 때도 열린 상태 유지
      translateX.value = withSpring(-BUTTON_WIDTH, {
        damping: 15,
        stiffness: 150,
      });
      onOpen();
    } else {
      translateX.value = withSpring(0, {damping: 15, stiffness: 150});
      onClose();
    }
  };

  // 열려 있는 상태 변경
  useEffect(() => {
    if (!isOpen) {
      translateX.value = withSpring(0);
    }
  }, [isOpen]);

  const handleUpdate = () => {
    setIsModalVisible(true);
    onClose();
  };

  return (
    <Pressable style={styles.container} onPress={onClose}>
      {/* 삭제/수정 버튼 */}
      <View style={[styles.actionsContainer, {width: BUTTON_WIDTH}]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={handleUpdate}>
          <Text style={styles.actionText}>수정</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(menu.id, menu.name)}>
          <Text style={styles.actionText}>삭제</Text>
        </TouchableOpacity>
      </View>

      {/* 메뉴 아이템 */}
      <GestureHandlerRootView>
        <PanGestureHandler
          simultaneousHandlers={scrollViewRef}
          onGestureEvent={handleGestureEvent}
          onEnded={handleGestureEnd}
          activeOffsetX={[-20, 20]} // ✅ 너무 작은 움직임을 무시
        >
          <Animated.View style={[styles.menuContainer, animatedStyle]}>
            {/* 메뉴 컨텐츠 */}
            <View style={styles.SignatureMenuTextsview}>
              <View>
                <View style={styles.menuTitleRow}>
                  <Text style={styles.Signaturetitle}>{menu?.name}</Text>
                  {menu?.isMain && <Text style={styles.mainMenu}>대표</Text>}
                </View>
                <Text
                  style={styles.Signaturecontent}
                  numberOfLines={3}
                  ellipsizeMode="tail">
                  {menu?.description}
                </Text>
              </View>
              <Text style={styles.Signatureprice}>
                {menu?.price.toLocaleString()}원
              </Text>
            </View>
            {menu?.imgUrl && (
              <View style={styles.ImageContainer}>
                <Image
                  source={{uri: menu?.imgUrl}}
                  style={styles.Signatureimg}
                />
              </View>
            )}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
      {/* 수정 모달 */}
      <MenuModal
        isModalVisible={isModalVisible}
        onPressModalClose={() => {
          setIsModalVisible(false);
          onClose();
        }}
        menuData={menu}
        onUpdate={onEdit}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  editButton: {
    backgroundColor: '#16BBFF',
  },
  deleteButton: {
    backgroundColor: '#FF4D4D',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#E7E7E7',
    backgroundColor: '#fff',
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
    justifyContent: 'space-between',
  },
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Signaturetitle: {
    fontSize: 18,
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
    fontSize: 15,
  },
  Signatureprice: {
    marginTop: 5,
    fontSize: 15,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default MenuItem;
