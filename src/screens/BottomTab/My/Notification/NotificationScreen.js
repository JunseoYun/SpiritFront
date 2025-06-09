import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, SafeAreaView, View, FlatList} from 'react-native';
import {NotifiGet} from '../../../../api/notificationApi';

const mockNotifications = [
  {
    id: '1',
    title: '이벤트 안내',
    message: '5월 한정 신규 가입 이벤트에 참여하세요!',
    date: '2025.05.20',
  },
  {
    id: '2',
    title: '리뷰 요청',
    message: '방문하신 매장에 대한 리뷰를 남겨주세요.',
    date: '2025.05.18',
  },
  {
    id: '3',
    title: '공지사항',
    message: '시스템 점검이 5월 25일 02:00~04:00에 진행됩니다.',
    date: '2025.05.17',
  },
];

const NotificationCard = ({title, message, date}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardMessage}>{message}</Text>
    <Text style={styles.cardDate}>{date}</Text>
  </View>
);

const NotificationScreen = ({navigation}) => {
  useEffect(() => {
    Notifigetall();
  }, []);

  const Notifigetall = async () => {
    try {
      const data = await NotifiGet(0);
      console.log(data);
    } catch (error) {}
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mockNotifications}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <NotificationCard
            title={item.title}
            message={item.message}
            date={item.date}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
  },
  cardMessage: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});

export default NotificationScreen;
