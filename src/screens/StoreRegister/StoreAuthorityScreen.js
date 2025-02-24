import React, {useState, useLayoutEffect} from 'react';
import {Text, SafeAreaView, Pressable, StyleSheet, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import ProgressBar from '../../components/StoreAuthority/ProgressBar';

const StoreAuthorityScreen = ({navigation}) => {
  const route = useRoute();
  const {storeData} = route.params;

  const handleNext = () => {
    // 다음 단계 로직
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleNext}>
          <Text style={styles.searchButton}>신청</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.storetopview}>
      {/* 진행 바: 100% 진행 */}
      <ProgressBar progress={1} />
      <Text style={styles.title}>
        정확한 신청자 정보를 입력해 주세요.{'\n'}
        입력된 정보는 매장 정보 확인에만 사용됩니다.{'\n'}
        무차별적인 신청은 엄격히 금지되며, 부정확한 정보나 타인의 정보를 기재할
        경우 서비스 이용에 제한을 받을 수 있습니다.{'\n'}
        모든 정보는 철저히 검토되며, 부정확한 정보가 확인될 경우 신청이 반려될
        수 있습니다.
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  storetopview: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: 30,
    marginHorizontal: 18,
    color: '#999',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 25,
  },
  searchButton: {
    marginRight: 18,
    fontSize: 19,
    fontWeight: '600',
    color: '#16BBFF',
  },
});

export default StoreAuthorityScreen;
