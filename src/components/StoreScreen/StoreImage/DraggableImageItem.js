import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');
const IMAGE_WIDTH = width - 120;
const IMAGE_HEIGHT = (IMAGE_WIDTH * 3) / 4;

const DraggableImageItem = ({
  item,
  index,
  isActive,
  drag,
  toggleBoardTypeImage,
  // removeServerImage,
  removeLocalImage,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.03,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  return (
    <Animated.View
      style={[
        styles.itemWrapper,
        {
          transform: [{scale: scaleAnim}],
          opacity: opacityAnim,
        },
      ]}>
      <View style={styles.imageWrapper}>
        <Image
          source={{uri: item.isNew ? item.path : item.url}}
          style={styles.image}
        />

        <View style={styles.buttonGroup}>
          <Pressable
            style={[
              styles.menuTypeButton,
              item.boardType === 'MENU' && styles.selectedButton,
            ]}
            onPress={() => toggleBoardTypeImage(item, 'MENU')}>
            <Text
              style={[
                styles.menuTypeText,
                item.boardType === 'MENU' && styles.selectedText,
              ]}>
              메뉴
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.menuTypeButton,
              item.boardType === 'DRINK' && styles.selectedButton,
            ]}
            onPress={() => toggleBoardTypeImage(item, 'DRINK')}>
            <Text
              style={[
                styles.menuTypeText,
                item.boardType === 'DRINK' && styles.selectedText,
              ]}>
              주류
            </Text>
          </Pressable>
        </View>
      </View>
      <View
        style={{
          marginLeft: 10,
          justifyContent: 'center',
          height: IMAGE_HEIGHT - 20,
        }}>
        <TouchableOpacity
          onPress={() => removeLocalImage(item)}
          style={[styles.removeButton, styles.shadowEffect]}>
          <Ionicons name="trash-outline" size={30} color="#999" />
        </TouchableOpacity>
        <Pressable
          onLongPress={drag}
          delayLongPress={100}
          hitSlop={10}
          style={styles.dragIcon}>
          <Ionicons name="reorder-three-outline" size={30} color="#999" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 10,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: IMAGE_WIDTH + 20,
    height: IMAGE_HEIGHT - 20,
    borderRadius: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 8, // RN 0.71 이상만 동
  },

  menuTypeButton: {
    backgroundColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  menuTypeText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: 'black',
  },

  selectedButton: {
    backgroundColor: '#45C9FF',
  },

  selectedText: {
    color: '#fff',
  },

  shadowEffect: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  dragIcon: {},
  removeButton: {
    position: 'absolute',
    top: 7,
  },
});

export default DraggableImageItem;
