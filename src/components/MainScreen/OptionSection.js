import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OptionButton = ({title, description, iconName, onPress, isActive}) => {
  return (
    <Pressable
      style={[styles.optionButton, isActive && styles.activeButton]}
      onPress={onPress}>
      <Ionicons
        name={iconName}
        size={40} // 아이콘 크기 축소
        color={isActive ? '#FFFFFF' : '#333'}
        style={styles.optionIcon}
      />
      <View style={styles.optionTextContainer}>
        <Text style={[styles.optionTitle, isActive && styles.activeText]}>
          {title}
        </Text>
        <Text style={[styles.optionDescription, isActive && styles.activeText]}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
};

const OptionsSection = ({storeactiveIndex, handlestoreItemClick}) => {
  const options = [
    {
      id: 2,
      title: '내 주변 안주 찾기',
      description: '가까운 거리에서\n최적의 안주를 찾아봐요!',
      iconName: 'location-outline',
    },
    {
      id: 3,
      title: '랜덤 안주 고르기',
      description: '다양한 안주 중에\n랜덤으로 골라볼까요!',
      iconName: 'shuffle',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>못 고르겠다면?!</Text>
      </View>
      <View style={styles.optionsContainer}>
        {options.map(option => (
          <OptionButton
            key={option.id}
            title={option.title}
            description={option.description}
            iconName={option.iconName}
            isActive={storeactiveIndex === option.id}
            onPress={() => handlestoreItemClick(option.id)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 16, // 텍스트 크기 축소
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15, // 여백 축소
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // 둥근 정도 축소
    marginHorizontal: 8, // 간격 축소
    padding: 12, // 내부 여백 축소
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3}, // 그림자 크기 축소
    shadowOpacity: 0.1,
    shadowRadius: 8, // 그림자 범위 축소
    elevation: 3, // Android 그림자 축소
  },
  activeButton: {
    backgroundColor: '#45C9FF',
    shadowColor: '#45C9FF',
    shadowOpacity: 0.25,
    elevation: 6,
  },
  optionIcon: {
    marginBottom: 8, // 간격 축소
  },
  optionTextContainer: {
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 14, // 텍스트 크기 축소
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginBottom: 4, // 간격 축소
  },
  optionDescription: {
    fontSize: 12, // 텍스트 크기 축소
    color: '#666',
    textAlign: 'center',
    lineHeight: 16, // 줄 간격 축소
    fontFamily: 'Pretendard-Medium',
  },
  activeText: {
    color: '#FFFFFF',
  },
});

export default OptionsSection;
