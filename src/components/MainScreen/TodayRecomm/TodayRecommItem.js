import React from 'react';
import {View, ImageBackground, StyleSheet, Text, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';

const TodayRecommItem = ({store, category, location, navigation}) => {
  return (
    <Pressable
      onPress={() =>
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {storeId: store.id},
        })
      }
      style={styles.container}>
      <FastImage
        style={styles.imageBackground}
        source={
          store.mainImgUrl
            ? {uri: store.mainImgUrl, priority: FastImage.priority.normal}
            : require('../../../assets/default_store.png')
        }
        resizeMode={FastImage.resizeMode.cover}>
        <View style={styles.overlay}>
          <View style={styles.storeContainer}>
            <View style={styles.storeNameView}>
              <Text
                style={styles.storeName}
                numberOfLines={1}
                ellipsizeMode="tail">
                {store.name}
              </Text>
            </View>
          </View>
        </View>
      </FastImage>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  storeContainer: {
    width: '100%',
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  storeNameView: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginBottom: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  storeName: {
    color: '#333',
    fontSize: 15,
    fontWeight: 'bold',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
});

export default React.memo(TodayRecommItem);
