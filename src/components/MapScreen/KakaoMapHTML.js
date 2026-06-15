import Config from 'react-native-config';

const KakaoMapHTML = () => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>Kakao Map</title>
    <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${Config.KAKAO_APP_JAVASCRIPT}"></script>
    <style>
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
      }
      #map {
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        if (typeof kakao !== "undefined" && kakao.maps) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'mapLoaded' }));
        } else {
        }
      });
    </script>
  </body>
  </html>
`;

export default KakaoMapHTML;
