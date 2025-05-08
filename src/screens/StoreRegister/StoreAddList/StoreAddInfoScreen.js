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
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import StoreAddProgressbar from '../../../components/StoreAddScreen/StoreAddProgressbar';
import StoreCategory from '../../../components/StoreAddScreen/StoreCategory';
import OperatingHoursPreview from '../../../components/StoreAddScreen/OperatingHoursPreview';
import StoreGroup from '../../../components/StoreAddScreen/StoreGroup';
import StoreTV from '../../../components/StoreAddScreen/StoreTV';
import StoreAlcohol from '../../../components/StoreAddScreen/StoreAlcohol';
import useCustomAlert from '../../../hooks/useCustomAlert';
const StoreAddInfoScreen = ({navigation}) => {
  // const route = useRoute();
  // const {storeId, storeName, storeAddress, storeAddressDetail, storeContact} =
  //   route.params; 전 정보 받아오기

  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(false);
  const [selectedscreenOption, setselectedscreenOption] = useState(false);
  const [closedDay, setClosedDay] = useState([]);
  const [alcohol, setAlcohol] = useState([{type: '', price: 0}]);
  const [is24Hours, setIs24Hours] = useState(false);
  const [isSameEveryTime, setIsSameEveryTime] = useState(true);

  const [operatingHours, setOperatingHours] = useState({
    Monday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Tuesday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Wednesday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Thursday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Friday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Saturday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Sunday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
  });

  const [breakingHours, setBreakingHours] = useState({
    Monday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Tuesday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Wednesday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Thursday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Friday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Saturday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Sunday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
  });

  const [hasBreaking, setHasBreaking] = useState(false);
  const storeTimeHandle = () => {
    navigation.navigate('StoreAddTimeSetScreen', {
      operatingHours,
      breakingHours,
      setOperatingHours,
      setBreakingHours,
      closedDay,
      setClosedDay,
      is24Hours,
      setIs24Hours,
      isSameEveryTime,
      setIsSameEveryTime,
      hasBreaking,
      setHasBreaking,
    });
  };

  const {showAlert, AlertComponent} = useCustomAlert();
  // const [errors, setErrors] = useState({});

  const handleNext = index => {
    //  서버 통신
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
        <StoreAddProgressbar progress={2} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>상세정보를 입력해주세요. ( 선택 )</Text>
          <StoreCategory
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <OperatingHoursPreview
            storeTimeHandle={storeTimeHandle}
            is24Hours={is24Hours}
            operatingHours={operatingHours}
            breakingHours={breakingHours}
            closedDay={closedDay}
          />

          <StoreGroup
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
          <StoreTV
            selectedscreenOption={selectedscreenOption}
            setselectedscreenOption={setselectedscreenOption}
          />
          <StoreAlcohol alcohol={alcohol} setAlcohol={setAlcohol} />
        </ScrollView>
        <View style={styles.storeAddTextview}>
          <Pressable
            style={styles.storeAddButtonsearch}
            onPress={() => {
              handleNext(1);
            }}>
            <Text style={styles.storeAddText}>매장 제보</Text>
          </Pressable>
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
    justifyContent: 'space-between',
  },
  storeAddButtonsearch: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#45C9FF',
    borderRadius: 10,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storeAddText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});

export default StoreAddInfoScreen;
