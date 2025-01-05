import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const BestStoreItem = ({rank, name, isTopThree}) => {
  return (
    <View style={styles.bestStoreItem}>
      <Text
        style={
          isTopThree ? styles.bestStoreTopNumText : styles.bestStoreNumText
        }>
        {rank}
      </Text>
      <Text style={isTopThree ? styles.bestStoreTopText : styles.bestStoreText}>
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bestStoreItem: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bestStoreTopNumText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#16BBFF',
    width: '15%',
  },
  bestStoreTopText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#16BBFF',
  },
  bestStoreNumText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'black',
    width: '15%',
  },
  bestStoreText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: 'black',
  },
});

export default BestStoreItem;
