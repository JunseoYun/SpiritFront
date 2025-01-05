import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import BestStoreItem from './BestStoreItem';

const BestStoreList = ({storeNames}) => {
  return (
    <View>
      <View style={styles.bestStoreTextView}>
        <Text style={styles.storeText}>주점 인기 순위</Text>
      </View>
      <View style={styles.bestStoreListContainer}>
        <View style={styles.bestStoreColumn}>
          {storeNames.slice(0, 5).map((name, index) => (
            <BestStoreItem
              key={index}
              rank={index + 1}
              name={name}
              isTopThree={index < 3}
            />
          ))}
        </View>
        <View style={styles.bestStoreColumn}>
          {storeNames.slice(5, 10).map((name, index) => (
            <BestStoreItem
              key={index + 5}
              rank={index + 6}
              name={name}
              isTopThree={false}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bestStoreTextView: {
    width: '100%',
    marginTop: 30,
  },
  storeText: {
    marginTop: 10,
    fontSize: 17,
    color: 'black',
    fontWeight: 'bold',
  },
  bestStoreListContainer: {
    flexDirection: 'row',
    width: '90%',
    marginLeft: 10,
  },
  bestStoreColumn: {
    width: '50%',
    marginTop: 5,
  },
});

export default BestStoreList;
