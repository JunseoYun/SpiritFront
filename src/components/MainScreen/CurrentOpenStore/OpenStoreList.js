import React from 'react';
import {ScrollView, StyleSheet, View, Text} from 'react-native';
import OpenStoreItem from './OpenStoreItem';

const OpenStoreList = ({stores}) => {
  return (
    <View>
      <View style={styles.todayPhrasesView}>
        <Text style={styles.mylocationlivetext}>현재 영업 중인 주점은?</Text>
        <Text style={styles.mylocationlivesubtext}>
          현재 위치에서 내 근처 영업 중인 주점을 알려드려요
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        {stores?.map((store, index) => (
          <View key={index} style={styles.storeContainer}>
            <OpenStoreItem store={store} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 10,
    alignItems: 'center', // 아이템 가운데 정렬
  },
  todayPhrasesView: {
    marginTop: 10,
    marginLeft: 25,
    marginBottom: 5,
  },
  mylocationlivetext: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
  },
  mylocationlivesubtext: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'gray',
    marginTop: 3,
  },
  storeContainer: {
    marginHorizontal: 3, // 아이템 간의 간격
  },
});

export default OpenStoreList;
