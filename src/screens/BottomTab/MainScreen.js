import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Button,
  Pressable
} from 'react-native';
const MainScreen = ({ navigation }) => {

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [stores, setStores] = useState([]);
  const [recommStores, setRecommStores] = useState([]);
  const [recommCategory, setRecommCategory] = useState(null);
  const [recommReason, setRecommReason] = useState(null);
  const [recentStores, setRecentStores] = useState([]);
  const [liveHotStores, setLiveHotStores] = useState([]);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [weather, setWeather] = useState({
    temp: 0,
    condition: '',
    rain_probability: 0,
  });
  const [storeactiveIndex, setStoreActiveIndex] = useState(null);
  const liveHotRef = useRef(null);
  const recentRef = useRef(null);
  const [liveHotLoaded, setLiveHotLoaded] = useState(false);
  const [recentLoaded, setRecentLoaded] = useState(false);
  // const {recommendCategory} = useRecommendation();

  



  return (
    <SafeAreaView>
      <ScrollView>
        <Pressable><Text>MainScreen</Text></Pressable>
      </ScrollView>

    </SafeAreaView>


  );
};

export default MainScreen;