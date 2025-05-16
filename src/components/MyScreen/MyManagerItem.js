import React from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';

const MyManagerItem = ({mysotredata, navigation}) => {
  const formatDate = dateString => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    return year === currentYear
      ? `${date.getMonth() + 1}.${date.getDate()}`
      : `${year}.${date.getMonth() + 1}.${date.getDate()}`;
  };
  const formattedCreatedDate = formatDate(mysotredata.approvedAt);

  return (
    <>
      <Pressable
        style={styles.container}
        key={mysotredata.id}
        onPress={() => {
          navigation.navigate('StoreStack', {
            screen: 'StoreMainScreen',
            params: {
              storeId: mysotredata.storeId,
            },
          });
        }}>
        <Text style={styles.mystroename} numberOfLines={2} ellipsizeMode="tail">
          {mysotredata.storeName}
        </Text>
        <Text style={styles.mystroeAt}>허가 날짜 : {formattedCreatedDate}</Text>
      </Pressable>
      <View style={styles.divider}></View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 5,
  },

  mystroename: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    paddingVertical: 5,
    color: '#181A1A',
    width: '100%',
  },

  mystroeAt: {
    textAlign: 'right',
    fontSize: 14,
    paddingVertical: 5,
    color: '#767676',
    fontFamily: 'Pretendard-Medium',
  },

  divider: {
    height: 3,
    backgroundColor: '#E9E9E9',
    marginVertical: 13,
  },
});

export default MyManagerItem;
