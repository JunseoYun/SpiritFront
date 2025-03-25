import React from 'react';

import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';

const Title = ({handleEdit, storedata, isUpdate, onModalOpen}) => {
  return (
    <>
      {isUpdate ? (
        <View style={styles.titleview}>
          <TouchableOpacity
            onPress={() => handleEdit('name', storedata?.name)}
            style={styles.titlebtn}>
            <Text style={styles.Storetitle}>{storedata?.name}</Text>
            <View
              style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
              <Entypo name="chevron-small-right" size={25} color="#333" />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.Storetitleview}>
          <View>
            <Text style={styles.Storetitle}>{storedata?.name}</Text>
          </View>
          <Pressable onPress={onModalOpen}>
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
    marginTop: 20,
    marginBottom: 10,
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
  titlebtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  Storetitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  updateicons: {},
});

export default Title;
