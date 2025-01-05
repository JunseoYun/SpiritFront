import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';


const ResultTopBar = ({ searchWord, setSearchWord, navigation }) => {
  return (
    <View style={styles.topView}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <AntDesign name="arrowleft" size={25} color={'black'} />
      </TouchableOpacity>

      <View style={styles.search}>
        <EvilIcons
          style={styles.searchIcon}
          name="search"
          size={30}
          color={'gray'}
        />
        <TextInput
          style={styles.searchTextInput}
          placeholder={searchWord}
          placeholderTextColor="gray"
          value={searchWord}
          onChangeText={text => setSearchWord(text)}
        />
      </View>
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('MainScreen')}>
        <Ionicons name={'home-outline'} size={25} color={'black'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topView: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginLeft: 15,
  },
  homeButton: {
    marginRight: 15,
  },
  search: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    width: '70%',
    borderRadius: 7,
    alignItems: 'center',
  },
  searchIcon: {
    color: 'gray',
    marginTop: 12,
    marginBottom: 12,
    marginLeft: 10,
  },
  searchTextInput: {
    fontSize: 15,
    color: 'gray',
  },
});

export default ResultTopBar;