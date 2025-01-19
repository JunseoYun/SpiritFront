import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {ReviewStoreGet} from '../../api/reviewApi';
import {ScrollView} from 'react-native-gesture-handler';

const StoreReviewScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId} = route.params;
  const [reviewdata, setReviewdata] = useState([]);

  const getReviewData = async () => {
    try {
      const reviewData = await ReviewStoreGet(storeId);
      setReviewdata(reviewData);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getReviewData();
    }, [storeId]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.MenuaddView}>
        <Pressable
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('ReviewAddScreen', {storeId: storeId})
          }>
          <Text style={styles.addButtonText}>리뷰 작성하기</Text>
        </Pressable>
      </View>

      {reviewdata.map(item => (
        <View key={item.reviewId} style={styles.reviewContainer}>
          <View style={styles.reviewHeader}>
            <Image
              source={
                item.writerAvatar
                  ? {uri: item.writerAvatar}
                  : require('../../assets/kim.png')
              }
              style={styles.avatar}
            />
            <View style={styles.reviewHeaderText}>
              <Text style={styles.writerName}>{item.writerNickName}</Text>
              <Text style={styles.reviewInfo}>⭐ {item.rate}</Text>
            </View>
            {/* <Text style={styles.reviewDate}>{item.date}</Text> */}
            <Text style={styles.reviewDate}>2024-01-19</Text>
          </View>
          <Text style={styles.reviewContent}>{item.reviewContent}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageGallery}>
            {/* 
            서버 통신쪽 image
            {item.images &&
              item.images.map((image, index) => (
                <Image
                  key={index}
                  source={
                    image ? {uri: image} : require('../../assets/kim.png')
                  }
                  style={styles.reviewImage}
                />
              ))} */}
            <Image
              source={require('../../assets/kim.png')}
              style={styles.reviewImage}
            />
            <Image
              source={require('../../assets/kim.png')}
              style={styles.reviewImage}
            />
            <Image
              source={require('../../assets/kim.png')}
              style={styles.reviewImage}
            />
            <Image
              source={require('../../assets/kim.png')}
              style={styles.reviewImage}
            />
            <Image
              source={require('../../assets/kim.png')}
              style={styles.reviewImage}
            />
          </ScrollView>
        </View>
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  MenuaddView: {
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 18,
  },
  addButton: {
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'rgba(16, 190, 251, 0.7)',
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewContainer: {
    width: '90%',
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 18,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 40,
    marginRight: 20,
  },
  reviewHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  writerName: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'black',
  },
  reviewInfo: {
    fontSize: 16,
    color: '#616161',
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 14,
    color: '#828282',
    fontWeight: '500',
    paddingBottom: 16,
  },
  reviewContent: {
    fontSize: 16,
    marginBottom: 10,
    marginVertical: 5,
    color: '#616161',
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  imageGallery: {},
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default StoreReviewScreen;
