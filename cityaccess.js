// Initialize a map with leaflet
var map = L.map('map').setView([40.740693, -74.004536], 11);
L.tileLayer(
    'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    maxZoom: 18,
    }).addTo(map);
    
// Put a draggable marker on the map
var marker = new L.marker([40.740693, -74.004536], {draggable:'true'});
map.addLayer(marker);
var markerD3;// Will initialize in d3.json
var tooltip = d3.select('.leaflet-marker-pane')
  .append('div')
  .attr('class','tooltip')
  .style('display','none');

// Add an SVG element to Leaflet’s overlay pane
var width = 2000, height = 1500;
var svg = d3.select(map.getPanes().overlayPane).append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("top", -300);
var g = svg.append("g").attr("class", "leaflet-zoom-hide")
        .attr("transform", "translate(0,300)");
    
// From the leaflet example
// We need a projection to go from lat/long to x,y
var transform = d3.geo.transform({point: projectPoint}),
    path = d3.geo.path().projection(transform); 
function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

// stops will be a copy of the JSON data.
var stops; var statG; var myArc; var pieG = new Array();
d3.json("nycPostalCodes.json", function(error, nyb) {
    // Add all of the boroughs
    g.append("g")
        .attr("id","boroughs")
		.selectAll("path")
		.data(nyb.features).enter()
        .append("path")
		.attr("class", function(d){ return d.properties.PO_NAME; })
        .classed("boroughPath",true)
		.attr("d", path);
    
    // We're putting the station json here (nested) so it runs 
    // AFTER the borough json, so it will be painted on top.
    d3.json("complexesM.json", function(error, mta) {
        
        // Add all of the "walking circles"
        g.append("g")
            .attr("id","walk")
            .selectAll("anythinggoeshere")
            .data(mta.features)
            .enter()
            .append("circle")
            // the "cx" "cy", and "r" attrs are added in findDepartureStops()
            .attr("class", function(d){ return "walkCircle " + d.properties.line; })
            .attr("id", function(d){ return "w"+d.properties.ID; });
        
        // Add a walking radius around the marker    
        d3.select("#walk")
         .append("circle")
         .attr("id","marker");
        
        // Pie charts!!
        var systemG = g.append("g")
                     .attr("id","station")
                     .selectAll("whatevs")
                     .data(mta.features)
                     .enter();
        
        statG = systemG.append("g")                                 
                    .attr("class","stationPie updateTransform")
                    .on('mouseover', function(d) { showTooltip(d); })
                    .on('mouseout', function(d) { hideTooltip(); });
                    // the "transform" attribute is added in findDepartureStops()
        
        drawPies(4,0,1);
        drawPies(8,1,0);
        //r=radius,pieN=index,op=opacity
        function drawPies(r,pieN,op){
            
            myArc = d3.svg.arc()
                .innerRadius(0)
                .outerRadius(r)
                .startAngle(0)
                .endAngle(2 * Math.PI);

            pieG[pieN] = statG.selectAll("whatevs")
                        .data(function(d){return d.properties.colors;})
                        .enter()
                        .append("path")
                        .attr("class",function(d,i,j){
                            return "s"+j;})//j is index of parent
                        .attr("opacity",op)
                        .attr("fill",function(d){return d;});
                        // the "d" attribute is added in reset()
            
        }
        
        // Put this here to ensure it runs once after everything is loaded.
        markerD3=d3.selectAll("#marker");//D3's pointer to marker.
        stops = mta; // We'll use "stops" for our logic.
        reset(); // this also calls distChange() and findDepartureStops()
	});
        
});

function showTooltip(d) {
  var left = map.latLngToLayerPoint( 
    new L.LatLng(d.geometry.coordinates[1],
    d.geometry.coordinates[0])).x;
  var top = map.latLngToLayerPoint( 
    new L.LatLng
    (d.geometry.coordinates[1],
     d.geometry.coordinates[0])).y;
  var name = d.properties.name;
  
  tooltip.style('display', 'block')
    .html(name.replace(/\s/g, '&nbsp;').replace('-', '&#8209;'))
    .style('top', (top + 10) + 'px')
    .style('left', (left + 10) + 'px')
    .append('div')
    .attr('class','tipLines')
    .selectAll('line-imgs')
    .data(d.properties.serves).enter()
    .append('img')
    .attr('src',function(d) { return 'lineImages/' + d + '.png';} )
    .attr('width','20');
}

function hideTooltip() {
  tooltip.style('display', 'none');
}

// This happens when you zoom but not when you pan
var zoomLookup = [1,1,1,1,1,1,1,1,1,1,1.5,2,4,4,6,6,6,6,6,6,6];
map.on("viewreset", reset);
function reset(){  
    var curZoom = map.getZoom();
    distRad = willWalk * pixPerMile();
    
    // update the borough paths
    d3.selectAll(".boroughPath")
        .attr("d",path);
    
    // update the paths of the pies (to change their size)
    pieG[0].attr("d",function(d,i){ 
                var numSlices;
                d3.select(this.parentNode)
                  .each(function(d){
                numSlices = d.properties.colors.length;});

                myArc.endAngle((2*Math.PI)*(numSlices-i)/numSlices); 
                myArc.outerRadius( zoomLookup[curZoom] );
                return myArc(); } );
    
    pieG[1].attr("d",function(d,i){ 
                var numSlices;
                d3.select(this.parentNode)
                  .each(function(d){
                numSlices = d.properties.colors.length;});

                myArc.endAngle((2*Math.PI)*(numSlices-i)/numSlices); 
                myArc.outerRadius( zoomLookup[curZoom] * 2.2 );
                return myArc(); } );
    
    // update the transforms
    statG.attr("transform",function(d) {        
                    return "translate("+ 
                    map.latLngToLayerPoint( new L.LatLng
                        (d.geometry.coordinates[1],
                         d.geometry.coordinates[0]) ).x +","+  //put your X value before this
                    map.latLngToLayerPoint( new L.LatLng
                        (d.geometry.coordinates[1],
                         d.geometry.coordinates[0]) ).y +")";  //put your Y value before this    
                                                            } );
    
    // update the walking circles (the centers)
    d3.selectAll(".walkCircle")
    .attr("cx", function (d)
          {
            return map.latLngToLayerPoint(
                    new L.LatLng
                    (d.geometry.coordinates[1],
                     d.geometry.coordinates[0] )
                                          ).x;
          }
         )
    .attr("cy", function (d)
          {
            return map.latLngToLayerPoint(
                    new L.LatLng
                    (d.geometry.coordinates[1],
                     d.geometry.coordinates[0] )
                                          ).y;
          }
         );

    
    // Update the size and starting coordinate of "svg"
    var bounds = document.getElementById("boroughs").getBBox();
    svg.style("top", bounds.y)
       .style("left",bounds.x)
       .attr("width", bounds.width)
       .attr("height",bounds.height);
    g.attr("transform", "translate("+ -bounds.x +","+ -bounds.y +")");
    
    // update the walking circles radii
    distChange();
}

// This happens as soon as the distance slider is moved
var willWalk = document.getElementById("distBar").value;
var distRad = willWalk * pixPerMile();
document.getElementById("distBar").addEventListener("input", distChange, false);
function distChange(){
    document.getElementById("distText").innerHTML=document.getElementById("distBar").value;
    willWalk = document.getElementById("distBar").value;
    distRad = willWalk * pixPerMile();
    whileDragging();
    findDepartureStops();
}
    
// This happens when the marker is dragged
var myLoc;
var arr0Dist = new Array(24); arr0Dist.fill(0);
var closest = new Array(24); closest.fill(-1);
marker.on("drag",whileDragging,false); 
marker.on("dragend",findDepartureStops,false); 

// We don't want to update all the walking circles
// as we drag, just the marker walking circle.
var newDrag = 1;
var pieClose;//Will be the current big pies
function whileDragging(){
    // do this stuff once (start of drag)
    // initialize big stops to opacity 0
    myLoc = marker.getLatLng();
    if(newDrag==0){
        pieClose.attr("opacity",0);
        arr0Dist.fill(0);
        closest.fill(-1);
        newDrag=1;
    }
    
    // update the marker's walking circle    
     markerD3.attr("cx", function (d)
                      {
                        return map.latLngToLayerPoint(
                                myLoc
                                                      ).x;
                      }
                     )
     .attr("cy", function (d)
                      {
                        return map.latLngToLayerPoint(
                                myLoc
                                                      ).y;
                      }
                     )
     .attr("r",distRad);
}

// At the end of the drag, we update all of the walking circles
// except the marker's
function findDepartureStops(){

    // This is to implement "dragstart" functionality
    newDrag = 0;
    
    // loop through all the stations
    for(k=0;k<stops.features.length;k++)
    {
        // myDist is in meters
        var myDist = myLoc.distanceTo(new L.LatLng
                        (stops.features[k].geometry.coordinates[1],
                         stops.features[k].geometry.coordinates[0] )
                    );
        
        // If the station is in walking distance:
        // willWalk is in miles
        if (myDist < 1609.34*willWalk)
        {   
            // Update arr0Dist for the lines that can be walked to.
            // starting at 1 is intentional because of your "line 0"
            // Remember that ALL stops serve "line 0"!!
            for(i=1;i<stops.features[k].properties.servesIndex.length;i++)
            {
                var cur = arr0Dist[ stops.features[k].properties.servesIndex[i] ]
                arr0Dist[ stops.features[k].properties.servesIndex[i] ] 
                    = Math.max( cur , willWalk - myDist/1609.34 );
                
                // Keep up with which station is updating arr0Dist
                // It is the closest station that serves that line
                if( (willWalk - myDist/1609.3) > cur )
                {
                    closest[ stops.features[k].properties.servesIndex[i] ]=k;
                }
            }
        }
    }  
    
    // Now give the close stops opacity of 1
    // Update pieClose 
    var closestClasses=".s-1";
    for(i=1;i<closest.length;i++){
        if(closest[i]!=-1)
            closestClasses+=(", .s"+closest[i]);
    }
    pieClose = pieG[1].filter(closestClasses)
               .attr("opacity",1);
    
    // Now update the radius of the "walking circles"
    d3.selectAll(".walkCircle")
      .attr("r",function(d){ return arr0DistRadius(d) + "px" });
}
    
// We need to know how many map pixels are in a mile at the current view
function pixPerMile(){
    // http://stackoverflow.com/questions/27545098/leaflet-calculating-meters-per-pixel-at-zoom-level
    // get marker LatLng, convert it to xy (M), create a point one pixel away (X)
    // convert X to LatLng, find distance, convert to miles and return
    var markLatLng = marker.getLatLng(); 
    var pointM = map.latLngToContainerPoint(markLatLng);
    var pointX = [pointM.x + 1, pointM.y]; // add one pixel to x
    var latLngX = map.containerPointToLatLng(pointX);
    return 1609.34 / markLatLng.distanceTo(latLngX); 
    /*
       1 / (meters/pix) = pix/meter
       (pix/meter) * 1609.34 = pix/mile
       1609.34/metersPerX = pix/mile
    */    
}
    
function arr0DistRadius(d){
    var myMax = 0;
    // starting at 1 is intentional because of your "line 0"
    // Remember that ALL stops serve "line 0"
    for(i=1;i<d.properties.servesIndex.length;i++)
    {
        myMax = Math.max( myMax,arr0Dist[d.properties.servesIndex[i]] );
    }
    return myMax*pixPerMile();
}
    
function helpClick(gotIt){
    var yo = document.getElementById("helpCheckbox").checked;
    
    document.getElementById("helpDiv").style.display = "none";
    document.getElementById("helpMenu").style.backgroundColor = "inherit";
    document.getElementById("helpMenu").style.color = "darkgray";
    
    if(yo==true && gotIt==false)
    {
        document.getElementById("helpDiv").style.display = "block";
    }
    if(gotIt==true)
        document.getElementById("helpCheckbox").checked = false; 
}

// Leaving this here because it shows the "servesIndex" conversion
// var lineLookup = ["x0","x1","x2","x3","x4","x5","x6","x7","A","C","E","L","S","B","D",
//                   "F","M","N","Q","R","J","Z","G","W"];