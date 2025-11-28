const StoreMapAddScript = (lat, lng) => `
  if (!window.map) {
    var mapContainer = document.getElementById('map');
    var options = {
      center: new kakao.maps.LatLng(${lat}, ${lng}),
      level: 3
    };
    window.map = new kakao.maps.Map(mapContainer, options);
  }

  var map = window.map;

  var markerImageUrl = "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(\`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 28 42">
  <path d="M14 0C6.27 0 0 6.8 0 15.2C0 24.2 14 42 14 42C14 42 28 24.2 28 15.2C28 6.8 21.73 0 14 0Z" fill="#3CBBFF"/>
  <circle cx="14" cy="15" r="8" fill="white"/>
  <path d="M14 18 l-3 -4 h6 z" fill="#3CBBFF"/>
</svg>\`);

  var markerImage = new kakao.maps.MarkerImage(
    markerImageUrl,
    new kakao.maps.Size(28, 42),
    { offset: new kakao.maps.Point(14, 42) }
  );


  if (!window.centerMarker) {
    window.centerMarker = new kakao.maps.Marker({
      position: map.getCenter(),
      map: map,
      title: '중앙 마커',
      image: markerImage,
      zIndex: 2
    });
  } else {
    window.centerMarker.setPosition(map.getCenter());
  }

  kakao.maps.event.addListener(map, 'idle', function () {
    const center = map.getCenter();
    window.ReactNativeWebView.postMessage(JSON.stringify({
      action: 'mapMoved',
      latitude: center.getLat(),
      longitude: center.getLng()
    }));
  });

  kakao.maps.event.addListener(map, 'center_changed', function() {
    if (window.centerMarker) {
      window.centerMarker.setPosition(map.getCenter());
    }
  });

  true;
`;
export default StoreMapAddScript;
