import React, { useEffect } from 'react';
import {
    Text,
    View,
    SafeAreaView,
    ScrollView,
    Button,
    Pressable
} from 'react-native';
const MapScreen = ({ navigation }) => {
    return (
        <SafeAreaView>
            <ScrollView>
                <Pressable><Text>MapScreen</Text></Pressable>
            </ScrollView>

        </SafeAreaView>


    );
};

export default MapScreen;