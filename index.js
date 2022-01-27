const csv = require('csv-parser');
const fs = require('fs');
var os = require("os");

//let ITERATIONS = 5;
let ITERATIONS = 100000;
let i = 0;
let GENRECOLUMNS = 'Crime;Drama;Fantasy;Horror;Romance;Comedy;Thriller;Animation;Short;Family;Mystery;Action;Adventure;Sci-Fi;Music;Biography;Sport;History;War;Documentary;Film-Noir;Musical;Game-Show;Western;Reality-TV;Talk-Show;News;Adult';
let HEADERS = GENRECOLUMNS + ';Title;Genre;Languages;Series or Movie;Country Availability;Runtime;Actors;View Rating;Rotten Tomatoes Score;Metacritic Score;Awards Received;Awards Nominated For;Boxoffice;Release Date;Netflix Release Date;IMDb Votes;IMDb Score';
let genres = {};
let accumulatedData = HEADERS + os.EOL;
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
    console.log('imbsd score ' +row['IMDb Score']);

    if(row['Rotten Tomatoes Score'] > 0 && row['Metacritic Score'] > 0){
      row['Rotten Tomatoes Score'] = (row['Rotten Tomatoes Score'] + row['Metacritic Score']) / 2;
    } else if (row['Rotten Tomatoes Score'] == 0 && row['Metacritic Score'] > 0) {
      row['Rotten Tomatoes Score'] = row['Metacritic Score'];
    } 

    console.log('rott score prom ' + row['Rotten Tomatoes Score']);

    if(0 < row['Rotten Tomatoes Score'] && row['Rotten Tomatoes Score'] < 5){
      row['Rotten Tomatoes Score'] = 'Bad';
    }else if(5 <= row['Rotten Tomatoes Score'] && row['Rotten Tomatoes Score'] < 7.0){
      row['Rotten Tomatoes Score'] = 'Good';
    }else if(7.0 <= row['Rotten Tomatoes Score'] && row['Rotten Tomatoes Score'] <= 10){
      row['Rotten Tomatoes Score'] = 'Excelent';
    }

    if(0 <= row['IMDb Score'] && row['IMDb Score'] < 5){
      row['IMDb Score'] = 'Bad';
    }else if(5 <= row['IMDb Score'] &&   row['IMDb Score'] < 7.0){
      row['IMDb Score'] = 'Good';
    }else if(7.0 <= row['IMDb Score'] &&   row['IMDb Score'] <= 10){
      row['IMDb Score'] = 'Excelent';
    }

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
    console.log(row);
    HEADERS.forEach(function(header){
      line.push(row[header]);
    });
    console.log('CSV file successfully readed');
    return line.join(';');
  }

  function writeFinal(){
    
    fs.writeFile('netflix-processed.csv', accumulatedData, function (err) {
        if (err) return console.log(err);
        console.log('CSV file successfully writed');
      });
  }
