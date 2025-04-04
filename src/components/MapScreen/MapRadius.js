import React, {useState} from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const {width} = Dimensions.get('window');

const MapRadius = ({setRadiusint}) => {
  const [selectedDistance, setSelectedDistance] = useState(2);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const distanceOptions = [1, 2, 3, 5];

  const handleSelect = distance => {
    setSelectedDistance(distance);
    setDropdownVisible(false);
    setRadiusint(distance);
  };

  return (
    <>
      {/* 외부 클릭 감지를 위한 오버레이 */}
      {dropdownVisible && (
        <Pressable
          style={styles.overlay}
          onPress={() => setDropdownVisible(false)}
        />
      )}

      <View style={styles.buttonTop}>
        <Pressable
          style={styles.searchView}
          onPress={() => setDropdownVisible(prev => !prev)}>
          <Text style={styles.buttonTextTop}>{selectedDistance}km</Text>
          <Entypo
            name="chevron-small-down"
            size={20}
            color="#5F5F5F"
            style={{marginLeft: 5, alignItems: 'center'}}
          />
        </Pressable>

        {dropdownVisible && (
          <View style={styles.dropdown}>
            {distanceOptions.map(item => (
              <Pressable
                key={item}
                style={[styles.option]}
                onPress={() => handleSelect(item)}>
                <Text
                  style={[
                    styles.optionText,
                    item === selectedDistance && styles.selectedOptionText,
                  ]}>
                  {item}km
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  buttonTop: {
    position: 'absolute',
    marginLeft: '3%',
    zIndex: 101,
    ...Platform.select({
      ios: {
        top: '9%',
      },
      android: {
        top: '5%',
      },
    }),
  },
  searchView: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 5,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 10,
  },
  buttonTextTop: {
    color: 'black',
    fontSize: 15,
    fontWeight: '400',
    paddingRight: 7,
    borderRightWidth: 0.5,
    borderColor: 'gray',
  },
  dropdown: {
    marginTop: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    paddingVertical: 5,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  option: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  },
  selectedOption: {
    backgroundColor: '#16BBFF22',
  },
  selectedOptionText: {
    color: '#45c9ff',
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'transparent',
  },
});

export default MapRadius;
