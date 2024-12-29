import React, { useEffect } from 'react';
import {
    Text,
    View,
    SafeAreaView,
    ScrollView,
    Button,
    Pressable
} from 'react-native';
const MyScreen = ({ navigation }) => {
    return (
        <SafeAreaView>
            <ScrollView>
                <Pressable><Text>MyScreen</Text></Pressable>
            </ScrollView>

        </SafeAreaView>


    );
};

export default MyScreen;