import React from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import CustomText from '../../../utils/CustomText';

const UserSortSummary = ({isCompletedTab, filtered, sortDesc, setSortDesc}) => {
  if (!isCompletedTab) return null;
  const count = filtered.length;

  return (
    <View style={styles.summaryRow}>
      <CustomText style={styles.summaryText}>{`총 ${count}건`}</CustomText>

      <Pressable
        style={styles.sortRow}
        onPress={() => setSortDesc(v => !v)}
        hitSlop={8}>
        <CustomText style={styles.sortLabel}>방문일자</CustomText>
        <FontAwesome5
          name={sortDesc ? 'long-arrow-alt-down' : 'long-arrow-alt-up'}
          size={14}
          color={sortDesc ? '#1a1a1a' : '#1a1a1a'}
          style={{marginLeft: 4}}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 15,
    color: 'black',
    fontFamily: 'Pretendard-SemiBold',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default UserSortSummary;
