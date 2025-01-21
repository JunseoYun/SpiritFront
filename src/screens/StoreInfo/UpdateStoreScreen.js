import React, {useEffect, useState} from 'react';
import {
  Text,
  SafeAreaView,
  Image,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {StoreMainget} from '../../api/storeApi';
import useCustomAlert from '../../hooks/useCustomAlert';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

const UpdateStoreScreen = ({navigation}) => {
  const route = useRoute();
  const [store, setStore] = useState(null); // 초기 상태 null로 설정
  const {storeId} = route.params; // storeId를 params에서 가져옴

  const {showAlert, AlertComponent} = useCustomAlert();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const storeData = await StoreMainget(storeId);
        setStore(storeData);
      } catch (error) {
        if (error.response.status === 500) {
          showAlert({
            title: '매장 불러오기 오류',
            message:
              '매장 정보를 불러오지 못했습니다.\n잠시 후 다시 시도해주세요.',
            onConfirm: () => navigation.goBack(),
            type: 'ok',
          });
        }
      }
    };
    fetchStoreData();
  }, [storeId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.titleView}>
          <SimpleLineIcons name="pencil" size={17} color="#333" />
          <Text style={styles.imageText}>매장 이미지 수정</Text>
        </View>
        {store?.imgUrlList && store.imgUrlList.length > 0 ? (
          <ScrollView
            style={styles.imageScrollView}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {store.imgUrlList.map((url, index) => (
              <Image key={index} source={{uri: url}} style={styles.image} />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noImageText}>이미지가 없습니다.</Text>
        )}

        <View style={styles.titleView}>
          <SimpleLineIcons name="pencil" size={17} color="#333" />
          <Text style={styles.titleText}>{store?.name}</Text>
        </View>
      </ScrollView>
      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageScrollView: {
    marginTop: 16,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginLeft: 10, // 가로 스크롤 간격 추가
    resizeMode: 'cover',
  },
  imageText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  noImageText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
  },
  titleView: {
    marginTop: 30,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
});

export default UpdateStoreScreen;
