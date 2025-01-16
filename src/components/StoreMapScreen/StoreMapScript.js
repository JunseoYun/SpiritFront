const StoreMapScript = (lat, lng, storeLat, storeLong) => 
  `

  if (!window.map) {
    var mapContainer = document.getElementById('map');
    var options = {
      center: new kakao.maps.LatLng(${storeLat}, ${storeLong}), // 지도 중심을 가게 위치로 설정
      level: 3
    };
    window.map = new kakao.maps.Map(mapContainer, options);
  }

  var map = window.map;

  // 현재 위치 마커
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

  // 기존 가게 마커 제거
  if (window.storeMarkers) {
    window.storeMarkers.forEach(marker => marker.setMap(null));
  }

  // 가게 위치 마커 추가
  var storeMarkerPosition = new kakao.maps.LatLng(${storeLat}, ${storeLong});
  var storeMarker = new kakao.maps.Marker({
    position: storeMarkerPosition,
    map: map,
    title: '가게 위치',
    zIndex: 2,
    image: new kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
      new kakao.maps.Size(24, 35)
    )
  });


  // 지도 클릭 이벤트 추가
  kakao.maps.event.addListener(map, 'click', function() {
    window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'hideFlatList' }));
  });

  true;
`;

export default StoreMapScript;
