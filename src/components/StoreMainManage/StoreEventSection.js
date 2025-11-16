import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

const StoreEventSection = ({title, event}) => {
  const hasEvent = !!(event?.date || event?.description);

  return (
    <>
      <View style={styles.divider} />
      <Text style={styles.label}>{title}</Text>
      {hasEvent ? (
        <>
          {event?.date && (
            <Text style={styles.text}>{`일자 : ${event.date}`}</Text>
          )}
          {event?.description && (
            <Text style={styles.text}>{`내용 : ${event.description}`}</Text>
          )}
        </>
      ) : (
        <Text style={styles.text}>등록된 정보가 없습니다.</Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: '#EFEFEF',
    height: 1,
    marginHorizontal: 16,
    marginVertical: 30,
  },
  label: {
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    fontSize: 18,
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 10,
  },
  text: {
    marginHorizontal: 18,
    color: '#333',
    fontSize: 15,
    marginBottom: 10,
  },
});

export default StoreEventSection;
