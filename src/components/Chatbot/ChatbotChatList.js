import React from 'react';
import {
  Animated,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {AIFullIcon} from '../../assets/svg/AiTabIcon';
import CustomText from '../../utils/CustomText';
import ChatbotResultCard from './ChatbotResultCard';

const ChatbotChatList = ({
  chatHistory,
  address,
  hasMessages,
  sending,
  spinAnim,
  scrollViewRef,
  handleMessageLayout,
  bottomPadding,
  navigation,
  userLocation,
  handleOpenMapWithAiResult,
  showTitle,
  showRecordingUI,
  titleAnim,
}) => {
  return (
    <View
      style={[
        styles.center,
        hasMessages ? styles.chatContainer : styles.emptyCenter,
      ]}>
      {hasMessages ? (
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          automaticallyAdjustKeyboardInsets={false}
          overScrollMode="always"
          scrollEventThrottle={16}
          style={styles.chatScroll}
          contentContainerStyle={[
            styles.chatContent,
            {paddingBottom: bottomPadding + 50},
          ]}>
          {chatHistory.map(message => {
            if (message.role === 'user') {
              return (
                <View
                  key={message.id}
                  style={styles.bubbleRow}
                  onLayout={({nativeEvent}) =>
                    handleMessageLayout(
                      message.id,
                      nativeEvent?.layout?.y ?? 0,
                    )
                  }>
                  <View style={styles.messageBubble}>
                    <CustomText style={styles.messageText}>
                      {message.text}
                    </CustomText>
                  </View>
                </View>
              );
            }

            const changedAddressText =
              typeof message.changedAddress === 'string' &&
              message.changedAddress.trim()
                ? message.changedAddress.trim()
                : '';
            const displayAddress = changedAddressText || address;

            return (
              <View
                key={message.id}
                style={styles.aiRow}
                onLayout={({nativeEvent}) =>
                  handleMessageLayout(message.id, nativeEvent?.layout?.y ?? 0)
                }>
                <View style={styles.aiHeaderRow}>
                  <View style={styles.aiAvatarLarge}>
                    <AIFullIcon size={26} />
                  </View>
                  {!!displayAddress && (
                    <CustomText style={styles.aiAddressText} numberOfLines={1}>
                      {displayAddress}
                    </CustomText>
                  )}
                </View>
                {!!message.text && (
                  <CustomText style={styles.aiTextBare}>{message.text}</CustomText>
                )}
                {message.agentMode === 'SHOW_RESULT' &&
                  Array.isArray(message.stores) &&
                  message.stores.length > 0 && (
                    <>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.resultList}>
                        {message.stores.map((store, index) => (
                          <ChatbotResultCard
                            key={`${message.id}-${store?.id ?? index}`}
                            store={store}
                            navigation={navigation}
                            userLocation={userLocation}
                            searchConditions={message.searchConditions}
                          />
                        ))}
                      </ScrollView>
                      <LinearGradient
                        colors={['#3CBBFF', '#30D4F9', '#9A6CFF']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={[styles.chipBorder, styles.mapChipBorder]}>
                        <Pressable
                          style={[styles.chip, styles.mapChip]}
                          onPress={() =>
                            handleOpenMapWithAiResult(
                              message.stores,
                              message.searchConditions,
                              message.userPrompt,
                            )
                          }>
                          <CustomText style={styles.chipKeyword}>
                            지도에서 확인하기
                          </CustomText>
                        </Pressable>
                      </LinearGradient>
                    </>
                  )}
              </View>
            );
          })}
          {sending && (
            <View style={styles.aiRow}>
              <View style={styles.aiHeaderRow}>
                <View style={styles.aiAvatarLarge}>
                  <Animated.View
                    style={[
                      styles.aiLoadingSpinner,
                      {
                        transform: [
                          {
                            rotate: spinAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            }),
                          },
                        ],
                      },
                    ]}>
                    <AIFullIcon size={26} />
                  </Animated.View>
                </View>
                <CustomText style={styles.aiAddressText}>탐색 중</CustomText>
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.emptyTouchArea}>
            {showTitle && !showRecordingUI && (
              <Animated.View
                style={[
                  styles.titleWrap,
                  {
                    opacity: titleAnim,
                  },
                ]}>
                <CustomText style={styles.title}>
                  오늘은 어디서 한잔할까요?
                </CustomText>
              </Animated.View>
            )}
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTouchArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
    paddingTop: 16,
  },
  chatContent: {
    flexGrow: 1,
  },
  bubbleRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 18,
  },
  messageBubble: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderBottomRightRadius: 0,
    maxWidth: '85%',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
    lineHeight: 16 * 1.4,
  },
  aiRow: {
    marginTop: 20,
    marginBottom: 18,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiAvatarLarge: {
    paddingLeft: 18,
    marginRight: 8,
  },
  aiAddressText: {
    flexShrink: 1,
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Regular',
    maxWidth: '70%',
  },
  aiTextBare: {
    fontSize: 16,
    lineHeight: 16 * 1.5,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
    marginBottom: 6,
    marginRight: 40,
    paddingLeft: 18,
  },
  resultList: {
    paddingVertical: 12,
    paddingRight: 6,
    paddingHorizontal: 18,
    gap: 4,
  },
  mapChipBorder: {
    alignSelf: 'center',
    marginTop: 10,
    marginHorizontal: 18,
    borderRadius: 999,
    marginBottom: 20,
  },
  mapChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
  },
  chipBorder: {
    marginHorizontal: 6,
    borderRadius: 16,
  },
  chip: {
    borderRadius: 14.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    margin: 1.5,
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipKeyword: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    lineHeight: 15 * 1.3,
    letterSpacing: 0,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    textAlign: 'center',
    marginBottom: 50,
  },
  titleWrap: {
    width: '100%',
    alignItems: 'center',
  },
  aiLoadingSpinner: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatbotChatList;
