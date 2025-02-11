const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  ...defaultConfig,
  transformer: {
    minifierPath: 'metro-minify-terser', // Terser 적용
    minifierConfig: {
      keep_classnames: false, // 클래스명 난독화
      keep_fnames: false, // 함수명 난독화
      mangle: true, // 변수명 난독화
      output: {
        ascii_only: true, // 유니코드 문자 보호
      },
      compress: {
        dead_code: true, // 사용되지 않는 코드 제거
        drop_console: true, // 콘솔 제거 (보안 강화)
        drop_debugger: true, // 디버거 제거
        unused: true, // 사용하지 않는 변수 제거
        booleans: true, // Boolean 최적화
        conditionals: true, // 조건문 단순화
        if_return: true, // if 문 최적화
        sequences: true, // 코드 압축 최적화
        passes: 2, // 두 번 압축 실행
      },
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
