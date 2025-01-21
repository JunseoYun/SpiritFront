import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Userdataget} from '../../../api/userApi';

const ConfigPage = ({navigation}) => {
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
    <View style={{backgroundColor: 'white', height: '100%'}}>
      <View style={styles.imgview}>
        <Pressable style={styles.imageContainer}>
          <Image
            source={require('../../../assets/kim.png')}
            style={styles.profileimg}
          />
          <View style={styles.cameraButton}>
            <FontAwesomeIcon name="camera" size={25} color="#333" />
          </View>
        </Pressable>
      </View>

      <View style={styles.configtopview}>
        <View style={styles.nameview}>
          <Text style={styles.nametext}>닉네임</Text>
          <View style={styles.innerview}>
            <Text style={styles.nicknametext}>{userdata.nickname}</Text>
            <Pressable
              onPress={() => navigation.navigate('Mynickchange', {userdata})}>
              <FontAwesomeIcon
                name={'angle-right'}
                size={30}
                color={'gray'}
                style={styles.changenick}
              />
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.configtopview}>
        <Pressable
          style={styles.nameview}
          onPress={() => navigation.navigate('Logout')}>
          <Text style={styles.nametext}>로그아웃</Text>
        </Pressable>
        <View style={styles.nameview}>
          <Text style={styles.nametext}>회원 탈퇴</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imgview: {
    alignItems: 'center',
    marginVertical: 50,
  },
  imageContainer: {
    position: 'relative', // 이미지와 버튼을 겹치게 하기 위해 설정
    width: 100,
    height: 100,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileimg: {
    resizeMode: 'contain',
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  configtopview: {
    marginHorizontal: 30,
    borderWidth: 2,
    borderColor: 'lightgray',
    borderRadius: 10,
    marginBottom: 30,
  },
  nameview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderColor: 'lightgray',
  },
  nametext: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  innerview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nicknametext: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingRight: 15,
  },
});

export default ConfigPage;
