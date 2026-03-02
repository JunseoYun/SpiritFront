import React from 'react';
import {Platform, Pressable, StyleSheet, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RotateCwIcon} from 'lucide-react-native';
import MenuIcon from '../../assets/svg/MenuIcon';

const ChatbotHeader = ({
  insets,
  sending,
  onOpenDrawer,
  onNavigateLocation,
  onResetChat,
  onGoBack,
}) => {
  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top + (Platform.OS === 'android' ? 20 : 10)},
      ]}>
      <Pressable
        onPress={onGoBack}
        hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
        <Ionicons name="arrow-back-outline" size={24} color="#333" />
      </Pressable>
      <View style={styles.headerActions}>
        <Pressable
          onPress={onNavigateLocation}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Feather name="crosshair" size={22} color="#333" />
        </Pressable>
        <Pressable
          onPress={() => {
            if (sending) {
              return;
            }
            onResetChat();
          }}
          disabled={sending}
          style={{marginLeft: 12, opacity: sending ? 0.35 : 1}}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <RotateCwIcon size={22} color="#333" />
        </Pressable>
        <Pressable
          onPress={onOpenDrawer}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={{marginLeft: 12}}>
          <MenuIcon size={10} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ChatbotHeader;
