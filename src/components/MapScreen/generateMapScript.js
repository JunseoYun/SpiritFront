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
  
  // 커스텀 마커 디자인 (SVG를 data URI로, 집 모양 아이콘)
  var customMarkerUri = 'data:image/svg+xml;charset=UTF-8,' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 32 32">' +
      '<circle cx="16" cy="16" r="16" fill="%2316BBFF"/>' +
      '<g transform="translate(16,16) scale(0.70) translate(-16,-16)">' +
        '<path d="M16 4 L4 14 L4 28 L13 28 L13 18 L19 18 L19 28 L28 28 L28 14 Z" fill="%23ffffff"/>' +
      '</g>' +
    '</svg>';
  
  // 커스텀 그림자 디자인 (SVG를 data URI로, 타원형 그림자)
  var customShadowUri = 'data:image/svg+xml;charset=UTF-8,' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 32 32">' +
      '<ellipse cx="16" cy="26" rx="10" ry="4" fill="%23000000" fill-opacity="0.3"/>' +
    '</svg>';
  
  // 가게 데이터를 주소별로 그룹화
  var storesArray = ${JSON.stringify(stores)};
  var storeGroups = {};
  storesArray.forEach(function(store) {
    var addr = store.locationDto.address;
    if (!storeGroups[addr]) {
      storeGroups[addr] = [];
    }
    storeGroups[addr].push(store);
  });
  
  window.storeMarkers = [];
  
  // 각 그룹별로 마커 생성
  for (var addr in storeGroups) {
    var group = storeGroups[addr];
    // 그룹의 첫 번째 가게 위치를 기준으로 마커 생성
    var markerPosition = new kakao.maps.LatLng(group[0].locationDto.latitude, group[0].locationDto.longitude);
    
    // 그림자 마커 생성 (마커 뒤에, zIndex 낮게)
    var shadowMarker = new kakao.maps.Marker({
      position: markerPosition,
      map: map,
      clickable: false,
      zIndex: 1,
      image: new kakao.maps.MarkerImage(
        customShadowUri,
        new kakao.maps.Size(26, 10),
        { offset: new kakao.maps.Point(12, 5) }
      )
    });
    
    var marker = new kakao.maps.Marker({
      position: markerPosition,
      map: map,
      title: group[0].name,
      zIndex: 2,
      image: new kakao.maps.MarkerImage(
        customMarkerUri,
        new kakao.maps.Size(26, 26)
      )
    });
    
    // 그룹 마커 클릭 시, 항상 그룹의 첫 번째 가게를 선택하도록 함
    (function(group) {
      kakao.maps.event.addListener(marker, 'click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'markerClicked', storeId: group[0].id }));
      });
    })(group);
    
    // 그룹 내 가게가 2개 이상이면, 마커의 위쪽(약간 오프셋된 위치)에 개수를 표시하는 오버레이 추가
if (group.length > 1) {
  var overlayContent = '<div style="pointer-events:none; position: relative; transform: translate(13px, -6px); background: #16BBFF; color: white; width: 14px; height: 14px; border-radius: 50%; border: 1px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-family: Arial, sans-serif; font-weight: bold;">' + group.length + '</div>';
  new kakao.maps.CustomOverlay({
    position: markerPosition,
    content: overlayContent,
    map: map,
    zIndex: 10
  });
}


    
    window.storeMarkers.push(marker);
  }
  
  kakao.maps.event.addListener(map, 'click', function() {
    window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'hideFlatList' }));
  });
  
  true;

  // 지도 클릭 이벤트 개선 (디바운스 적용)
if (!window.lastMapClick) {
  window.lastMapClick = 0;
}
kakao.maps.event.addListener(map, 'click', function() {
  var now = Date.now();
  if (now - window.lastMapClick > 300) { // 300ms 간격으로만 실행
    window.lastMapClick = now;
    window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'hideFlatList' }));
  }
});

`;

export default generateMapScript;
