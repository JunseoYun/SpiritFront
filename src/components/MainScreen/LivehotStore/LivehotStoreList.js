import React from 'react';
import {ScrollView, StyleSheet, View, Text} from 'react-native';
import LivehotStoreItem from './LivehotStoreItem';

const LivehotStoreList = ({stores}) => {
  return (
    <View>
      <View style={styles.todayPhrasesView}>
        <Text style={styles.mylocationlivetext}>핫플레이스</Text>
        <Text style={styles.mylocationlivesubtext}>지금 여기가 핫플</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        {stores.map((store, index) => (
          <View key={store.storeId}>
            <LivehotStoreItem store={store} />
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
});

export default LivehotStoreList;
