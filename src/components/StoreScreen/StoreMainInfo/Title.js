import React, {useState, useRef, useEffect} from 'react';
import {View, Text, Pressable, StyleSheet, Animated} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Title = ({
  storeName,
  startUpdate,
  handleReport,
  handleReportList,
  handleStoreInfo,
  isUpdatable,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    if (dropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(false));
    } else {
      setDropdownVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <View style={styles.Storetitleview}>
      <View style={styles.titleView2}>
        <Text style={styles.Storetitle}>{storeName}</Text>
      </View>

      <View>
        <Pressable
          onPress={toggleDropdown}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="ellipsis-vertical" size={20} color="#333" />
        </Pressable>

        {dropdownVisible && (
          <Pressable
            style={styles.backdrop}
            onPress={toggleDropdown}
            accessibilityLabel="Close menu"
          />
        )}

        {dropdownVisible && (
          <Animated.View
            style={[
              styles.dropdown,
              {transform: [{translateY: dropdownTranslateY}]},
            ]}>
            {isUpdatable && (
              <Pressable
                style={styles.dropdownItem}
                onPress={() => {
                  toggleDropdown();
                  startUpdate();
                }}>
                <Text style={styles.dropdownText}>매장 관리</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.dropdownItem}
              onPress={() => {
                toggleDropdown();
                handleReport();
              }}>
              <Text style={styles.dropdownText}>매장 제보·신고</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Storetitleview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
  },
  titleview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 18,
  },
  titleView2: {
    flexDirection: 'row',
    flex: 1,
  },
  titlebtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  Storetitle: {
    maxWidth: '90%',
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  dropdown: {
    position: 'absolute',
    top: 25,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    paddingVertical: 5,
    width: 150,
    zIndex: 999,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    bottom: -1000,
    left: -1000,
    right: -1000,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
  },
});

export default Title;
