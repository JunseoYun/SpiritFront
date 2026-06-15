import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const MapPreview = ({mapHtml, onMapLoaded, webViewRef}) => {
  const handleMessage = event => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.action === 'mapLoaded') {
        onMapLoaded?.();
      }
    } catch (e) {
    }
  };

  return (
    <View style={styles.mapPreviewContainer}>
      <View style={styles.mapBox}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{html: mapHtml}}
          onMessage={handleMessage}
          style={styles.webView}
          scrollEnabled={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapPreviewContainer: {
    marginHorizontal: 18,
  },
  mapBox: {
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  webView: {
    flex: 1,
  },
});

export default MapPreview;
