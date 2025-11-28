import React, {useMemo, useRef, useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../../../utils/CustomText';

const MapFilterHeader = ({
  setFilterInitialTab,
  setFilterModalVisible,

  setFilterheight = () => {},
  distanceLabel,
  categoryLabel,
  peopleLabel,
  alcoholLabel,
  timeActive,
  parkingLabel,
  corkageLabel,
  screenLabel,
  roomLabel,
  outdoorLabel,
  storeatmLabel,
  storeatmCount = 0,
}) => {
  return (
    <View
      style={styles.headerContainer}
      onLayout={e => {
        const {height} = e.nativeEvent.layout;
        setFilterheight(height);
      }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.headerScroll}>
        <Pressable
          style={styles.filterChip}
          onPress={() => {
            setFilterInitialTab('거리');
            setFilterModalVisible(true);
          }}>
          <MaterialCommunityIcons name="tune-variant" size={17} color="#555" />
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            distanceLabel != '2km' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('거리');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              distanceLabel != '2km' && styles.filterTextActive,
            ]}>
            {distanceLabel}
          </CustomText>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            categoryLabel !== '카테고리' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('카테고리');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              categoryLabel !== '카테고리' && styles.filterTextActive,
            ]}>
            {categoryLabel}
          </CustomText>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            alcoholLabel !== '주종' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('주종');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              alcoholLabel !== '주종' && styles.filterTextActive,
            ]}>
            {alcoholLabel}
          </CustomText>
        </Pressable>
        <View>
          <Pressable
            style={[
              styles.filterChip,
              storeatmCount > 0 && styles.filterChipActive,
            ]}
            onPress={() => {
              setFilterInitialTab('분위기');
              setFilterModalVisible(true);
            }}>
            <CustomText
              style={[
                styles.filterText,
                storeatmCount > 0 && styles.filterTextActive,
              ]}>
              분위기
            </CustomText>
          </Pressable>
          {storeatmCount > 0 && (
            <View style={styles.badge}>
              <CustomText maxScale={1.2} style={styles.badgeText}>
                {storeatmCount}
              </CustomText>
            </View>
          )}
        </View>

        <Pressable
          style={[
            styles.filterChip,
            timeActive !== '방문시간' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('방문시간');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              timeActive !== '방문시간' && styles.filterTextActive,
            ]}>
            {timeActive}
          </CustomText>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            screenLabel == '설치' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              screenLabel == '설치' && styles.filterTextActive,
            ]}>
            스크린·TV
          </CustomText>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            roomLabel == '가능' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              roomLabel == '가능' && styles.filterTextActive,
            ]}>
            룸
          </CustomText>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            outdoorLabel == '가능' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              outdoorLabel == '가능' && styles.filterTextActive,
            ]}>
            야외 좌석·테라스
          </CustomText>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            peopleLabel !== '인원' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              peopleLabel !== '인원' && styles.filterTextActive,
            ]}>
            단체 방문 가능
          </CustomText>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            parkingLabel == '가능' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              parkingLabel == '가능' && styles.filterTextActive,
            ]}>
            주차 가능
          </CustomText>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            corkageLabel == '가능' && styles.filterChipActive,
          ]}
          onPress={() => {
            setFilterInitialTab('편의시설');
            setFilterModalVisible(true);
          }}>
          <CustomText
            style={[
              styles.filterText,
              corkageLabel == '가능' && styles.filterTextActive,
            ]}>
            콜키지 가능
          </CustomText>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'white',
    paddingBottom: 2,
  },
  headerScroll: {
    paddingHorizontal: 12,
    columnGap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    marginVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFF',
  },
  filterChipActive: {
    backgroundColor: '#E9F5FB',
    borderColor: '#3CBBFF',
  },
  filterText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Pretendard-Regular',
  },
  filterTextActive: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3CBBFF',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
  },
});

export default MapFilterHeader;
