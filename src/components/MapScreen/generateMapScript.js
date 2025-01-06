const generateMapScript = (lat, lng, stores) => `
  if (!window.map) {
    var mapContainer = document.getElementById('map');
    var options = {
      center: new kakao.maps.LatLng(${lat}, ${lng}),
      level: 3
    };
    window.map = new kakao.maps.Map(mapContainer, options);
  }

  var map = window.map;

  if (!window.currentMarker) {
    window.currentMarker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(${lat}, ${lng}),
      map: map,
      title: '현재 위치',
      zIndex: 1
    });
  } else {
    window.currentMarker.setPosition(new kakao.maps.LatLng(${lat}, ${lng}));
  }

  if (window.storeMarkers) {
    window.storeMarkers.forEach(marker => marker.setMap(null));
  }

  window.storeMarkers = ${JSON.stringify(stores)}.map(store => {
    var markerPosition = new kakao.maps.LatLng(store.latitude, store.longitude);

    var marker = new kakao.maps.Marker({
      position: markerPosition,
      map: map,
      title: store.storeName,
      zIndex: 2,
      image: new kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
        new kakao.maps.Size(24, 35)
      )
    });

    kakao.maps.event.addListener(marker, 'click', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'markerClicked', storeId: store.storeId }));
    });

    return marker;
  });

  kakao.maps.event.addListener(map, 'click', function() {
    window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'hideFlatList' }));
  });

  true;
`;

export default generateMapScript;
