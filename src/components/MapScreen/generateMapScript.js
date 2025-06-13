const generateMapScript = (lat, lng, stores, showCurrentMarker = true) => `
  if (!window.map) {
    var mapContainer = document.getElementById('map');
    var options = {
      center: new kakao.maps.LatLng(${lat}, ${lng}),
      level: 3
    };
    window.map = new kakao.maps.Map(mapContainer, options);

    kakao.maps.event.addListener(window.map, 'idle', function () {
      const center = window.map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        action: 'mapMoved',
        latitude: parseFloat(center.getLat().toFixed(5)),
        longitude: parseFloat(center.getLng().toFixed(5))
      }));
    });
  }

  var map = window.map;

  ${
    showCurrentMarker
      ? `
    if (!window.currentMarker) {
      window.currentMarker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(${lat}, ${lng}),
        map: map,
        title: '현재 위치',
        zIndex: 1
      });
    } else {
      window.currentMarker.setPosition(new kakao.maps.LatLng(${lat}, ${lng}));
      window.currentMarker.setMap(map);
    }
  `
      : `
    if (window.currentMarker) {
      window.currentMarker.setMap(map); // 👉 마커 제거
    }
  `
  }

  if (window.storeMarkers) {
    window.storeMarkers.forEach(marker => marker.setMap(null));
  }

if (window.overlayMarkers) {
  window.overlayMarkers.forEach(customOverlay => customOverlay.setMap(null));
}

  var customMarkerUri = 'data:image/svg+xml;charset=UTF-8,' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 32 32">' +
      '<circle cx="16" cy="16" r="16" fill="%2316BBFF"/>' +
      '<g transform="translate(16,16) scale(0.70) translate(-16,-16)">' +
        '<path d="M16 4 L4 14 L4 28 L13 28 L13 18 L19 18 L19 28 L28 28 L28 14 Z" fill="%23ffffff"/>' +
      '</g>' +
    '</svg>';

  var storesArray = ${JSON.stringify(stores)};
  var storeGroups = {};
  storesArray.forEach(function(store) {
    var addr = store.locationDto.address;
    if (!storeGroups[addr]) {
      storeGroups[addr] = [];
    }
    storeGroups[addr].push(store);
  });
window.overlayMarkers = [];
  window.storeMarkers = [];
  window.currentOverlay = null;

  for (var addr in storeGroups) {
    var group = storeGroups[addr];
    var markerPosition = new kakao.maps.LatLng(group[0].locationDto.latitude, group[0].locationDto.longitude);
    
    var marker = new kakao.maps.Marker({
      position: markerPosition,
      map: map,
      title: group[0].name,
      zIndex: 2,
      image: new kakao.maps.MarkerImage(
        customMarkerUri,
        new kakao.maps.Size(24, 24)
      )
    });

    // ✅ 가게 리스트 오버레이 생성
    function createStoreListOverlay(group, markerPosition) {
     window.isStoreListClicked = true;
      if (window.currentOverlay) {
        window.currentOverlay.setMap(null);
      }

      var overlayContent = document.createElement('div');
      overlayContent.style.cssText = "background:white; padding:10px; border-radius:10px; box-shadow:0px 2px 5px rgba(0,0,0,0.2); font-size:14px; width:60vw; border:1px solid #ddd; position:relative; transform:translateY(-120%);";
      
      // ✅ 리스트 내부 클릭 시 닫히지 않도록 방지
      overlayContent.addEventListener("click", function(event) {
        event.stopPropagation();
        // ✅ 리스트 내부 클릭 감지
      });

      group.forEach((store, index) => {
        var storeItem = document.createElement('div');
        storeItem.innerHTML = '<div style="display:flex; align-items:center; padding:10px; cursor:pointer;"><div style="width:8px; height:8px; background:#16BBFF; border-radius:50%; margin-right:8px;"></div>' +'<span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block;">' +store.name +'</span>' + '</div>';

        // ✅ 마지막 아이템의 아래 테두리는 없애기
        if (index !== group.length - 1) {
          storeItem.style.borderBottom = "1px solid #eee";
        }

        storeItem.onclick = function(event) {
          event.stopPropagation(); // ✅ 지도 클릭 이벤트 방지
          window.isStoreListClicked = true; // ✅ 리스트 내부 클릭 감지

          // ✅ storeId React Native로 전달
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            action: 'markerClicked', 
            storeId: store.id 
          }));
        };

        overlayContent.appendChild(storeItem);
      });

      var overlay = new kakao.maps.CustomOverlay({
        content: overlayContent,
        position: markerPosition,
        map: map,
        zIndex:10,
        yAnchor: 0 // ✅ 마커 위쪽에 배치
      });

      window.currentOverlay = overlay;
    }

    // ✅ 마커 클릭 시 오버레이 표시 (새로운 리스트 클릭하면 기존 리스트 닫힘)
    (function(group, markerPosition) {
      kakao.maps.event.addListener(marker, 'click', function() {
        if (window.currentOverlay) {
          window.currentOverlay.setMap(null);
          window.currentOverlay = null;
        }

        if (group.length > 1) {
          createStoreListOverlay(group, markerPosition);
        } 
          window.ReactNativeWebView.postMessage(JSON.stringify({ 
            action: 'markerClicked', 
            storeId: group[0].id 
          }));
        
      });
    })(group, markerPosition);

    // 🔹 마커 개수 표시 (그룹이 2개 이상일 경우)
    if (group.length > 1) {
      var overlayElement = document.createElement('div');
      overlayElement.style.cssText = "pointer-events:none; position:relative; transform:translate(12px, -4px); background:#16BBFF; color:white; width:14px; height:14px; border-radius:50%; border:0.5px solid #ffffff; display:flex; align-items:center; justify-content:center; font-size:10px; font-family:Arial,sans-serif; font-weight:bold;";
      overlayElement.innerText = group.length;
      
      var customOverlay = new kakao.maps.CustomOverlay({
        position: markerPosition,
        content: overlayElement,
        map: map,
        zIndex: 3
      });
      window.overlayMarkers.push(customOverlay);
    }
    
    window.storeMarkers.push(marker);
  }

  // ✅ 지도 클릭 시, 오버레이를 닫는 로직 (리스트 내부 클릭 제외!!)
  if (!window.lastMapClick) {
    window.lastMapClick = 0;
    kakao.maps.event.addListener(map, 'click', function(event) {
      var now = Date.now();
      if (now - window.lastMapClick > 300) { 
        window.lastMapClick = now;

        // ✅ 리스트 내부 클릭이면 닫지 않음
        if (window.isStoreListClicked) {
          window.isStoreListClicked = false; // ✅ 플래그 초기화
          return;
        }

        if (window.currentOverlay) {
          window.currentOverlay.setMap(null);
          window.currentOverlay = null;
        }
      }
    });
  }

  true;
`;

export default generateMapScript;
