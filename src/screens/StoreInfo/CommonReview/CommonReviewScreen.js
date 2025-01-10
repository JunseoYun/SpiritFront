import React, { useEffect } from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet
} from 'react-native';
const CommonReviewScreen = ({ navigation }) => {
  return (
    <SafeAreaView>
      <ScrollView>
        <Pressable><Text>CommonReviewScreen</Text></Pressable>
      </ScrollView>

    </SafeAreaView>


  );
};

const styles = StyleSheet.create({
});

export default CommonReviewScreen;