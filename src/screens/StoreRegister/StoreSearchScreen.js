import React, {useState, useLayoutEffect} from 'react';
import {
  Text,
  SafeAreaView,
  Pressable,
  StyleSheet,
  Alert,
  Dimensions,
  View,
} from 'react-native';
import StoreSearchBar from '../../components/StoreSearch/StoreSearchBar';
import StoreResultList from '../../components/StoreSearch/StoreResultList';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {useToast} from '../../context/ToastContext';
import {useAuth} from '../../context/AuthContext';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import {normalizeFont} from '../../hooks/normalizeFont';

const {width} = Dimensions.get('window');

const StoreSearchScreen = ({navigation}) => {
  const {bottom} = useSafeAndroidInsets();
  const route = useRoute();
  const {index, location} = route.params;
  const [searchStoreName, setSearchStoreName] = useState('');
  const [trimmedSearchWord, setTrimmedSearchWord] = useState('');
  const {token} = useAuth();
  const {showToast} = useToast();

  useFocusEffect(
    React.useCallback(() => {
      if (!token) {
        showToast('로그인 후 이용해주세요', 'center');
        navigation.goBack();
      }
    }, [token]),
  );

  // 검색 핸들러: 입력된 검색어가 있다면 공백 제거 후 결과 리스트에 전달
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
    navigation.navigate('StoreAddPhotoScreen', {
      index: index,
      location: location,
    });
  };

  // 헤더 오른쪽에 검색 버튼 추가
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleSearch}>
          <Text style={styles.searchButton} allowFontScaling={false}>
            검색
          </Text>
        </Pressable>
      ),
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
      <Text style={styles.infoText}>
        한잔할까에 등록된 매장인지 확인해보세요!
      </Text>

      <StoreResultList
        trimmedSearchWord={trimmedSearchWord}
        navigation={navigation}
        index={index}
      />

      <View style={styles.storeAddTextview}>
        <Pressable style={styles.storeAddButtonsearch} onPress={handleStoreAdd}>
          <Text style={styles.storeAddText}>
            {index ? '매장 등록 및 사장님 인증' : '매장 제보'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 16,
  },
  searchButton: {
    marginRight: 18,
    fontSize: normalizeFont(18, 1.5),
    fontFamily: 'Pretendard-SemiBold',
    color: '#45C9FF',
  },
  infoText: {
    marginHorizontal: 20,
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    marginVertical: 5,
  },
  storeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  storeAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' && 10,
  },
  storeAddButtonsearch: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45C9FF',
    borderRadius: 10,
  },
  storeAddText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
});

export default StoreSearchScreen;
