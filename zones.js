var zones = [
{ name: "Толмачёво: приаэродромная территория", lat: 55.0126, lon: 82.6507,
radius: 15000, color: "yellow",
text: "Полёты только по согласованию с органами ОрВД." },
{ name: "Новосибирск-Северный: приаэродромная территория", lat: 55.0900, lon: 82.9000,
radius: 6000, color: "yellow",
text: "Полёты только по согласованию с органами ОрВД." },
{ name: "Толмачёво: ядро аэродрома", lat: 55.0126, lon: 82.6507,
radius: 5000, color: "red",
text: "Полёты запрещены." }
];

var airports = [
{ name: "Аэропорт Толмачёво", lat: 55.0126, lon: 82.6507 },
{ name: "Аэродром Новосибирск-Северный", lat: 55.0900, lon: 82.9000 }
];

var COLORS = { red: "#ef4444", yellow: "#f59e0b" };

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
if (found === null || z.color === "red") {
found = z;
}
}
}
return found;
}

function showResult(lat, lon, placeName) {
var zone = checkPoint(lat, lon);
var title = document.getElementById("infoTitle");
var info = document.getElementById("infoText");
var rules = document.getElementById("rulesText");
var tag = document.getElementById("infoTag");

if (!title || !info || !rules || !tag) {
console.error("Не найдены элементы панели: проверьте id infoTitle, infoText, rulesText, infoTag в index.html");
return;
}

title.textContent = "Точка выбрана: " +
(placeName || lat.toFixed(4) + ", " + lon.toFixed(4));

if (zone === null) {
info.textContent = "В нашем списке для этой точки ограничений нет.";
rules.textContent = "Соблюдайте общие правила полётов.";
tag.textContent = "свободно";
tag.className = "reason-hashtag tag-green";
} else {
info.textContent = zone.name;
rules.textContent = zone.text;
tag.textContent = zone.color === "red" ? "запрещено" : "ограничения";
tag.className = "reason-hashtag tag-" + zone.color;
}
}

function setupSearch(goTo) {
var input = document.querySelector(".map-search-input");
var icon = document.querySelector(".search-field-icon");

if (!input) {
console.error("Не найдено поле поиска с классом .map-search-input");
return;
}

function runSearch() {
var text = input.value.trim();
if (text === "") return;

var m = text.match(/^(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)$/);
if (m) {
var lat = parseFloat(m[1].replace(",", "."));
var lon = parseFloat(m[2].replace(",", "."));
goTo(lat, lon, null);
return;
}

var url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
encodeURIComponent(text);
fetch(url)
.then(function (answer) { return answer.json(); })
.then(function (data) {
if (data.length === 0) {
alert("Адрес не найден.");
} else {
goTo(parseFloat(data[0].lat), parseFloat(data[0].lon), text);
}
})
.catch(function () { alert("Не удалось выполнить поиск."); });
}

input.addEventListener("keydown", function (e) {
if (e.key === "Enter") runSearch();
});
if (icon) icon.addEventListener("click", runSearch);

runSearch();
}