const centers = {
  nyc: [40.7128, -74.0059],
  dc: [38.9072, -77.0369]
}

const map = L.map('map', { 
  center: centers.nyc, 
  zoom: 11,
  maxZoom: 18,
  doubleClickZoom: false,
  inertia: false,
  tap: true
});
L.tileLayer( 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 
  {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  })
  .addTo(map);
  
const walkCircles = {};
const stops = {};
const stationPiesD3 = {};
let willWalk = mm(0.5);
let city = 'nyc';

const marker = L.marker(centers.nyc, { 
    draggable: 'true', 
    zIndexOffset: 1000,
    icon: new L.Icon.Default({ shadowSize: [0, 0]})
  })
  .on('drag', onMarkerDrag)
  .on('dragend', updateWalkingCircles)
  .addTo(map); 
const markerCircle = L.circle(centers.nyc, mm(0.5), 
  { 
    className: 'marker-circle',
    stroke: false,
    fillOpacity: 1
  })
  .addTo(map);
  
function focusMap(newCity) {
  city = newCity
  map.panTo(centers[city]);
  map.setZoom(11);
  marker.setLatLng(centers[city]);
  markerCircle.setLatLng(centers[city]);
  updateWalkingCircles();
}
  
function addWalkCircles(city) {
  const walkCirclesTemp = stops[city].map(o => L.circle(o.latlng, 100, 
    { 
      className: 'walk-circle', 
      stroke: false,
      fillOpacity: 1
    }));
  L.featureGroup(walkCirclesTemp).addTo(map);
  return walkCirclesTemp
}

function addStationPies(city) {
  const stationPies = stops[city].map(o => {
    const tipContent = document.createElement("div");
    tipContent.innerHTML = '<h1>' + o.name + '</h1>';
    o.serves.forEach(line => { 
      const img = new Image(20, 20);
      img.src = 'lineImages/' + city + '/'+ line + '.png';
      tipContent.appendChild(img);
    });
    
    return L.marker(o.latlng, 
      { icon: L.divIcon({ className: 'stop-icon' }) })
      .bindTooltip(L.tooltip().setContent(tipContent));
  })
  const spg = L.featureGroup(stationPies).addTo(map);
  return d3.selectAll(spg.getLayers().map(o => o.getElement()))
    .data(stops[city]).append('svg')
    .attr('viewBox','0 0 100 100')
    .attr('width','30%')
    .attr('class','stop-svg');
}

function makePies(stationPies) {
//  const arc = d3.arc()
//    .innerRadius(0)
//    .outerRadius(50)
//    .startAngle(0);    
//
//  stationPies.selectAll('slices')
//    .data(d => d.colors).enter()
//    .append('path')
//    .attr('transform', 'translate(50,50)')
//    .attr('d', (d, i, j) => arc({ endAngle: 2 * Math.PI * (1 - i / j.length)}))
//    .attr('fill', d => d)
}

// Get DC stops
d3.json('stations/dc.json', function(error, stopsJson) {
  stops.dc = stopsJson;
  walkCircles.dc = addWalkCircles('dc');
//  stationPiesD3.dc = addStationPies('dc');
//  makePies(stationPiesD3.dc);
});

// Get NYC stops
d3.json('stations/nyc.json', function(error, stopsJson) {
  stops.nyc = stopsJson;
  walkCircles.nyc = addWalkCircles('nyc');
  stationPiesD3.nyc = addStationPies('nyc');
  makePies(stationPiesD3.nyc);
  updateWalkingCircles();
});

function findNearestCity() {
  if (marker.getLatLng().distanceTo(L.latLng(centers.nyc)) < mm(100)) {
    city = 'nyc';
  } else {
    city = 'dc'
  }
}

// This happens as soon as the distance slider is moved
document.getElementById('distBar').addEventListener('input', distChange);
function distChange(){
  document.getElementById('distText').innerHTML = document.getElementById('distBar').value;
  willWalk = mm(document.getElementById('distBar').value);

  markerCircle.setRadius(willWalk);
  updateWalkingCircles();
}

map.on('click', onMapClick);
function onMapClick(e) {
  marker.setLatLng(e.latlng);
  markerCircle.setLatLng(marker.getLatLng());
  updateWalkingCircles();
}

function onMarkerDrag() {
  markerCircle.setLatLng(marker.getLatLng());
}

const visited = [];
const walkFromLine = []; 
function updateWalkingCircles() {
  findNearestCity();
  walkFromLine.fill(0);
  while (visited.length) {
    visited.pop().setRadius(0);
  }
    
  walkCircles[city].forEach((o, i) => {
    if ( o.getLatLng().distanceTo(marker.getLatLng()) <= willWalk ) {
      stops[city][i].servesIndex.forEach(l => {
        walkFromLine[l] = Math.max(
          walkFromLine[l] || 0, 
          willWalk - o.getLatLng().distanceTo(marker.getLatLng())
        )
      });
    } 
  })
  
  walkCircles[city].forEach((o, i) => {
    const r = Math.max(...stops[city][i].servesIndex.map(l => walkFromLine[l] || 0));
    visited.push(o);
    o.setRadius(r);
  }) 
}

map.on('zoomend', onZoom);
const zoomLookup = ['30%', '30%','30%','30%','30%','30%','30%','30%','30%',
  '30%','30%','30%','30%','60%','60%','60%','60%','100%','100%']
function onZoom(e) {
  stationPiesD3[city].attr('width', zoomLookup[map.getZoom()])
}

let aboutVisible = false;
function toggleAbout() {
  aboutVisible = !aboutVisible;
  document.getElementById('about-div').style.display = 
    aboutVisible ? 'block' : 'none';
}

function mm(miles) {
  return miles * 1609.34;
}

// Leaving this here because it shows the 'servesIndex' conversion
// var lineLookup = ['x0','x1','x2','x3','x4','x5','x6','x7','A','C','E','L','S','B','D',
//                   'F','M','N','Q','R','J','Z','G','W'];