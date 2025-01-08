import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { getByCategoryStore} from '../api/storeApi';

const CategoryTapScreen = ({ navigation, route }) => {
  const { categoryname, location } = route.params;
  const [stores, setStores] = useState([]);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchLocation = async () => {
        try {
          const data = await getByCategoryStore(categoryname, location);
          setStores(data);
        } catch (error) {
          console.error('데이터를 가져오는 중 오류 발생:', error);
          setError(error);
        }
      };
      fetchLocation();
    }, [categoryname]),
  );

  return (
    <ScrollView style={{backgroundColor: 'white'}}>
      {stores?.map(store => (
        <Pressable
          key={store.storeId}
          onPress={() =>
            navigation.navigate('StoreStack', {
              screen: 'StoreMainPage',
              params: {
                storeId: store.storeId,
                innerlatitude: location.latitude,
                innerlongitude: location.longitude,
              },
            })
          }>
          <View style={styles.StoreTopView}>
            <View style={styles.StoreView}>
              <Text style={styles.StoreTitle}>{store.storeName}</Text>
              <View style={styles.Storescore}>
                <FontAwesomeIcon name="star" size={20} color="#FCC104" />
                <Text style={styles.scoretext}>{store.storeRate}</Text>
                <Text style={styles.scoretext}>
                  고객리뷰 {store.reviewCount}
                </Text>
                <Text style={styles.scoretext}>찜 {store.storeLikeCount}</Text>
              </View>
              <View style={styles.Storetime}>
                <Ionicons name="time-outline" size={20} color="gray" />
                <Text style={styles.scoretext}>
                  영업중 {store.closeHour} 라스트 오더
                </Text>
              </View>
            </View>
            <View style={styles.line}></View>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  StoreTopView: {
    marginVertical: 15,
  },
  MenutopView: {
    marginHorizontal: 15,
    alignItems: 'center',
  },
  MenuImg: {
    width: 140,
    resizeMode: 'cover',
    height: 140,
    borderRadius: 20,
  },
  MenuTitle: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  MenuPrice: {
    marginTop: 3,
    fontWeight: '700',
    fontSize: 14,
  },
  StoreView: {
    marginHorizontal: 15,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  StoreTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'black',
  },
  Storescore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  Storetime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scoretext: {
    marginLeft: 4,
  },
  line: {
    marginTop: 15,
    width: '100%',
    height: 2,
    borderColor: 'lightgray',
    borderWidth: 1,
  },
});

export default CategoryTapScreen;
