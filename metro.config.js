const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // watchFolders 설정으로 파일 감시 문제 해결
  watchFolders: [
    // 현재 프로젝트 디렉터리
    __dirname,
  ],
  server: {
    // 메트로 서버에서 리스너 제한을 설정하여 오류 방지
    enhanceMiddleware: (middleware) => {
      middleware.getMaxListeners = () => 100;
      return middleware;
    },
  },
  resolver: {
    // 이곳에 필요한 추가 설정이 있으면 작성
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
