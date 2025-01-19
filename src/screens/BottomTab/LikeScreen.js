import React, {useEffect, useState} from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View, Text} from 'react-native';

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
        {stores ? (
          <>
            {stores?.map(store => (
              <LikedItem
                key={store.storeId}
                store={store}
                navigation={navigation}
              />
            ))}
          </>
        ) : (
          <View
            style={{
              alignItems: 'center',
            }}>
            <Text style={styles.Text}>찜한 가게가 없어요</Text>
          </View>
        )}
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
  Text: {
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default LikeScreen;
