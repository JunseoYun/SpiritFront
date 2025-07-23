import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const ResultitemCustom = ({data}) => {
  return (
    <View style={styles.legendContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.colorBox, {backgroundColor: item.color}]} />
          <Text style={styles.legendText}>{item.name}</Text>
          {item.percent && (
            <Text style={styles.legendText}>{item.percent}</Text>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  legendContainer: {
    width: '100%',
    marginTop: 12,
    flexDirection: 'column', // 세로 나열
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorBox: {
    width: 16,
    height: 16,
    marginRight: 8,
    borderRadius: 3,
  },
  legendText: {
    marginLeft: 10,
    fontSize: 18,
    color: '#333',
  },
});

export default ResultitemCustom;
