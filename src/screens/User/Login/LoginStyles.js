
import { StyleSheet } from 'react-native';

const LoginStyles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
    },
    box1: {
        height: 330,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageStyle: {
        width: 240,
        resizeMode: 'contain',
    },
    input: {
        marginLeft: 50,
        marginRight: 50,
        marginBottom: 20,
        height: 40,
        borderColor: '#ced4da',
        borderBottomWidth: 2,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        borderRadius: 5,
        elevation: 2,
    },
    inputFocused: {
        borderColor: '#80D2F4',
        elevation: 5,
    },
    linksContainertext: {
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 60,
    },
    separator: {
        fontWeight: 'bold',
        borderColor: 'gray',
        borderWidth: 1,
    },
    LoginButton: {
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#80D2F4',
        paddingHorizontal: 110,
        paddingVertical: 10,
        margin: 50,
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 10,
    },
    LoginButtonText: {
        fontSize: 16,
        fontWeight: '400',
    },
});

export default LoginStyles;
