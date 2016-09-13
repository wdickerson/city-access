clear;
myStops = loadjson('stations.json');

% for i = 1:length(myStops.features)
%     names{i}=myStops.features{i}.properties.name;
%     lines{i}=myStops.features{i}.properties.line;
% end
% 
% namest=transpose(names);
% linest=transpose(lines);

%find( strcmp(names,'14th Street') )

myComplexes.type = myStops.type;
omit = [442;443;445;444;34;380;385;25;458;434;5;415;168;416;418;...
        436;362;410;404;371;79;403;428;414;361;419;422;1;170;84;...
        367;86;166;167;87;89;155;360;88;467;82;3;16;354;7;352;358;...
        131;133;121;282;284;291;375;383;49;54;56;196;274;387;379;...
        407;57;280;448;65;271;369;378;93;90;208;178;324;325;99;98;...
        14;205;439];
    
add = [442;445;34;25;5;168;362;371;403;419;1;84;86;87;88;82;16;7;...
       131;121;284;375;49;196;379;280;65;369;93;208;324;99;205];
   
   
   
addNames = {
    '14th Street / Sixth Avenue';
    '14th Street - Eighth Avenue';
    '14th Street - Union Square';
    'Bleecker Street / Broadway - Lafayette Street';
    'Brooklyn Bridge - City Hall / Chambers Street';
    'Canal Street';
    'Chambers Street - World Trade Center / Park Place';
    'Delancey Street - Essex Street';
    'Fulton Street / Fulton Center';
    'South Ferry - Whitehall Street';
    'West Fourth Street - Washington Square';
    '34th Street - Herald Square';
    'Grand Central - 42nd Street';
    'Times Square - 42nd Street';
    '42nd Street - Bryant Park / Fifth Avenue';
    'Lexington Avenue / 51st - 53rd Streets';
    '59th Street - Columbus Circle';
    'Lexington Avenue / 59th-63rd Streets';
    '168th Street';
    '149th Street - Grand Concourse';
    '161st Street - Yankee Stadium';
    'Fourth Avenue / Ninth Street';
    'Atlantic Avenue - Barclays Center';
    'Broadway Junction';
    'Court Street - Borough Hall';
    'Franklin Avenue - Fulton Street';
    'Franklin Avenue - Botanic Garden';
    'Jay Street - MetroTech';
    'Lorimer Street / Metropolitan Avenue';
    'Myrtle-Wyckoff Avenues';
    'New Utrecht Avenue / 62nd Street';
    'Court Square';
    'Roosevelt Avenue / 74th Street'};

addLines = {
    'F-M-L';
    'A-C-E-L';
    '4-5-6-N-Q-R-L';
    '4-6-B-D-F-M';
    '4-5-6-J-Z';
    '4-6-J-Z-N-Q-R';
    'A-C-E-2-3';
    'F-J-M-Z';
    '2-3-4-5-J-Z-A-C';
    '1-N-R';
    'B-D-F-M-A-C-E';
    'N-Q-R-B-D-F-M';
    'S-4-5-6-7';
    'S-1-2-3-7-N-Q-R';
    '7-B-D-F-M';
    'E-M-4-6';
    '1-2-A-B-C-D';
    '4-5-6-F-N-Q-R';
    '1-A-C';
    '2-4-5';
    '4-B-D';
    'F-G-D-N-R';
    '2-3-4-5-B-Q-D-N-R';
    'J-Z-A-C-L';
    '2-3-4-5-N-R';
    'S-A-C';
    'S-2-3-4-5';
    'A-C-F-N-R';
    'G-L';
    'L-M';
    'D-N';
    '7-E-M-G';
    '7-E-F-M-R'};
   
 
% omit ALL of the stops that are part of complexes
c=1;
for i=1:length(myStops.features)
    if ~any(omit==i)
        myComplexes.features{c}=myStops.features{i};
        c=c+1;
    end
end

% now add the complexes. First use the first stop in the complex,
% then change the properties as needed
for i = 1:length(add)
    myComplexes.features{c}=myStops.features{add(i)};
    myComplexes.features{c}.properties.name = addNames{i};
    myComplexes.features{c}.properties.line = addLines{i};
    c=c+1;
end

savejson('',myComplexes,'complexes.json');
% Now go run processStations again with the new json!!
    
    
    
    
    
    
    