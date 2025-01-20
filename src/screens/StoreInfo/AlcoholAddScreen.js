import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {getToken} from '../../storage/tokenStorage';
import AlcoholAddForm from '../../components/AlcoholAddScreen/AlcoholAddForm';
import useCustomAlert from '../../hooks/useCustomAlert';

const AlcoholAddScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId} = route.params;
  const [token, setToken] = useState(null);

  const {showAlert, AlertComponent} = useCustomAlert();

  const [alcohols, setAlcohols] = useState([
    {alcoholName: '', price: '', alcoholContent: '', imageUri: ''},
  ]);

  useEffect(() => {
    const fetchToken = async () => {
      const savedToken = await getToken();
      setToken(savedToken); // 토큰을 가져온 후에 데이터 요청
    };
    fetchToken();
  }, []);

  const handleAlcoholChange = (text, index, field) => {
    const updatedAlcohols = [...alcohols];
    updatedAlcohols[index][field] = text;
    setAlcohols(updatedAlcohols);
  };

  const handleAddAlcohol = () => {
    setAlcohols([
      ...alcohols,
      {
        alcoholName: '',
        price: '',
        alcoholContent: '',
        imageUri: '',
      },
    ]);
  };

  const handleDeleteAlcohol = index => {
    showAlert({
      title: '주류 삭제',
      message: '해당 주류를 삭제하시겠습니까?',
      onConfirm: () => {
        const updatedAlcohols = alcohols.filter((_, i) => i !== index);
        setAlcohols(updatedAlcohols);
      },
      onCancel: null, // 취소 시 효과 제거
      type: 'delete',
    });
  };

  const AlcoholAdd = () => {
    // 저장 로직 구현
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {alcohols.map((alcohol, index) => (
          <AlcoholAddForm
            key={index}
            alcohol={alcohol}
            index={index}
            handleAlcoholChange={handleAlcoholChange}
            onDelete={handleDeleteAlcohol}
          />
        ))}

        <Pressable style={styles.menuAddButton} onPress={handleAddAlcohol}>
          <Text style={styles.menuAddText}>주류 추가</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={AlcoholAdd}>
          <Text style={styles.saveButtonText}>작성 완료</Text>
        </Pressable>
      </ScrollView>
      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  saveButton: {
    left: '10%',
    width: '80%',
    marginVertical: 50,
    alignItems: 'center',
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  menuAddButton: {
    marginTop: 30,
    color: 'white',
    width: 120,
    height: 50,
    fontSize: 12,
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  menuAddText: {
    color: '#333',
    fontSize: 17,
    alignSelf: 'center',
    fontWeight: '600',
  },
});

export default AlcoholAddScreen;
