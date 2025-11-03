import React, {useState, useEffect, useRef} from 'react';
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
import FastImage from 'react-native-fast-image';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('window');

const IMAGE_WIDTH = width - 120;
const IMAGE_HEIGHT = (IMAGE_WIDTH * 3) / 4;
const {width: SCREEN_WIDTH} = Dimensions.get('window');
const MAX_WIDTH = SCREEN_WIDTH - 100; // ImageReorderScreen width alignment

const DraggableImageItem = ({
  item,
  index,
  isActive,
  drag,
  toggleBoardTypeImage,
  // removeServerImage,
  removeLocalImage,
  checkDelete,
  selectedForDelete,
  setSelectedForDelete,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const DISPLAY_MAX_HEIGHT = 320; // ?�래�??�의�??�한 최�? 미리보기 ?�이
  const [imageHeight, setImageHeight] = useState(DISPLAY_MAX_HEIGHT);

  useEffect(() => {
    const uri = item.isNew ? item.path : item.url;

    Image.getSize(
      uri,
      (w, h) => {
        const ratio = h / w;
        const naturalHeight = MAX_WIDTH * ratio;
        // ?�무 �??��?지??미리보기?�서 ?�이�??�한?�여 ?�래�??�이??개선
        setImageHeight(Math.min(naturalHeight, DISPLAY_MAX_HEIGHT));
      },
      error => {
        console.warn('Failed to get image size:', error);
        setImageHeight(DISPLAY_MAX_HEIGHT);
      },
    );
  }, [item, checkDelete]);

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
      <Pressable
        // Drag is triggered only from the handle icon (outside image)
        onLongPress={undefined}
        style={styles.imageWrapper}>
        <FastImage
          // ?�이�??�한?�으므�?채우?�록 cover ?�용 (?�로�?�??��?지?????�단 ?��?가 ?�릴 ???�음)
          resizeMode={FastImage.resizeMode.cover}
          source={{uri: item.isNew ? item.path : item.url}}
          style={[
            {
              width: MAX_WIDTH,
              height: imageHeight,
              borderRadius: 12,
            },
            checkDelete && {
              width: MAX_WIDTH,
              height: imageHeight,
            },
          ]}>
          {checkDelete ? (
            <TouchableOpacity
              onPress={() => {
                const id = item.isNew ? item.localId : item.id;
                const isSelected = selectedForDelete.includes(id);
                if (isSelected) {
                  setSelectedForDelete(selectedForDelete.filter(i => i !== id));
                } else {
                  setSelectedForDelete([...selectedForDelete, id]);
                }
              }}
              hitSlop={15}
              style={[styles.removeButton, styles.shadowEffect]}>
              <MaterialIcons
                name={
                  selectedForDelete.includes(
                    item.isNew ? item.localId : item.id,
                  )
                    ? 'check-circle'
                    : 'radio-button-unchecked'
                }
                size={28}
                color={
                  selectedForDelete.includes(
                    item.isNew ? item.localId : item.id,
                  )
                    ? '#3CBBFF'
                    : '#aaa'
                }
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => removeLocalImage(item)}
              style={[styles.removeButton, styles.shadowEffect]}>
              <Ionicons name="trash-outline" size={30} color="#999" />
            </TouchableOpacity>
          )}
        </FastImage>

        <View style={styles.buttonGroup}>
          {checkDelete ? (
            // ??�� 모드?????�택??boardType 버튼�?보여�?
            <Pressable
              style={[styles.menuTypeButton, {backgroundColor: '#E9F5FB'}]}
              disabled // ??�� 모드?�선 비활?�화
            >
              <Text style={[styles.menuTypeText, {color: '#3CBBFF'}]}>
                {item.boardType === 'MENU' ? '메뉴' : '주류'}
              </Text>
            </Pressable>
          ) : (
            // ?�소??????보여�?
            <>
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
            </>
          )}
        </View>
      </Pressable>

      {!checkDelete && (
        <Pressable
          onLongPress={drag}
          delayLongPress={100}
          hitSlop={10}
          style={styles.dragIcon}>
          <Ionicons name="reorder-three-outline" size={30} color="#999" />
        </Pressable>
      )}
      {/* {!checkDelete && (
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

          <Pressable delayLongPress={100} hitSlop={10} style={styles.dragIcon}>
            <Ionicons name="reorder-three-outline" size={30} color="#999" />
          </Pressable>
        </View>
      )} */}
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
  buttonGroup: {
    flexDirection: 'row',
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 8, // RN 0.71 ?�상�???
  },

  menuTypeButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  menuTypeText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
  },

  selectedButton: {
    backgroundColor: '#D6F3FF',
  },

  selectedText: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
  },

  removeButton: {
    position: 'absolute',
    top: 7,
    right: 7,
  },
  dragIcon: {
    marginLeft: 10,
  },
});

export default DraggableImageItem;
