import React from 'react';

import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const Title = ({handleEdit, storeName, isUpdate, onModalOpen}) => {
  return (
    <>
      {isUpdate ? (
        <View style={styles.titleview}>
          <TouchableOpacity
            onPress={() => handleEdit('name', storeName)}
            style={styles.titlebtn}>
            <View style={styles.titleView2}>
              <Text style={styles.Storetitle}>{storeName}</Text>
            </View>
            <View
              style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
              <Entypo name="chevron-small-right" size={25} color="#333" />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.Storetitleview}>
          <View style={styles.titleView2}>
            <Text style={styles.Storetitle}>{storeName}</Text>
          </View>
          <Pressable
            onPress={onModalOpen}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Entypo name="dots-three-vertical" size={20} color="#333" />
          </Pressable>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  Storetitleview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,

    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },
  titleview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 18,
  },
  titleView2: {
    flexDirection: 'row',
    flex: 1,
  },
  titlebtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  Storetitle: {
    maxWidth: '90%',
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  updateicons: {},
  imageStyle: {
    alignSelf: 'center',
    width: 20,
    height: 20,
    marginLeft: 5,
  },
});

export default Title;
