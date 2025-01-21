import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const CFUserinfo = ({userdata, navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>닉네임</Text>
        <View style={styles.info}>
          <Text style={styles.value}>{userdata.nickname}</Text>
          <Pressable
            onPress={() => navigation.navigate('Mynickchange', {userdata})}>
            <FontAwesomeIcon name="angle-right" size={30} color="gray" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 30,
    borderWidth: 2,
    borderColor: 'lightgray',
    borderRadius: 10,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 2,
    borderColor: 'lightgray',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 15,
  },
});

export default CFUserinfo;
