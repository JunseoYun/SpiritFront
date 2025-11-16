import React, {useState, useEffect, useMemo} from 'react';
import {StyleSheet, View, Platform, Dimensions} from 'react-native';
import {WebView} from 'react-native-webview';
import Config from 'react-native-config';

const StaticKakaoMap = ({latitude, longitude, labelText = '매장 위치'}) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const screenHeight = Dimensions.get('window').height;

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

  // 플랫폼별 중심 보정값 — Android는 더 위로 밀림 현상 대비
  const offset = 0.00025;
  const adjustedLat = lat + offset;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
      <title>Kakao Map</title>
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
        Config.KAKAO_APP_JAVASCRIPT
      }"></script>
      <style>
        html, body, #map {
          margin:0;
          padding:0;
          width:100%;
          height:100%;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const initMap = () => {
          if (typeof kakao === 'undefined' || !kakao.maps) return;

          const mapContainer = document.getElementById('map');
          const mapOption = {
            center: new kakao.maps.LatLng(${adjustedLat}, ${lng}),
            level: 3
          };
          const map = new kakao.maps.Map(mapContainer, mapOption);
          map.setDraggable(false);
          map.setZoomable(false);

          // 📍 지도 로드 후 중심 재조정 (Android offset fix)
          kakao.maps.event.addListener(map, 'tilesloaded', function() {
            setTimeout(() => {
              map.setCenter(new kakao.maps.LatLng(${adjustedLat}, ${lng}));
            }, 200);
          });

          const markerWrapper = document.createElement('div');
          markerWrapper.style.display = 'flex';
          markerWrapper.style.flexDirection = 'column';
          markerWrapper.style.alignItems = 'center';

          const markerContent = document.createElement('div');
          markerContent.style.width = '20px';
          markerContent.style.height = '20px';
          markerContent.style.background = '#3bccff';
          markerContent.style.borderRadius = '50% 50% 50% 0';
          markerContent.style.transform = 'rotate(-45deg)';
          markerContent.style.boxShadow = '0 0 2px rgba(0, 0, 0, 0.7)';
          markerContent.style.position = 'relative';
          markerContent.style.border = '2px solid #fff';

          const innerDot = document.createElement('div');
          innerDot.style.width = '8px';
          innerDot.style.height = '8px';
          innerDot.style.background = '#fff';
          innerDot.style.borderRadius = '50%';
          innerDot.style.position = 'absolute';
          innerDot.style.top = '6px';
          innerDot.style.left = '6px';
          innerDot.style.transform = 'rotate(45deg)';
          markerContent.appendChild(innerDot);

          const label = document.createElement('div');
          label.innerText = '${labelText
            .replace(/'/g, "\\'")
            .replace(/\n/g, ' ')}';
          label.style.marginTop = '6px';
          label.style.padding = '3px 6px';
          label.style.borderRadius = '6px';
          label.style.fontSize = '15px';
          label.style.fontWeight = 700;
          label.style.color = '#333';
          label.style.textShadow =
            '1px 1px 0 #fff, -1px 1px 0 #fff, 1px -1px 0 #fff, -1px -1px 0 #fff';

          markerWrapper.appendChild(markerContent);
          markerWrapper.appendChild(label);

          const marker = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(${lat}, ${lng}),
            content: markerWrapper,
            yAnchor: 1,
          });
          marker.setMap(map);
        };

        // Kakao API 로드 완료될 때까지 대기
        const waitForKakao = setInterval(() => {
          if (typeof kakao !== 'undefined' && kakao.maps) {
            clearInterval(waitForKakao);
            initMap();
          }
        }, 100);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        key={`${lat}-${lng}-${Date.now()}`}
        originWhitelist={['*']}
        mixedContentMode="always"
        scrollEnabled={false}
        pointerEvents="none"
        source={{html}}
        style={{flex: 1, backgroundColor: 'transparent'}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 7,
    borderRadius: 9,
    height: 140,
    borderWidth: 1,
    borderColor: '#E8F6FF',
    overflow: 'hidden',
    marginBottom: 15,
  },
});

export default StaticKakaoMap;
