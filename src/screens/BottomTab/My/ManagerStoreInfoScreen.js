import React, {useState} from 'react';
import {SafeAreaView, Text, View, Pressable, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';
import StoreAreastats from '../../../components/Managerstoreinfo/StoreAreastats/StoreAreastats';
import StoreLikestats from '../../../components/Managerstoreinfo/StoreLikestats/StoreLikestats';
import StoreViewstats from '../../../components/Managerstoreinfo/StoreViewstats/StoreViewstats';

const ManagerStoreInfoScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, locationDto} = route.params;

  const [selectedButton, setSelectedButton] = useState('around'); // around | view | like

  const buttons = [
    {id: 'around', label: '매장 주변 통계'},
    {id: 'view', label: '매장 조회 통계'},
    {id: 'like', label: '매장좋아요 통계'},
  ];

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <View style={styles.buttonRow}>
        {buttons.map(btn => {
          const isSelected = selectedButton === btn.id;
          return (
            <Pressable
              key={btn.id}
              onPress={() => setSelectedButton(btn.id)}
              style={[styles.statsbtn, isSelected && styles.clickstatsbtn]}>
              <Text
                style={[
                  styles.statsbtntext,
                  isSelected && styles.clickstatsbtntext,
                ]}>
                {btn.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{flex: 1}}>
        <View
          style={{
            flex: 1,
            display: selectedButton === 'around' ? 'flex' : 'none',
          }}>
          <StoreAreastats locationDto={locationDto} />
        </View>
        <View
          style={{
            flex: 1,
            display: selectedButton === 'like' ? 'flex' : 'none',
          }}>
          <StoreLikestats storeId={storeId} />
        </View>
        <View
          style={{
            flex: 1,
            display: selectedButton === 'view' ? 'flex' : 'none',
          }}>
          <StoreViewstats storeId={storeId} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ManagerStoreInfoScreen;

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
    marginVertical: 15,
  },
  statsbtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    padding: 15,
    borderRadius: 6,
  },
  clickstatsbtn: {
    borderColor: '#16BBFF',
  },
  statsbtntext: {
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Pretendard-Medium',
  },
  clickstatsbtntext: {
    color: '#16BBFF',
    fontFamily: 'Pretendard-Bold',
  },
});
