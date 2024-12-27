import React, { useEffect } from 'react';
import {
    Text,
    View,
    SafeAreaView,
    ScrollView,
    Button,
    Pressable
} from 'react-native';
const UserScreen = ({ navigation }) => {
    return (
        <SafeAreaView>
            <ScrollView>
                <Pressable><Text>UserScreen</Text></Pressable>
            </ScrollView>

        </SafeAreaView>


    );
};

export default UserScreen;