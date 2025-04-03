import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const CFUserinfo = ({userdata, navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>닉네임</Text>
        <Pressable
          style={styles.info}
          onPress={() => navigation.navigate('Mynickchange', {userdata})}>
          <Text style={styles.value}>{userdata.nickname}</Text>
          <View>
            <FontAwesomeIcon name="angle-right" size={25} color="#999" />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    color: '#999',
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    marginRight: 15,
  },
});

export default CFUserinfo;
