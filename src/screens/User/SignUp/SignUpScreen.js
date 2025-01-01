import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    Text,
    Pressable,
    View,
    TextInput,
    Alert,
} from 'react-native';

import SignUpstyles from './SignUpStyles';

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verifypassword, setverifyPassword] = useState('');
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [verifyemail, setVerifyemail] = useState('');
    const [showPasswordError, setShowPasswordError] = useState(false);
    const [showNicknameError, setShowNicknameError] = useState(false);
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const handleEmailChange = text => {
        setEmail(text);
    };
    const handlesetVerifyemailChange = text => {
        setVerifyemail(text);
    };
    const handlpasswordChange = text => {
        setPassword(text);
    };
    const handlverifypasswordChange = text => {
        setverifyPassword(text);
    };
    const handleNameChange = text => {
        setName(text);
    };
    const handlNicknameChange = text => {
        setNickname(text);
    };

    const SendEmail = () => { };
    const VerifyEmail = () => { };

    const SignUp = () => { };
    return (
        <SafeAreaView style={SignUpstyles.container}>
            <View >
                <View>
                    <View style={{ marginBottom: 20, marginTop: 30 }}>
                        <Text style={SignUpstyles.linkBold}>이름</Text>
                        <TextInput
                            style={SignUpstyles.input}
                            placeholder="한글 또는 영문으로 입력해주세요."
                            value={name}
                            onChangeText={handleNameChange}
                        />
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={SignUpstyles.linkBold}>이메일</Text>

                        <View style={{ flexDirection: 'row' }}>
                            <TextInput
                                style={SignUpstyles.inputPh}
                                placeholder="이메일"
                                value={email}
                                onChangeText={handleEmailChange}
                            />
                            <Pressable style={SignUpstyles.mBtn1} onPress={SendEmail}>
                                <Text style={{ color: 'gray', fontWeight: '600' }}>
                                    인증번호 요청
                                </Text>
                            </Pressable>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <TextInput
                                style={SignUpstyles.inputPh}
                                placeholder="인증번호를 입력해주세요."
                                value={verifyemail}
                                onChangeText={handlesetVerifyemailChange}
                            />
                            <Pressable style={SignUpstyles.mBtn2} onPress={VerifyEmail}>
                                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                    인증번호 확인
                                </Text>
                            </Pressable>
                        </View>
                        {isTimerRunning && <Timer />}
                    </View>

                    <View style={{ marginBottom: 20 }}>
                        <Text style={SignUpstyles.linkBold}>비밀번호</Text>
                        <TextInput
                            style={SignUpstyles.input}
                            placeholder="비밀번호를 입력해주세요."
                            value={password}
                            onChangeText={handlpasswordChange}
                        />
                        <TextInput
                            style={SignUpstyles.input}
                            placeholder="비밀번호를 다시한번 입력해주세요."
                            value={verifypassword}
                            onChangeText={handlverifypasswordChange}
                        />
                        {showPasswordError && (
                            <Text style={SignUpstyles.linkOrange}>비밀번호가 일치하지 않습니다.</Text>
                        )}
                        <Text style={SignUpstyles.linkBk}>
                            영문, 숫자, 특수문자 중 2종류 이상을 조합하여 8~20자리로 설정해
                            주세요.
                        </Text>
                    </View>
                    <Text style={SignUpstyles.linkBold}>닉네임</Text>
                    <TextInput
                        style={SignUpstyles.input}
                        placeholder="닉네임을 입력해주세요."
                        value={nickname}
                        onChangeText={handlNicknameChange}
                    />
                    {showNicknameError && (
                        <Text style={SignUpstyles.linkOrange}>이미 사용중인 닉네임입니다.</Text>
                    )}
                </View>
                <View>
                    <Pressable
                        style={[
                            SignUpstyles.LoginButton,
                            isButtonEnabled ? SignUpstyles.activeButton : SignUpstyles.disabledButton,
                        ]}
                        onPress={SignUp}
                        disabled={!isButtonEnabled}>
                        <Text style={SignUpstyles.LoginText}>시작하기</Text>
                    </Pressable>
                </View>
            </View>

        </SafeAreaView>


    );
};

export default SignUpScreen;