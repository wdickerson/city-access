clear;
lineIndex=['0','1','2','3','4','5','6','7',...
           'A','C','E','L','S','B','D','F',...
           'M','N','Q','R','J','Z','G','W'];

%myJson = loadjson('stations.json');
myJson = loadjson('complexes.json');


for i=1:length(myJson.features)
    
    % let's do some work on 'line'
    temp=myJson.features{i}.properties.line;
    temp=strrep(temp,'-',' ');
    temp=strrep(temp,'6 Express','');
    temp=strrep(temp,'7 Express','');
    temp=strrep(temp,'1','x1');
    temp=strrep(temp,'2','x2');
    temp=strrep(temp,'3','x3');
    temp=strrep(temp,'4','x4');
    temp=strrep(temp,'5','x5');
    temp=strrep(temp,'6','x6');
    temp=strrep(temp,'7','x7');
    temp = strtrim(temp);
    myJson.features{i}.properties.line=temp;

    % Create this array of stations
    myJson.features{i}.properties.serves=strsplit(temp);
    
    % Change the above array to the sation indexes
    temp2 = temp;
    temp2=strrep(temp2,'x1','1');
    temp2=strrep(temp2,'x2','2');
    temp2=strrep(temp2,'x3','3');
    temp2=strrep(temp2,'x4','4');
    temp2=strrep(temp2,'x5','5');
    temp2=strrep(temp2,'x6','6');
    temp2=strrep(temp2,'x7','7');
    temp3=strsplit(temp2);
    myJson.features{i}.properties.servesIndex(1)=0;
    for j=1:length(temp3)
        myJson.features{i}.properties.servesIndex(j+1)=...
            find(lineIndex==temp3{j})-1;
    end
    t4=myJson.features{i}.properties.servesIndex;
    
    % Let's add a station ID (that starts at 0)
    myJson.features{i}.properties.ID=i-1;
    
    % Let's add an array of colors
    colC = 1;
    if any(t4==1)||any(t4==2)||any(t4==3) % 1,2,3
        myJson.features{i}.properties.colors{colC}='red';
        colC=colC+1;
    end
    if any(t4==4)||any(t4==5)||any(t4==6) % 3,4,5
        myJson.features{i}.properties.colors{colC}='green';
        colC=colC+1;
    end
    if any(t4==7) % 7
        myJson.features{i}.properties.colors{colC}='purple';
        colC=colC+1;
    end
    if any(t4==8)||any(t4==9)||any(t4==10) % A,C,E
        myJson.features{i}.properties.colors{colC}='blue';
        colC=colC+1;
    end
    if any(t4==11) % L
        myJson.features{i}.properties.colors{colC}='gray';
        colC=colC+1;
    end
    if any(t4==12) % S
        myJson.features{i}.properties.colors{colC}='dimgray';
        colC=colC+1;
    end
    if any(t4==13)||any(t4==14)||any(t4==15)||any(t4==16) %BDFM
        myJson.features{i}.properties.colors{colC}='orange';
        colC=colC+1;
    end
    if any(t4==17)||any(t4==18)||any(t4==19) % N,Q,R
        myJson.features{i}.properties.colors{colC}='yellow';
        colC=colC+1;
    end
    if any(t4==20)||any(t4==21) % J,Z
        myJson.features{i}.properties.colors{colC}='brown';
        colC=colC+1;
    end
    if any(t4==22) % G
        myJson.features{i}.properties.colors{colC}='lightgreen';
        colC=colC+1;
    end
    


    
end

% savejson('',myJson,'stationsM.json');
savejson('',myJson,'complexesM.json');
