import { StyleSheet } from 'react-native';

const SignUpstyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  linkBold: {
    textAlign: 'left',
    fontWeight: '700',
    paddingLeft: 30,
    paddingBottom: 10,
  },
  input: {
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 10,
    height: 40,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputPh: {
    marginLeft: 30,
    marginRight: 10,
    marginBottom: 10,
    height: 40,
    backgroundColor: '#F1F1F1',
    borderRadius: 10,
    paddingHorizontal: 10,
    width: 220,
  },
  mBtn1: {
    backgroundColor: '#E2E2E2',
    paddingVertical: 10,
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    width: 110,
    height: 40,
    lineHeight: 40,
  },
  mBtn2: {
    backgroundColor: '#80D2F4',
    fontWeight: '500',
    paddingVertical: 10,
    padding: 10,
    alignItems: 'center',
    borderRadius: 10,
    width: 110,
    height: 40,
    lineHeight: 40,
  },
  linkOrange: {
    color: '#EE414C',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: '200',
    paddingLeft: 50,
    paddingRight: 50,
    paddingBottom: 6,
  },
  linkBk: {
    color: 'gray',
    textAlign: 'left',
    fontSize: 10,
    fontWeight: '200',
    paddingLeft: 50,
    paddingRight: 50,
    paddingBottom: 30,
  },
  LoginButton: {
    fontWeight: '500',
    paddingHorizontal: 110,
    paddingVertical: 10,
    marginTop: 70,
    margin: 30,
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  activeButton: {
    backgroundColor: '#80D2F4',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC', // 비활성화되었을 때 배경색
  },
  LoginText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    padding: 5,

  },


});

export default SignUpstyles;