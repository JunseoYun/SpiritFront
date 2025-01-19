import React, {useEffect, useState} from 'react';
import {Alert, SafeAreaView, StyleSheet} from 'react-native';
import AlcoholHeader from '../../components/StoreAlcoholScreen/AlcoholHeader';
import AlcoholItem from '../../components/StoreAlcoholScreen/AlcoholItem';
import AlcoholModal from '../../components/StoreAlcoholScreen/AlcoholModal';
import {StoreMenudelete} from '../../api/menuApi';

const StoreAlcoholScreen = ({navigation, storeId, alcohols}) => {
  const [buttonPosition, setButtonPosition] = useState({x: 0, y: 0});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAlcoholIdId, setSelectedAlcoholIdId] = useState(null);

  const onPressModalOpen = alcoholId => {
    setSelectedAlcoholIdId(alcoholId); // 선택한 메뉴 ID를 상태로 저장
    setIsModalVisible(true);
  };

  const onPressModalClose = () => {
    setIsModalVisible(false);
    setSelectedAlcoholIdId(null);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePress = index => {
    if (index == 0) {
      navigation.navigate('UpdateAlcohol', {alcoholId: selectedAlcoholIdId});
    }
    onPressModalClose();
  };

  const opendeletemenu = () => {
    Alert.alert(
      '주류 삭제',
      '주류를 삭제하시겠습니까?',
      [
        {
          text: '확인',
          style: 'destructive',
          onPress: async () => {
            try {
              await StoreMenudelete(selectedMenuId); // StoreMaindelete 함수 호출
              Alert.alert(
                '삭제되었습니다.',
                '',
                [
                  {
                    text: '확인',
                    style: 'destructive',
                    onPress: () => {
                      setIsModalVisible(false);
                      getStoreData(); // 삭제 후 메인 페이지로 이동
                    },
                  },
                ],
                {cancelable: false},
              );
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('오류가 발생했습니다. 다시 시도해주세요.');
            }
          },
        },
        {
          text: '취소',
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  useEffect(() => {}, [alcohols]);

  return (
    <SafeAreaView style={styles.container}>
      <AlcoholHeader storeId={storeId} navigation={navigation} />
      {alcohols &&
        alcohols
          .filter(alcohol => alcohol.isMain)
          .map(alcohol => (
            <AlcoholItem
              key={alcohol.alcoholId}
              alcohol={alcohol}
              onPressMenuOption={onPressModalOpen}
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              setButtonPosition={setButtonPosition}
            />
          ))}
      {isModalVisible && (
        <AlcoholModal
          visible={isModalVisible}
          onPressModalClose={onPressModalClose}
          onUpdate={() => handlePress(0)}
          onDelete={opendeletemenu}
          buttonPosition={buttonPosition} // 모달 위치 설정
        />
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
});

export default StoreAlcoholScreen;
