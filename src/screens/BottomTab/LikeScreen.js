import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet} from 'react-native';

import LikedItem from '../../components/LikedScreen/LikedItem';
import {get_liked_store} from '../../api/storeApi';
const LikeScreen = ({navigation}) => {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const storesData = await get_liked_store();
        setStores(storesData);
      } catch (error) {}
    };
    fetchStores();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ScrollView}>
        {stores.map(store => (
          <LikedItem
            key={store.storeId}
            store={store}
            navigation={navigation}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  ScrollView: {
    marginTop: 10,
    paddingBottom: 30,
  },
});

export default LikeScreen;
