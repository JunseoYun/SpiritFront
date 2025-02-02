import React, {useState, useEffect} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import AlcoholAddForm from '../../components/AlcoholAddScreen/AlcoholAddForm';
import useCustomAlert from '../../hooks/useCustomAlert';
import {StoreDrinkcreate} from '../../api/drinkApi';
import forbiddenWords from '../../hooks/forbiddenWords';

const AlcoholAddScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId} = route.params;

  const {showAlert, AlertComponent} = useCustomAlert();

  const [alcohols, setAlcohols] = useState([
    {alcoholName: '', price: '', alcoholContent: '', type: '', imageUri: ''},
  ]);
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
        type: '',
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

  const AlcoholAdd = async () => {
    for (const alcohol of alcohols) {
      const containsForbiddenWord = forbiddenWords.some(
        word =>
          alcohol.alcoholName.includes(word) ||
          alcohol.alcoholContent.includes(word) ||
          alcohol.price.toString().includes(word),
      );

      if (containsForbiddenWord) {
        showAlert({
          title: '가이드 위반',
          message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
        });
        return;
      }

      if (!alcohol.alcoholName.trim()) {
        showAlert({
          title: '입력 오류',
          message: '주류 이름을 입력해주세요.',
        });
        return;
      }

      if (!alcohol.price.toString().trim()) {
        showAlert({
          title: '입력 오류',
          message: '주류 가격을 입력해주세요.',
        });
        return;
      }

      if (!alcohol.type.toString().trim()) {
        showAlert({
          title: '입력 오류',
          message: '주류 주종을 선택해주세요.',
        });
        return;
      }
    }

    try {
      // 각 메뉴에 대해 StoreMenucreate를 호출하도록 map 사용
      const promises = alcohols.map(alcohol => {
        const data = {
          file: alcohol.imageUri,
          createDrinkDto: {
            name: alcohol.alcoholName,
            description: alcohol.alcoholContent,
            price: alcohol.price,
            storeId: storeId,
            type: alcohol.type,
          },
        };

        // StoreMenucreate 비동기 함수 호출
        return StoreDrinkcreate(data);
      });

      // 모든 요청이 완료될 때까지 기다립니다.
      await Promise.all(promises);
      showAlert({
        title: '주류 등록이 완료되었습니다.',
        onConfirm: () => {
          navigation.replace('StoreStack', {
            screen: 'StoreMainScreen',
            params: {
              storeId: storeId,
            },
          });
        },
      });
    } catch (error) {
      showAlert({
        title: '주류 추가 오류',
        message: `주류 추가 중 \n오류가 발생하였습니다.`,
      });
    }
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
    width: '90%',
    marginVertical: 50,
    alignItems: 'center',
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'center',
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
