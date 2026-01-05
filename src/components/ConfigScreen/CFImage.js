import React from 'react';
import {View, Image, Pressable, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const CFImage = ({imageUrl, onPress}) => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.imageContainer} onPress={onPress}>
        <Image
          source={
            imageUrl
              ? {uri: imageUrl}
              : require('../../assets/default_profile.png')
          }
          style={styles.image}
        />
        <View style={styles.cameraButton}>
          <FontAwesomeIcon
            name="camera"
            size={15}
            color="#fff"
            style={styles.cameraicon}
          />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 40,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 100,
    resizeMode: 'cover',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#d8d8d8',
    borderWidth: 2.5,
    borderColor: 'white',
  },
  cameraicon: {},
});

export default CFImage;
