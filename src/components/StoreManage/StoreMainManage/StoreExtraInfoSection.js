import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import CustomText from '../../../utils/CustomText';

const StoreExtraInfoSection = ({title, items = []}) => {
  return (
    <>
      <View style={styles.divider} />
      <CustomText style={styles.label}>{title}</CustomText>
      <View style={styles.card}>
        {items.map((item, index) => (
          <View
            key={item.key}
            style={[styles.row, index !== 0 && styles.rowDivider]}>
            <CustomText maxScale={1.3} style={styles.rowLabel}>
              {item.label}
            </CustomText>
            <View style={styles.valueWrapper}>
              {item.values.length > 0 ? (
                <View style={styles.pillContainer}>
                  {item.values.map((value, valueIndex) => (
                    <View
                      key={`${item.key}-${value}-${valueIndex}`}
                      style={styles.pill}>
                      <CustomText style={styles.pillText}>{value}</CustomText>
                    </View>
                  ))}
                </View>
              ) : (
                <CustomText style={[styles.valueText, styles.valueEmpty]}>
                  {item.placeholder}
                </CustomText>
              )}
            </View>
          </View>
        ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: '#EFEFEF',
    height: 1,
    marginHorizontal: 16,
    marginVertical: 30,
  },
  label: {
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    fontSize: 18,
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F2F4F6',
  },
  rowLabel: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#7D8695',
    fontSize: 14,
    width: 70,
  },
  valueWrapper: {
    flex: 1,
    marginLeft: 20,
  },
  valueText: {
    fontFamily: 'Pretendard-Medium',
    color: '#222',
    fontSize: 15,
    textAlign: 'left',
    marginLeft: 10,
  },
  valueEmpty: {
    color: '#B5BDC7',
    fontFamily: 'Pretendard-Regular',
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EEF1F4',
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
    marginBottom: 8,
  },
  pillText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#4A4F59',
  },
});

export default StoreExtraInfoSection;
