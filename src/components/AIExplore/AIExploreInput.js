import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';
import ColorUtil from '../../utils/ColorUtil';
import AIMicIcon from '../../assets/svg/AIMicIcon';

const AIExploreInput = ({
  showRecordingUI,
  bottomOverlayHeight,
  onInputLayout,
  prompt,
  onChangePrompt,
  onFocusInput,
  onBlurInput,
  showSendButton,
  showMicButton,
  onSendPress,
  onMicPress,
  onStopPress,
  isRecording,
  isTranscribing,
  sending,
  waveformWidth,
  waveformTravel,
  waveformBars,
  recordShiftAnim,
  volumeLevel,
  inputRef,
}) => {
  return (
    <View style={styles.bottomInputContainer} pointerEvents="box-none">
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(255,255,255,0)',
          'rgba(255,255,255,0.2)',
          'rgba(255,255,255,0.9)',
        ]}
        locations={[0.1, 0.45, 1]}
        style={[
          styles.bottomGradient,
          {
            height: bottomOverlayHeight,
          },
        ]}
      />
      <View
        style={[styles.bottomInput]}
        onLayout={({nativeEvent}) =>
          onInputLayout(nativeEvent?.layout?.height ?? 0)
        }>
        <View
          style={[styles.inputBox, showRecordingUI && styles.recordingContainer]}>
          {showRecordingUI ? (
            <>
              <Pressable style={styles.stopButton} onPress={onStopPress} hitSlop={10}>
                <Ionicons name="stop" size={18} color="#f2f2f2" />
              </Pressable>
              <View style={styles.recordingBox}>
                {isRecording ? (
                  <View style={styles.recordingWaveWindow}>
                    <Animated.View
                      style={[
                        styles.recordingWaveTrack,
                        {
                          width: waveformWidth,
                          transform: [
                            {
                              translateX: recordShiftAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -waveformTravel],
                              }),
                            },
                          ],
                        },
                      ]}>
                      {waveformBars.map(({idx, seed}) => {
                        const silentScale = 0.25;
                        const dynamicScale = 1 + seed * 1.2;
                        const maxScale = 1.6 + seed * 1.2;
                        const scale = volumeLevel.interpolate({
                          inputRange: [0, 0.2, 1, 3],
                          outputRange: [
                            silentScale,
                            silentScale,
                            dynamicScale,
                            maxScale,
                          ],
                          extrapolate: 'clamp',
                        });
                        const opacity = volumeLevel.interpolate({
                          inputRange: [0, 0.2, 1, 3],
                          outputRange: [0.2, 0.3, 0.9, 1],
                          extrapolate: 'clamp',
                        });
                        return (
                          <Animated.View
                            key={`bar-${idx}`}
                            style={[
                              styles.recordingWaveBar,
                              {transform: [{scaleY: scale}], opacity},
                            ]}
                          />
                        );
                      })}
                    </Animated.View>
                  </View>
                ) : (
                  <View style={styles.recordingLabelRow}>
                    <ActivityIndicator
                      style={styles.recordingSpinner}
                      size="small"
                      color="#9AA0A6"
                    />
                    <CustomText style={styles.recordingLabel}>받아쓰는 중</CustomText>
                  </View>
                )}
              </View>
              <View style={[styles.trailingAction, styles.sendAlign]}>
                <Pressable
                  style={[
                    styles.sendButton,
                    styles.sendButtonActive,
                    (sending || isTranscribing) && styles.sendButtonDisabled,
                  ]}
                  onPress={onSendPress}
                  disabled={sending || isTranscribing}>
                  <Ionicons
                    name="arrow-up"
                    size={20}
                    color={sending || isTranscribing ? '#aaa' : '#111'}
                  />
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <CustomTextInput
                ref={inputRef}
                placeholder="가고 싶은 술집을 설명해주세요"
                value={prompt}
                onChangeText={onChangePrompt}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={ColorUtil.placeholderText}
                style={styles.input}
                onFocus={onFocusInput}
                onBlur={onBlurInput}
              />
              <View
                style={[
                  styles.trailingAction,
                  showSendButton ? styles.sendAlign : styles.micAlign,
                ]}>
                {showSendButton ? (
                  <Pressable style={styles.sendButton} onPress={onSendPress}>
                    <Ionicons name="arrow-up" size={20} color="#333" />
                  </Pressable>
                ) : showMicButton ? (
                  <Pressable style={styles.micButton} onPress={onMicPress} hitSlop={10}>
                    <AIMicIcon size={22} />
                  </Pressable>
                ) : (
                  <View style={styles.sendButtonPlaceholder} />
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomInputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomInput: {
    flexDirection: 'row',
    marginHorizontal: 18,
    alignItems: 'center',
    paddingBottom: 20,
  },
  inputBox: {
    flex: 1,
    minHeight: 28,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingContainer: {
    backgroundColor: '#fff',
    borderColor: '#e5e5e5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
    ...Platform.select({
      ios: {
        paddingVertical: 12,
      },
    }),
    marginLeft: 6,
    maxHeight: 80,
  },
  trailingAction: {
    marginLeft: 10,
    marginRight: 4,
  },
  sendAlign: {
    alignSelf: 'flex-end',
    paddingBottom: 6,
    marginRight: -4,
  },
  micAlign: {
    alignSelf: 'center',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#f5f5f5',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPlaceholder: {
    width: 32,
    height: 32,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    marginRight: 8,
    marginLeft: -4,
  },
  recordingBox: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingWaveWindow: {
    height: 20,
    overflow: 'hidden',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingWaveTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingWaveBar: {
    width: 3,
    height: 8,
    marginHorizontal: 0.8,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  recordingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  recordingLabel: {
    marginLeft: 7,
    color: '#9AA0A6',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
  recordingSpinner: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{scale: 0.8}],
  },
  micButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AIExploreInput;
