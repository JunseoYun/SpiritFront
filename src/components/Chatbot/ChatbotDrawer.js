import React from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {RotateCwIcon} from 'lucide-react-native';
import CustomText from '../../utils/CustomText';

const ChatbotDrawer = ({
  showDrawer,
  overlayAnim,
  drawerAnim,
  drawerWidth,
  overlayPanHandlers,
  insets,
  address,
  sending,
  onClose,
  onResetChat,
  onNavigateLocation,
  recentFirstPrompts,
  onClearRecentFirstPrompts,
  onRemoveRecentFirstPrompt,
  onSelectPrompt,
}) => {
  const promptList = Array.isArray(recentFirstPrompts)
    ? recentFirstPrompts
    : [];

  if (!showDrawer) {
    return null;
  }

  return (
    <View style={styles.drawerLayer} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.drawerOverlay,
          {
            opacity: overlayAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.35],
            }),
          },
        ]}
        {...overlayPanHandlers}>
        <Pressable style={styles.overlayPressArea} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            width: drawerWidth,
            paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 10),
            transform: [{translateX: drawerAnim}],
          },
        ]}
        {...overlayPanHandlers}>
        <View style={styles.drawerHeader}>
          <CustomText style={styles.sheetTitle}>탐색</CustomText>
          <Pressable onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color="#333" />
          </Pressable>
        </View>
        <ScrollView
          style={styles.drawerScroll}
          contentContainerStyle={[
            styles.drawerScrollContent,
            {paddingBottom: insets.bottom + 10},
          ]}>
          <View style={styles.drawerSection}>
            <Pressable style={styles.drawerCard} onPress={onNavigateLocation}>
              <Feather name="crosshair" size={18} color="#333" />
              <CustomText style={styles.drawerAddressText} numberOfLines={1}>
                {address || '설정된 주소가 없어요'}
              </CustomText>
              <Ionicons name="chevron-forward" size={18} color="#666" />
            </Pressable>
          </View>

          <View style={styles.drawerSection}>
            <Pressable
              style={[styles.drawerButton, sending && styles.drawerButtonDisabled]}
              disabled={sending}
              onPress={() => {
                if (sending) {
                  return;
                }
                onResetChat();
                onClose();
              }}>
              <RotateCwIcon size={18} color={sending ? '#aaa' : '#333'} />
              <CustomText
                style={[
                  styles.drawerButtonText,
                  sending && styles.drawerButtonTextDisabled,
                ]}>
                새 대화 시작
              </CustomText>
            </Pressable>
          </View>

          <View style={styles.sheetSubtitleRow}>
            <CustomText style={styles.sheetSubtitle}>최근 질문</CustomText>
            <Pressable
              onPress={onClearRecentFirstPrompts}
              hitSlop={10}
              style={styles.sheetSubtitleAction}>
              <CustomText style={styles.sheetSubtitleActionText}>
                전체 삭제
              </CustomText>
            </Pressable>
          </View>
          <View style={styles.sheetContent}>
            {promptList.length
              ? promptList.map((item, idx) => (
                  <View
                    key={`${item}-${idx}`}
                    style={[
                      styles.sheetPromptRow,
                      idx > 0 && styles.sheetPromptSpacing,
                    ]}>
                    <Pressable
                      hitSlop={5}
                      style={styles.sheetPromptPress}
                      onPress={() => onSelectPrompt(item)}>
                      <CustomText style={styles.sheetPromptText} numberOfLines={1}>
                        {item}
                      </CustomText>
                    </Pressable>
                    <Pressable
                      onPress={() => onRemoveRecentFirstPrompt(idx)}
                      hitSlop={10}>
                      <Ionicons name="close" size={16} color="#666" />
                    </Pressable>
                  </View>
                ))
              : null}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 20,
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  overlayPressArea: {
    flex: 1,
  },
  drawerContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginHorizontal: 18,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  drawerSection: {
    marginTop: 12,
    justifyContent: 'center',
  },
  drawerScroll: {
    flex: 1,
    paddingHorizontal: 18,
  },
  drawerScrollContent: {
    paddingBottom: 10,
  },
  drawerCard: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerAddressText: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    lineHeight: 15 * 1.35,
  },
  drawerButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerButtonDisabled: {
    opacity: 0.5,
  },
  drawerButtonText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  drawerButtonTextDisabled: {
    color: '#999',
  },
  sheetSubtitleRow: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  sheetSubtitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  sheetSubtitleAction: {
    paddingHorizontal: 4,
  },
  sheetSubtitleActionText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#666',
  },
  sheetContent: {
    marginTop: 20,
    flex: 1,
  },
  sheetPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetPromptText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    lineHeight: 15 * 1.45,
    flex: 1,
    minWidth: 0,
  },
  sheetPromptPress: {
    flex: 1,
  },
  sheetPromptSpacing: {
    marginTop: 20,
  },
});

export default ChatbotDrawer;
