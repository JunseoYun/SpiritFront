import React, { useEffect } from 'react';
import {
    Text,
    SafeAreaView,
    ScrollView,
    Pressable
} from 'react-native';
const StoreMenuScreen = ({ navigation }) => {
    return (
        <SafeAreaView>
            <ScrollView>
                <Pressable><Text>StoreMenuScreen</Text></Pressable>
            </ScrollView>

        </SafeAreaView>


    );
};

export default StoreMenuScreen;