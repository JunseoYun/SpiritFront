const StoreMapScript = (
  lat,
  lng,
  storeLat,
  storeLong,
  storeName = '',
  scaledFontSize,
) => `

  if (!window.map) {
    var mapContainer = document.getElementById('map');
    var options = {
      center: new kakao.maps.LatLng(${storeLat}, ${storeLong}), // 지도 중심을 가게 위치로 설정
      level: 3
    };
    window.map = new kakao.maps.Map(mapContainer, options);
  }

  var map = window.map;
  var storeLabelText = ${JSON.stringify(storeName || '')};

  var userMarkerImageUrl = "data:image/svg+xml;charset=UTF-8," +
         encodeURIComponent(\`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 400 400">
  <!-- Outer translucent circle -->
  <circle cx="200" cy="200" r="200" fill="rgba(0, 109, 254, 0.2)" />

  <!-- Center white dot -->
  <circle cx="200" cy="200" r="90" fill="#ffffff" />
  <!-- Middle solid circle -->
  <circle cx="200" cy="200" r="60" fill="#006DFE" />

</svg>
\`);

  var userMarkerImage = new kakao.maps.MarkerImage(
    userMarkerImageUrl,
     new kakao.maps.Size(40, 40),
    { offset: new kakao.maps.Point(20, 20) }
  );

  // 현재 위치 마커
  if (!window.currentMarker) {
    window.currentMarker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(${lat}, ${lng}),
      map: map,
      title: '현재 위치',
      zIndex: 1,
      image: userMarkerImage
    });
  } else {
    window.currentMarker.setPosition(new kakao.maps.LatLng(${lat}, ${lng}));
    window.currentMarker.setImage(userMarkerImage);
  }

  // 기존 가게 마커 제거
  if (window.storeMarkers) {
    window.storeMarkers.forEach(marker => marker.setMap(null));
  }
  window.storeMarkers = [];

  if (!window.__storeLabelStyle) {
    window.__storeLabelStyle =
      "position: relative;" +
      "padding: 8px 14px;" +
      "border-radius: 14px;" +
      "font-size: ${scaledFontSize}px;" +
      "font-family: Pretendard, Arial, sans-serif;" +
      "font-weight: 600;" +
      "color: #ffffff;" +
      "background: #3CBBFF;" +
      "box-shadow: 0 3px 8px rgba(60,187,255,0.35);" +
      "white-space: nowrap;" +
      "pointer-events: none;" +
      "border: none;";
  }

  if (window.storeNameOverlay) {
    try { window.storeNameOverlay.setMap(null); } catch (_e) {}
    window.storeNameOverlay = null;
  }

  var resolvedLabel = (storeLabelText && storeLabelText.trim().length > 0)
    ? storeLabelText
    : '가게 위치';
  var storeMarkerPosition = new kakao.maps.LatLng(${storeLat}, ${storeLong});
  var labelEl = document.createElement('div');
  labelEl.style.cssText = window.__storeLabelStyle;
  labelEl.textContent = resolvedLabel;
  var arrowEl = document.createElement('div');
  arrowEl.style.cssText = "position:absolute; bottom:-5px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid #3CBBFF;";
  labelEl.appendChild(arrowEl);

  window.storeNameOverlay = new kakao.maps.CustomOverlay({
    position: storeMarkerPosition,
    content: labelEl,
    map: map,
    yAnchor: 0.5,
    zIndex: 20
  });


  // 지도 클릭 이벤트 추가
  kakao.maps.event.addListener(map, 'click', function() {
    window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'hideFlatList' }));
  });

  true;
`;

export default StoreMapScript;
