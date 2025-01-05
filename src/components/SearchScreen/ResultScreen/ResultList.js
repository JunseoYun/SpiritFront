import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ResultItem from './ResultItem';

const ResultList = ({ stores, navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.fastSearchModalScrollView}>
      {stores.map(store => (
        <ResultItem key={store.storeId} store={store} navigation={navigation} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fastSearchModalScrollView: {
    marginTop: 1,
    paddingBottom: 50,
  },
});

export default ResultList;