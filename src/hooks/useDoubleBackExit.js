// hooks/useDoubleBackExit.js
import {useCallback, useRef, useLayoutEffect} from 'react';
import {BackHandler, ToastAndroid, Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';

export default function useDoubleBackExit(navigation) {
  const lastBackPressed = useRef(0);

  // 🔙 헤더 왼쪽 버튼 설정
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => {
            const now = Date.now();
            if (now - lastBackPressed.current < 2000) {
              navigation.goBack();
            } else {
              lastBackPressed.current = now;
              ToastAndroid.show(
                '한 번 더 누르면 작성한 내용이 사라집니다.',
                ToastAndroid.SHORT,
              );
            }
          }}
          hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
          <Ionicons
            name="arrow-back-outline"
            size={23}
            color="#333"
            style={{paddingLeft: 12}}
          />
        </Pressable>
      ),
    });
  }, [navigation]);

  // 📱 안드로이드 하드웨어 뒤로가기 처리
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();
        if (now - lastBackPressed.current < 2000) {
          navigation.goBack();
          return true;
        }
        lastBackPressed.current = now;
        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );
}
