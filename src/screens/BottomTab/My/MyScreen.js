import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Text, SafeAreaView} from 'react-native';
import MyPageheader from '../../../components/MyScreen/MyPageheader'; // 위에서 만든 컴포넌트
import {Userdataget} from '../../../api/userApi';
import Myreview from '../../../components/MyScreen/Myreview';

const MyScreen = ({navigation}) => {
  const [userdata, setUserdata] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await Userdataget(); // API 호출
        setUserdata(data); // 결과를 상태에 저장
        console.log(data);
      } catch (error) {
        console.error('Error initializing token or fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  if (!userdata) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <MyPageheader
        nickname={userdata.nickname}
        onProfilePress={() =>
          navigation.navigate('MyStack', {
            screen: 'ConfigPage',
          })
        }
      />
      <View style={styles.innerviewtext}>
        <Text style={styles.reservationtext}>나의 리뷰</Text>
      </View>
      <View style={styles.line} />
      <ScrollView>
        {/* Myreview 값 가져오기 */}
        <Myreview navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  line: {
    marginTop: 15,
    width: '100%',
    height: 2,
    borderColor: 'lightgray',
    borderWidth: 1,
  },
  innerviewtext: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationtext: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MyScreen;
