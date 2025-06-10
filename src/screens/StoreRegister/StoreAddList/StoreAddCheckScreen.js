import React, {useState, useLayoutEffect} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import StoreAddProgressbar from '../../../components/StoreAddScreen/StoreAddProgressbar';
import useCustomAlert from '../../../hooks/useCustomAlert';
const StoreAddCheckScreen = ({navigation}) => {
  const route = useRoute();
  const {location} = route.params;

  const {showAlert, AlertComponent} = useCustomAlert();
  // const [errors, setErrors] = useState({});

  const handleNext = index => {
    navigation.navigate('StoreAddPhotoScreen', {
      index,
      location,
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleNext}>
          <Text style={styles.nextButton}>다음</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // iOS의 경우 적절한 offset 설정
    >
      <SafeAreaView style={styles.storetopview}>
        {/* 진행 바: 50% 진행 */}
        <StoreAddProgressbar progress={0} />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>영수증을 가지고 있습니까?</Text>
        </ScrollView>
        <View style={styles.storeAddTextview}>
          <TouchableOpacity
            style={[
              styles.storeAddButtonsearch,
              {
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#45C9FF',
              },
            ]}
            onPress={() => {
              handleNext(0);
            }}>
            <Text
              style={[
                styles.storeAddText,
                {
                  color: '#45C9FF',
                },
              ]}>
              아니요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.storeAddButtonsearch,
              {
                backgroundColor: '#45C9FF',
              },
            ]}
            onPress={() => {
              handleNext(1);
            }}>
            <Text style={styles.storeAddText}>예</Text>
          </TouchableOpacity>
        </View>
        <AlertComponent />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  storetopview: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // 하단 버튼 영역 확보
  },

  title: {
    marginTop: 30,
    marginHorizontal: 18,
    color: '#333',
    fontWeight: '600',
    fontSize: 20,
  },
  nextButton: {
    marginRight: 18,
    fontSize: 19,
    fontWeight: '600',
    color: '#16BBFF',
  },

  storeAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 10,
  },
  storeAddButtonsearch: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  storeAddText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default StoreAddCheckScreen;
