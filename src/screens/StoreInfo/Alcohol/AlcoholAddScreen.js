import React, {useState, useLayoutEffect, useRef} from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import AlcoholAddForm from '../../../components/AlcoholAddScreen/AlcoholAddForm';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {StoreDrinkcreate} from '../../../api/drinkApi';
import forbiddenWords from '../../../hooks/forbiddenWords';
import Loading from '../../../hooks/Loading';
import {useToast} from '../../../context/ToastContext';

const AlcoholAddScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const route = useRoute();
  const scrollViewRef = useRef(null);
  const {storeId} = route.params;
  const {showToast} = useToast();
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
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 100); // 0~100ms 사이의 짧은 delay 필요
  };

  const handleDeleteAlcohol = index => {
    if (alcohols.length === 1) {
      showToast('주류는 최소 1개 이상 등록되어야 합니다.', 'center');
      return;
    }
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

  const alcoholRefs = useRef([]);

  const AlcoholAdd = async () => {
    for (let i = 0; i < alcohols.length; i++) {
      const alcohol = alcohols[i];
      const containsForbiddenWord = forbiddenWords.some(
        word =>
          alcohol.alcoholName.includes(word) ||
          alcohol.alcoholContent.includes(word) ||
          alcohol.price.toString().includes(word),
      );

      const Gotoalcoholrror = () => {
        alcoholRefs.current[i]?.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current?.scrollTo({y: y - 40, animated: true});
          },
          error => {
            console.log('measureLayout error:', error);
          },
        );
      };

      if (containsForbiddenWord) {
        showAlert({
          title: '가이드 위반',
          message: '비속어 및 이용 약관에 위배되는\n내용이 포함되어 있습니다.',
          onConfirm: () => {
            Gotoalcoholrror();
          },
        });
        return;
      }

      if (!alcohol.alcoholName.trim()) {
        showAlert({
          title: '입력 오류',
          message: '주류 이름을 입력해주세요.',
          onConfirm: () => {
            Gotoalcoholrror();
          },
        });
        return;
      }

      if (!alcohol.price.toString().trim()) {
        showAlert({
          title: '입력 오류',
          message: '주류 가격을 입력해주세요.',
          onConfirm: () => {
            Gotoalcoholrror();
          },
        });
        return;
      }

      if (!alcohol.type.toString().trim()) {
        showAlert({
          title: '입력 오류',
          message: '주류 주종을 선택해주세요.',
          onConfirm: () => {
            Gotoalcoholrror();
          },
        });
        return;
      }
    }

    try {
      setConfirm(true);
      setLoading(true);
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
          setConfirm(false);
          navigation.replace('StoreStack', {
            screen: 'StoreMainScreen',
            params: {
              storeId: storeId,
            },
          });
        },
      });
    } catch (error) {
      setConfirm(false);
      showAlert({
        title: '주류 추가 오류',
        message: `주류 추가 중 \n오류가 발생하였습니다.`,
      });
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={loading || confirm ? null : AlcoholAdd}
          disabled={loading || confirm}>
          <Text style={[styles.headerButton]}>완료</Text>
        </Pressable>
      ),
    });
  }, [navigation, AlcoholAdd, loading, confirm]);

  return (
    <SafeAreaView style={styles.container}>
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: '#F7F8FA'}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{flexGrow: 1, paddingBottom: 40}} // 👈 핵심
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {alcohols.map((alcohol, index) => (
            <AlcoholAddForm
              key={index}
              ref={el => (alcoholRefs.current[index] = el)}
              alcohol={alcohol}
              index={index}
              handleAlcoholChange={handleAlcoholChange}
              onDelete={handleDeleteAlcohol}
            />
          ))}
        </ScrollView>
        <AlertComponent />
        <View style={styles.menuAddTextview}>
          <Pressable style={styles.menuAddButton} onPress={handleAddAlcohol}>
            <Text style={styles.menuAddText}>주류 추가</Text>
          </Pressable>
        </View>
        <Loading loading={loading} />
      </KeyboardAvoidingView>
      {/* </TouchableWithoutFeedback> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerButton: {
    marginRight: 18,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#16BBFF',
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
  menuAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  menuAddButton: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45C9FF',
    borderRadius: 10,
  },
  menuAddText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingtext: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default AlcoholAddScreen;
