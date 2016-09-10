const centers = {
  //nyc: [40.740693, -74.004536],
  nyc: [40.7128, -74.0059],
  dc: [38.9072, -77.0369]
}

// Initialize a map with leaflet
const map = L.map('map', { 
  center: centers.dc, 
  zoom: 11,
  maxZoom: 18,
  doubleClickZoom: false,
  //inertia: false,
  tap: true
});
L.tileLayer(
  'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', 
  {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }).addTo(map);
  
let willWalk = mm(0.5);
let walkCircles = {};
let stops = {};
let marker;
let markerCircle;
let stationPiesD3 = {};

marker = L.marker(centers.dc, { draggable: 'true' })
  .addTo(map)
  .on('drag', onDrag)
  .on('dragend', updateWalkingCircles); 
markerCircle = L.circle(centers.dc, mm(0.5), 
  { 
    className: 'marker-circle',
    stroke: false,
    fillOpacity: 1
  }).addTo(map);
  
function focusMap(newCity) {
  //alert(newCity);
  city = newCity
  map.panTo(centers[city]);
  //map.setZoom(11);
  marker.setLatLng(centers[city]);
  markerCircle.setLatLng(centers[city]);
  onZoom();
  updateWalkingCircles();
}
  
function addWalkCircles(stops) {
  const walkCirclesTemp = stops.map(o => L.circle(o.latlng, 100, 
    { 
      className: 'walk-circle', 
      stroke: false,
      fillOpacity: 1
    }));
  L.featureGroup(walkCirclesTemp).addTo(map);
  return walkCirclesTemp
}

function addStationPies(stops, city) {
  const stationPies = stops.map(o => {
    const popupContent = document.createElement("div");
    const popupName = document.createElement("h1");
    const popupLines = o.serves.map(line => { 
      const temp = new Image(20, 20);
      temp.src = 'lineImages/' + city + '/'+ line + '.png';
      return temp;
    })
    
    popupName.appendChild(document.createTextNode(o.name));
    popupContent.appendChild(popupName);
    popupLines.forEach(l => { popupContent.appendChild(l); })
    
    const popup = L.popup({ closeButton: false, autoPan: false })
      .setLatLng(o.latlng)
      .setContent(popupContent);
      
    const tempIcon = L.divIcon({
      className: 'stop-icon', 
      iconSize: 15,
      html: '<svg class="stop-svg stop-' + city + '" viewBox="0 0 100 100" width="20%"></svg>'
    });

    return L.marker(o.latlng, { icon: tempIcon })
      .on('mouseover', () => { popup.openOn(map); })
      .on('mouseout', () => { map.closePopup(); });
  })
  L.featureGroup(stationPies).addTo(map);
  const stationPiesTemp = d3.selectAll('.stop-' + city).data(stops);
  makePies(stationPiesTemp);
  return stationPiesTemp;
}

function makePies(stationPiesD) {
  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(50)
    .startAngle(0);    

  stationPiesD.selectAll('slices')
    .data(d => d.colors).enter()
    .append('path')
    .attr('transform', 'translate(50,50)')
    .attr('d', (d, i, j) => arc({ endAngle: 2 * Math.PI * (1 - i / j.length)}))
    .attr('fill', d => d)
}

// Get DC stops
d3.json('complexesDC.json', function(error, mta) {
  const makeServesIndex = {
    red: 1,
    orange: 2,
    yellow: 3,
    green: 4,
    blue: 5,
    silver: 6
  }
  stops.dc = mta.features.map(o => {
    const t = {}
    t.name = o.properties.NAME;
    t.serves = o.properties.LINE.split(", ");
    t.servesIndex = t.serves.map(c => makeServesIndex[c]);
    t.colors = t.serves;
    t.latlng = L.latLng(o.geometry.coordinates.reverse());
    return t;
  }); 

  walkCircles.dc = addWalkCircles(stops.dc);
  stationPiesD3.dc = addStationPies(stops.dc, 'dc');
  //console.log(stationPiesD3_DC);

  //stops = stopsDC;
  //walkCircles = walkCirclesDC;
  //stationPiesD3 = stationPiesD3_DC;
  
  updateWalkingCircles();
  onZoom();
  
}); // end of d3.json

// Get NYC stops
d3.json('complexesNYC.json', function(error, mta) {
  stops.nyc = mta.features.map(o => {
    o.properties.latlng = L.latLng(o.geometry.coordinates.reverse());
    return o.properties;
  }); 

  walkCircles.nyc = addWalkCircles(stops.nyc);
  stationPiesD3.nyc = addStationPies(stops.nyc, 'nyc');
}); // end of d3.json

let city;
function findNearestCity() {
  //alert('in find nearest');
  // if NYC
  if (marker.getLatLng().distanceTo(L.latLng(centers.nyc)) < mm(50)) {
    city = 'nyc';
//    stops = stopsNYC;
//    walkCircles = walkCirclesNYC;
//    stationPiesD3 = stationPiesD3_NYC;
  } else {
    city = 'dc'
//    stops = stopsDC;
//    walkCircles = walkCirclesDC;
//    stationPiesD3 = stationPiesD3_DC;
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
  onDrag();
  updateWalkingCircles();
}

function onDrag() {
  markerCircle.setLatLng(marker.getLatLng());
  //updateWalkingCircles();
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
  
  walkFromLine[0]=0;
  walkCircles[city].forEach((o, i) => {
    
    const newWalkRadius = Math.max(...stops[city][i].servesIndex.map(l => walkFromLine[l] || 0));
    
    visited.push(o);
    o.setRadius(newWalkRadius);
  })
  
}

map.on('zoomend', onZoom);
const zoomLookup = ['20%', '20%','20%','20%','20%','20%','20%','20%','20%',
  '20%','20%','20%','20%','40%','40%','40%','40%','100%','100%']
function onZoom(e) {
  stationPiesD3[city].attr('width', zoomLookup[map.getZoom()])
}

function helpClick(){
  document.getElementById('helpDiv').style.display = 'none';
  if (document.getElementById('helpCheckbox').checked) {
    document.getElementById('helpDiv').style.display = 'block';
  }
}

function gotItClick() {
  document.getElementById('helpCheckbox').checked = false;
  document.getElementById('helpDiv').style.display = 'none';
}

function mm(miles) {
  return miles * 1609.34;
}

// Leaving this here because it shows the 'servesIndex' conversion
// var lineLookup = ['x0','x1','x2','x3','x4','x5','x6','x7','A','C','E','L','S','B','D',
//                   'F','M','N','Q','R','J','Z','G','W'];