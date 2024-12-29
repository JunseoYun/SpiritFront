import React from 'react';
import {ScrollView, StyleSheet, View, Text} from 'react-native';
import RecentStoreItem from './RecentStoreItem';

const RecentStoreList = ({stores}) => {
  return (
    <View>
      <View style={styles.todayPhrasesView}>
        <Text style={styles.mylocationlivetext}>최근 방문한 장소</Text>
        <Text style={styles.mylocationlivesubtext}>
          다시 방문하고 싶은 장소를 확인해보세요
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        {stores.map((store, index) => (
          <RecentStoreItem key={index} store={store} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 10,
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

export default RecentStoreList;
