# city-access
A visualization of the New York City Subway

This web application uses Leaflet and D3 to create an interaction visualization.
Move the marker to a point in NYC, and the and the map will populate with circles that
indicate where you can reach in NYC by taking one Subway ride.

These 5 files are used by the browser when displaying the application:  
index.html  
cityaccess.js  
nycPostalCodes.json  
complexesM.json  
nycD3.css  

The remaining files are for data preprocessing. NYC Open Data provides information
on the 468 individual subway stations here: 
https://data.cityofnewyork.us/Transportation/Subway-Stations/arq3-7z49

This data was pre-processed using MATLAB to condense it to the 422 station complexes.

See it live: https://cityaccess.littleapp.io

