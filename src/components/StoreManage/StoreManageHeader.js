import React from 'react';
import {Pressable, StyleSheet, Animated, Platform, Share} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useToast} from '../../context/ToastContext';
import {get_store_share} from '../../api/storeApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {HomeHeaderIcon} from '../../assets/svg/HomeTabIcon';
const StoreManageHeader = ({
  navigation,
  titleOpacity,
  title,
  storeId,
  onLayout,
}) => {
  const insets = useSafeAreaInsets();
  const parentNavigation = navigation.getParent(); // 상위 Stack 네비게이션
  const {showToast} = useToast();
  const onShare = async () => {
    try {
      const response = await get_store_share(storeId);
      if (!response?.shareLink) {
        showToast('공유할 링크를 가져오지 못했어요.');
        return;
      }

      await Share.share({
        message: `${title}에서 한잔 어때요?\n한잔할까에서 매장 정보를 확인하세요.\n\n${response.shareLink}`,
        shareLink: response.shareLink,
      });
    } catch (error) {
      showToast('공유 도중 문제가 발생했어요.');
      console.error('onShare error:', error.response);
    }
  };

  return (
    <Animated.View
      style={[
        styles.navigateView,
        {
          backgroundColor: '#fff',
          paddingTop: Platform.OS === 'android' ? insets.top + 10 : insets.top,
        },
      ]}
      onLayout={onLayout}>
      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
          marginRight: 10,
        }}>
        <Pressable onPress={() => navigation.goBack()} style={{marginRight: 8}}>
          <Animated.Text allowFontScaling={false} style={{color: '#333'}}>
            <Ionicons name="arrow-back-outline" size={25} />
          </Animated.Text>
        </Pressable>
        <Animated.View
          style={{
            flex: 1,
            opacity: titleOpacity, // ✅ 제목과 마커에 동일한 opacity 애니메이션
          }}>
          <Animated.Text
            allowFontScaling={false}
            style={styles.headerTitle}
            numberOfLines={1}>
            {title || '한잔할까'}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
      <Animated.View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Pressable onPress={() => onShare()}>
          <Animated.Text
            allowFontScaling={false}
            style={{color: '#333', marginRight: 10}}>
            <Ionicons name="share-outline" size={25} />
          </Animated.Text>
        </Pressable>

        <Pressable
          onPress={() =>
            navigation.reset({
              index: 1,
              routes: [{name: 'MainBtmbar'}],
            })
          }>
          <HomeHeaderIcon color="#333" />
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  navigateView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    zIndex: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  headerIconButton: {
    marginRight: 12,
  },
  imageStyle: {
    alignSelf: 'center',
    width: 20,
    height: 20,
    marginLeft: 3,
  },
});

export default StoreManageHeader;
