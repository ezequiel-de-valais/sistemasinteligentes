const { default: cluster } = require('cluster');
const csv = require('csv-parser');
const fs = require('fs');
const os = require('os');
const genre_cluster = require('./genres.js')

function discretize(val, ...args) {
  if(!val) {
    return args[0];
  }
  for (const v of args) {
    if (val <= v) {
      return v
    }
  }
  return args.slice(-1)[0]
}


const OUTPUT_SEP = ',';
let ITERATIONS = 100000;
let i = 0;
let GENRECOLUMNS = 'Crime;Drama;Fantasy;Horror;Romance;Comedy;Thriller;Animation;Short;Family;Mystery;Action;Adventure;Sci-Fi;Music;Biography;Sport;History;War;Documentary;Film-Noir;Musical;Game-Show;Western;Reality-TV;Talk-Show;News;Adult';
                                // Title;
let HEADERS = GENRECOLUMNS+';' + 'GenreCluster;Languages;Series or Movie;Country Availability;Runtime;Actors;View Rating;Alternative Score;Awards Received;Awards Nominated For;Release Year;Netflix Release Year;Difference Date;IMDb Votes;IMDb Score';
let accumulatedData = HEADERS.replaceAll(';',OUTPUT_SEP) + os.EOL;

let G='G,TV-G,U,TV-Y,E,TV-Y7-FV,TV-Y7,GP,Approved,Passed,AL'.split(',');
let GP='TV-PG,PG,E10+,TV-13,PG-13,TV-14,M/PG'.split(',');
let M='R,MA-17,NC-17,X,TV-MA,M'.split(',');
let NR='NOT RATED,Unrated,Not Rated,'.split(',');


HEADERS = HEADERS.split(';')
fs.createReadStream('netflix-rotten-tomatoes-metacritic-imdb-depurado.csv')
  .pipe(csv({separator: ';'}))
  .on('data', (row) => {
    i++;
    if(i<ITERATIONS){
        console.log(row);
        editedRow = parseRow(row);    
        accumulatedData += editedRow + os.EOL;
    }
  })
  .on('end', () => {
    console.log('CSV file successfully readed');
    //console.log(genres);
    writeFinal();
  });

  function parseRow(row){
    let line = [];
    row['Languages'] = (row['Languages'] === '')? 0 : row['Languages'].split(',').length;
    row['Actors'] = (row['Actors'] === '')? 0 : row['Actors'].split(',').length;
    row['Country Availability'] = (row['Country Availability'] === '')? 0 : row['Country Availability'].split(',').length;
    
    row['Rotten Tomatoes Score'] = new Number(row['Rotten Tomatoes Score']) / 10;
    console.log('rott score ' +row['Rotten Tomatoes Score']);
    row['Metacritic Score'] = new Number(row['Metacritic Score']) / 10;
    console.log('meta score ' +row['Metacritic Score']);
    row['IMDb Score'] = new Number(row['IMDb Score']);
    console.log('imbd score ' +row['IMDb Score']);

    if(row['Rotten Tomatoes Score'] > 0 && row['Metacritic Score'] > 0){
      row['Rotten Tomatoes Score'] = (row['Rotten Tomatoes Score'] + row['Metacritic Score']) / 2;
    } else if (row['Rotten Tomatoes Score'] == 0 && row['Metacritic Score'] > 0) {
      row['Rotten Tomatoes Score'] = row['Metacritic Score'];
    } 

    console.log('rott score prom ' + row['Rotten Tomatoes Score']);
    
    if(0 <= row['Rotten Tomatoes Score'] && row['Rotten Tomatoes Score'] < 5){
      row['Rotten Tomatoes Score'] = 'Bad';
    }else if(5 <= row['Rotten Tomatoes Score'] && row['Rotten Tomatoes Score'] < 7.0){
      row['Rotten Tomatoes Score'] = 'Good';
    }else if(7.0 <= row['Rotten Tomatoes Score'] && row['Rotten Tomatoes Score'] <= 10){
      row['Rotten Tomatoes Score'] = 'Excelent';
    }else {
      row['Rotten Tomatoes Score'] = 'Unknown';
    }
    row['Alternative Score'] = row['Rotten Tomatoes Score'];
    
    if(0 <= row['IMDb Score'] && row['IMDb Score'] < 7){
      row['IMDb Score'] = 'Bad';
    }else if(7 <= row['IMDb Score'] &&   row['IMDb Score'] < 10){
      row['IMDb Score'] = 'Good';
    }
    
    row['IMDb Votes'] = discretize(row['IMDb Votes'],
      0,
      10,
      100,
      1_000,
      10_000,
      100_000) 


    if(!row['Awards Received'] || row['Awards Received'] <= 0){
      row['Awards Received'] = '0';
    }else if(row['Awards Received'] < 2){
      row['Awards Received'] = '1';
    }else if(row['Awards Received'] <= 5){
      row['Awards Received'] = '5';
    }else if(row['Awards Received'] <= 10){
      row['Awards Received'] = '10';
    }else if(row['Awards Received'] <= 20){
      row['Awards Received'] = '20';
    }else{
      row['Awards Received'] = '50';
    }

    if(!row['Awards Nominated For'] || row['Awards Nominated For'] <= 0){
      row['Awards Nominated For'] = '0';
    }else if(row['Awards Nominated For'] <= 1){
      row['Awards Nominated For'] = '1';
    }else if(row['Awards Nominated For'] <= 5){
      row['Awards Nominated For'] = '5';
    }else if(row['Awards Nominated For'] <= 10){
      row['Awards Nominated For'] = '10';
    }else if(row['Awards Nominated For'] <= 22){
      row['Awards Nominated For'] = '22';
    }else{
      row['Awards Nominated For'] = '50';
    }


    if(!row['Languages'] || row['Languages'] <= 0){
      row['Languages'] = '0';
    }else if(row['Languages'] <= 1){
      row['Languages'] = '1';
    }else if(row['Languages'] <= 3){
      row['Languages'] = '3';
    }else if(row['Languages'] <= 5){
      row['Languages'] = '5';
    }else{
      row['Languages'] = '10';
    }

    if(!row['Country Availability'] || row['Country Availability'] <= 0){
      row['Country Availability'] = '0';
    }else if(row['Country Availability'] <= 1){
      row['Country Availability'] = '1';
    }else if(row['Country Availability'] <= 5){
      row['Country Availability'] = '5';
    }else if(row['Country Availability'] <= 15){
      row['Country Availability'] = '15';
    }else if(row['Country Availability'] <= 35){
      row['Country Availability'] = '35';
    }else{
      row['Country Availability'] = '36';
    }


    if(G.includes(row['View Rating'])){
      row['View Rating'] = 'G';
    }else if(GP.includes(row['View Rating'])){
      row['View Rating'] = 'GP';
    }else if(M.includes(row['View Rating'])){
      row['View Rating'] = 'M';
    }else if(NR.includes(row['View Rating'])){
      row['View Rating'] = 'NR';
    }

    row['Difference Date'] = difDate(row['Release Date'], row['Netflix Release Date']);

    row['Release Year'] = new Date(row['Release Date']).getFullYear(); 
    row['Netflix Release Year'] = new Date(row['Netflix Release Date']).getFullYear();;
    row['GenreCluster'] = genre_cluster(row['Genre'])
    if(row['Genre'] !== undefined){
      /*row['Genre'].split(',').forEach(function(genre){
        genre = genre.trim();
        (genre in genres)? genres[genre]++ : genres[genre] = 1 ;
      });*/
      rowgenres = row['Genre'].split(',').map(a=> a.trim());
      //console.log(rowgenres);
      GENRECOLUMNS.split(';').forEach(function(aGenreColumn){
        //console.log('aGenreColumn: ' +aGenreColumn);
        row[aGenreColumn] = (rowgenres.includes(aGenreColumn))? '1':'0';
      });
    }
    if(row['Boxoffice']) {
      
      //console.log("Boxoffice:", row['Boxoffice'], row['Boxoffice'].replace("$","").replace(/,/g,"").replace(" ",""));
      row['Boxoffice'] = row['Boxoffice'].replace("$","").replace(/,/g,"").replace(" ","");
    } else {
      row['Boxoffice'] = Number.NaN
    }

    console.log(row);
    HEADERS.forEach(function(header){
      line.push(row[header]);
    });
    console.log('CSV file successfully readed');
    return line.join(OUTPUT_SEP);
  }

  function difDate(date1,date2){
    if(date1 !== undefined && date2 !== undefined ){
      var day1 = new Date(date1); 
      var day2 = new Date(date2);
      //console.log('day1: ' + difference);
      var difference= Math.abs(day2-day1);
      //console.log('difference antes del fixed: ' + difference);
      years = difference/(1000 * 3600 * 24) / 365;
      //console.log('years antes del fixed: ' + years);
      years = years.toFixed(2);
      //console.log('date1: ' + date1 + ' date2: ' + date2 + ' Dif: ' + years);
      //
      
      if (isNaN(years)){
        return years;
      }else {
        return years;
        /*if (years > 0 && years <= 100){ return Math.round(years)}
        //else if (years > 10 && years <= 20){ return 20} 
        //else if (years > 20 && years <= 30){ return 30} 
        //else if (years > 30 && years <= 40){ return 40} 
        else { return 100} */
      }
    }
    else{
      return NaN;
    }

  }

  function writeFinal(){
    
    fs.writeFile('netflix-processed.csv', accumulatedData, function (err) {
        if (err) return console.log(err);
        console.log('CSV file successfully writed');
      });
  }
