import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import NearStoreItem from './NearStoreItem';

const NearStoreList = ({stores, navigation}) => {
  return (
    <View>
      <View style={styles.storeTextView}>
        <Text style={styles.storeText}>제일 가까운 주점은?</Text>
        <Text style={styles.storeSubText}>
          현재 위치에서 가장 가까운 주점을 알려드려요
        </Text>
      </View>
      <View style={styles.storeView}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollViewContent}>
          {stores.map(store => (
            <NearStoreItem
              key={store.storeId}
              store={store}
              navigation={navigation}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storeTextView: {
    width: '100%',
    marginLeft: 20,
    marginTop: 10,
  },
  storeText: {
    marginTop: 10,
    fontSize: 17,
    color: 'black',
    fontWeight: 'bold',
  },
  storeSubText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'gray',
    marginTop: 7,
  },
  storeView: {
    marginTop: 1,
    width: '100%',
  },
  horizontalScrollViewContent: {
    paddingHorizontal: 20, // 필요에 따라 조정
  },
});

export default NearStoreList;
