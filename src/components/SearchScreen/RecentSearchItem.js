// components/SearchScreen/RecentSearchItem.js
import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SearchIcon} from 'lucide-react-native';
import CustomText from '../common/CustomText';

const RecentSearchItem = ({item, onPress, onDelete}) => {
  return (
    <Pressable style={styles.recentItem} onPress={() => onPress(item)}>
      <View style={styles.recentLeft}>
        <View style={styles.iconWrap}>
          <FontAwesome name="search" color="#6A6A6A" size={15} />
        </View>

        <View style={styles.textRow}>
          <CustomText
            style={styles.recentText}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item}
          </CustomText>

          <Pressable hitSlop={10} onPress={() => onDelete(item)}>
            <Ionicons name="close" size={20} color="#595959" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
  },
  iconWrap: {
    backgroundColor: '#F7F7F7',
    // paddingHorizontal: 8,
    // paddingVertical: 7,
    width: 32,
    height: 32,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  recentText: {
    color: '#111',
    fontSize: 17,
    fontFamily: 'Pretendard-Regular',
    marginLeft: 5,
    flex: 1,
    maxWidth: '90%',
  },
});

export default RecentSearchItem;
