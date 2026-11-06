var map = new maplibregl.Map({
  container: 'map',
  style: 'https://openfreemap.org',
  center: [82.9346, 55.0084], // Новосибирск
  zoom: 10
});
map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

function circlePolygon(lat, lon, radius, color) {
  var points = [];
  for (var i = 0; i < 64; i++) {
    var angle = (i / 64) * 2 * Math.PI;
    var dLat = (radius * Math.cos(angle)) / 111320;
    var dLon = (radius * Math.sin(angle)) / (111320 * Math.cos(lat * Math.PI / 180));
    points.push([lon + dLon, lat + dLat]);
  }
  points.push(points[0]);
  return { 
    type: 'Feature', 
    properties: { color: color },
    geometry: { type: 'Polygon', coordinates: [points] } 
  };
}

map.on('load', function () {
  var features = [];
  for (var i = 0; i < zones.length; i++) {
    var z = zones[i];
    features.push(circlePolygon(z.lat, z.lon, z.radius, COLORS[z.color]));
  }

  map.addSource('zones', { 
    type: 'geojson',
    data: { type: 'FeatureCollection', features: features } 
  });

  map.addLayer({ 
    id: 'zones-fill', 
    type: 'fill', 
    source: 'zones',
    paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.3 } 
  });

  map.addLayer({ 
    id: 'zones-line', 
    type: 'line', 
    source: 'zones',
    paint: { 'line-color': ['get', 'color'], 'line-width': 2 } 
  });

  for (var j = 0; j < airports.length; j++) {
    var a = airports[j];
    new maplibregl.Marker()
      .setLngLat([a.lon, a.lat])
      .setPopup(new maplibregl.Popup().setHTML('<b>' + a.name + '</b>'))
      .addTo(map);
  }
});

var selected = null;
function selectPoint(lat, lon, name, zoomIn) {
  if (selected === null) {
    selected = new maplibregl.Marker({ color: '#1e4620' })
                 .setLngLat([lon, lat]).addTo(map);
  } else {
    selected.setLngLat([lon, lat]);
  }
  if (zoomIn) map.flyTo({ center: [lon, lat], zoom: 12 });
  showResult(lat, lon, name);
}

map.on('click', function (e) {
  selectPoint(e.lngLat.lat, e.lngLat.lng, null, false);
});

setupSearch(function (lat, lon, name) {
  selectPoint(lat, lon, name, true);
});
