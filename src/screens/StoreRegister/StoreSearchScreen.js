import React, {useState, useLayoutEffect} from 'react';
import {
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Dimensions,
  View,
  Platform,
} from 'react-native';
import StoreSearchBar from '../../components/StoreSearch/StoreSearchBar';
import StoreResultList from '../../components/StoreSearch/StoreResultList';
import {useRoute} from '@react-navigation/native';
import {useToast} from '../../context/ToastContext';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {normalizeFont} from '../../hooks/normalizeFont';
import BottomActionButton from '../../utils/BottomActionButton';
import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../../utils/CustomText';

const {width} = Dimensions.get('window');

const StoreSearchScreen = ({navigation}) => {
  const {bottom} = useSafeAndroidInsets();
  const route = useRoute();
  const {index, location} = route.params;
  const [searchStoreName, setSearchStoreName] = useState('');
  const [trimmedSearchWord, setTrimmedSearchWord] = useState('');
  const {showToast} = useToast();

  // 검색 핸들러
  const handleSearch = () => {
    const trimmed = searchStoreName.trim();
    if (trimmed === '') {
      showToast('검색어를 입력해주세요.');
      setTrimmedSearchWord('');
    } else {
      setTrimmedSearchWord(trimmed);
    }
  };

  const handleStoreAdd = () => {
    index
      ? navigation.navigate('StoreOwnershipScreen', {
          index: index,
          location: location,
        })
      : navigation.navigate('StoreSuggestionScreen', {
          index: index,
          location: location,
        });
  };

  // ✅ 헤더 오른쪽 검색 버튼: 입력 값 없을 땐 비활성화
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        const trimmed = searchStoreName.trim();
        const isDisabled = trimmed.length === 0;

        return (
          <Pressable
            onPress={!isDisabled ? handleSearch : null}
            disabled={isDisabled}>
            <CustomText
              scale={1.5}
              style={[
                styles.searchButton,
                {
                  color: isDisabled ? ColorUtil.mainDisable : ColorUtil.main,
                },
              ]}>
              검색
            </CustomText>
          </Pressable>
        );
      },
    });
  }, [navigation, searchStoreName]);

  return (
    <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
      <StoreSearchBar
        value={searchStoreName}
        onChangeText={setSearchStoreName}
        placeholder="매장 이름을 입력해주세요."
        onPress={handleSearch}
      />

      {trimmedSearchWord.length === 0 && (
        <CustomText style={styles.infoText}>
          한잔할까에 등록된 매장인지 확인해보세요!
        </CustomText>
      )}

      <StoreResultList
        trimmedSearchWord={trimmedSearchWord}
        navigation={navigation}
        index={index}
      />

      <BottomActionButton
        label={index ? '매장 등록 및 사장님 인증' : '매장 제보'}
        onPress={handleStoreAdd}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  searchButton: {
    marginRight: 18,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
  },
  infoText: {
    marginHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    marginVertical: 5,
  },
});

export default StoreSearchScreen;
