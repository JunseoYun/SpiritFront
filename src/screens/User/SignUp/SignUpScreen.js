import React, { useEffect } from 'react';
import {
    Text,
    View,
    SafeAreaView,
    ScrollView,
    Button,
    Pressable
} from 'react-native';

import SignUpstyles from './SignUpStyles';

const SignUpScreen = ({ navigation }) => {
    return (
        <SafeAreaView>
            <ScrollView>
                <Pressable><Text>SignUpScreen</Text></Pressable>
            </ScrollView>

        </SafeAreaView>


    );
};

export default SignUpScreen;