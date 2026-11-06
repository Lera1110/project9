var zones = [
  { name: 'Зона: Аэропорт Толмачёво', lat: 55.0126, lon: 82.6507, radius: 8000, color: 'yellow', text: 'Действует приаэродромная территория. Требуется согласование полетного плана с ОрВД.' },
  { name: 'Зона: Заельцовский парк', lat: 55.0750, lon: 82.8500, radius: 3000, color: 'green', text: 'Рекомендованная зона открытого неба. Полеты разрешены до 150 метров.' },
  { name: 'Зона: Центр Новосибирска', lat: 55.0302, lon: 82.9204, radius: 3500, color: 'red', text: 'Полеты полностью ЗАПРЕЩЕНЫ. Бесполетный городской подрайон.' }
];

var airports = [
  { name: 'Аэропорт Толмачёво', lat: 55.0126, lon: 82.6507 }
];

var COLORS = { 
  red: '#ef4444', 
  yellow: '#f59e0b',
  green: '#10b981'
};

function distanceMeters(lat1, lon1, lat2, lon2) {
  var r = 6371000; 
  var rad = Math.PI / 180;
  var dLat = (lat2 - lat1) * rad;
  var dLon = (lon2 - lon1) * rad;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * r * Math.asin(Math.sqrt(a));
}

function checkPoint(lat, lon) {
  var found = null;
  for (var i = 0; i < zones.length; i++) {
    var z = zones[i];
    if (distanceMeters(lat, lon, z.lat, z.lon) <= z.radius) {
      if (found === null || z.color === 'red') {
        found = z;
      }
    }
  }
  return found;
}

function showResult(lat, lon, placeName) {
  var zone = checkPoint(lat, lon);
  var title = document.getElementById('infoTitle');
  var info  = document.getElementById('infoText');
  var rules = document.getElementById('rulesText');
  var tag   = document.getElementById('infoTag');

  title.textContent = 'Точка выбрана: ' + (placeName || lat.toFixed(4) + ', ' + lon.toFixed(4));

  if (zone === null) {
    info.textContent  = 'В нашем списке для этой точки ограничений нет.';
    rules.textContent = 'Соблюдайте общие правила полётов.';
    tag.textContent   = '#можно_летать_свободно';
  } else {
    info.textContent  = zone.name;
    rules.textContent = zone.text;
    tag.textContent   = zone.color === 'red' ? '#Нельзя_летать_запретная_зона' : '#Ограничения_требуется_разрешение';
  }
}

function setupSearch(goTo) {
  var input = document.querySelector('.map-search-input');
  var icon  = document.querySelector('.search-field-icon');

  function runSearch() {
    var text = input.value.trim();
    if (text === '') return;

    var url = 'https://openstreetmap.org' + encodeURIComponent(text);
    fetch(url)
      .then(function (answer) { return answer.json(); })
      .then(function (data) {
        if (data.length === 0) {
          alert('Адрес не найден.');
        } else {
          goTo(parseFloat(data[0].lat), parseFloat(data[0].lon), text);
        }
      })
      .catch(function () { alert('Не удалось выполнить поиск.'); });
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') runSearch();
  });
  icon.addEventListener('click', runSearch);
}
