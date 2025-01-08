import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, SafeAreaView, Pressable, ImageBackground } from 'react-native';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { getByCategoryStore } from '../../api/storeApi';
import Categorystyles from './CategoryTapStyles';

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

    <ScrollView style={{ backgroundColor: 'white' }}>
      <View style={Categorystyles.container}>
        {stores?.map(store => (
          <Pressable
            key={store.storeId}
            style={Categorystyles.itemContainer}
          >
            <View style={Categorystyles.menuView}>
              <View style={Categorystyles.menuItemView}>
                <ImageBackground
                  source={require('../../assets/MainPagetodayimg.png')}
                  style={Categorystyles.storeImg}
                  imageStyle={{ borderRadius: 10 }}
                >
                  <Text style={Categorystyles.mainMenu}>대표</Text>
                </ImageBackground>
                <Text style={Categorystyles.menuName}>매운갈비찜</Text>
                <Text style={Categorystyles.menuPrice}>43,900원</Text>
              </View>
              <View style={Categorystyles.menuItemView}>
                <Image
                  source={require('../../assets/MainPagetodayimg.png')}
                  style={Categorystyles.storeImg}
                />
                <Text style={Categorystyles.menuName}>벽돌 계란말이</Text>
                <Text style={Categorystyles.menuPrice}>11,000원</Text>
              </View>
              <View style={Categorystyles.menuItemView}>
                <Image
                  source={require('../../assets/MainPagetodayimg.png')}
                  style={Categorystyles.storeImg}
                />
                <Text style={Categorystyles.menuName}>세트메뉴</Text>
                <Text style={Categorystyles.menuPrice}>57,000원</Text>
              </View>


            </View>
            <View style={Categorystyles.infoTopView}>
              <View style={Categorystyles.infoTitleView}>
                <Text style={Categorystyles.storeName}>친구포차</Text>
                <Text style={Categorystyles.alcoholText}>소주 5000원 · 맥주 5000원</Text>
              </View>
              <View style={Categorystyles.infoView}>
                <FontAwesomeIcon name="star" size={15} color="#FCC104" />
                <Text style={Categorystyles.infoText}> 4.2</Text>
                <Text style={Categorystyles.infoText}> · 고객리뷰 1,236</Text>
                <Text style={Categorystyles.infoText}> · 찜 367</Text>
              </View>
              <View style={Categorystyles.infoView}>

                <Ionicons name="time-outline" size={15} color="#333" />
                <Text style={Categorystyles.infoText}> 영업 중 · 01:00 마감</Text>


              </View>

            </View>



          </Pressable>
        ))}
      </View>
    </ScrollView>

  );
};




export default CategoryTapScreen;
