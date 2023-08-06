// const sqlFunctions =  require('./sqlFunctions');
// const sqlite3 = require('sqlite3').verbose();

// //Access database file
// const db = new sqlite3.Database('./test2.db', sqlite3.OPEN_READWRITE, (err)=> {
// 	if (err) return console.err(err.message);
// })

// //Drop anime table if it exists, then create new table
// sqlFunctions.dropAnimeTable(db, () => {
//   sqlFunctions.createAnimeTable(db);
// });

// // Array of anime IDs
// const animeIds = [5, 6, 7, 8, 15, 1, 2, 3, 4, 5, 9];

// // Map to store anime details
// const animeMap = new Map();

// // Function to fetch anime details. Returns json data of anime
// async function fetchAnimeDetails(animeId) {
//   try {
//     const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
//     if (!response.ok) {
//       console.log(response);
//       throw new Error('Failed to fetch anime details');
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.log('Error occurred while fetching anime details:', error);
//     return null;
//   }
// }

// // Iterate through each anime ID and fetch/print details
// animeIds.forEach(async animeId => {
//   try { 
//     const anime = await fetchAnimeDetails(animeId);
//     if (anime) {
//       const data = anime.data; // Access the 'data' property from the response
//       animeMap.set(data.title, data); // Store anime details in the map
//       await sqlFunctions.insertAnime(db, simplifyJSON(data)); //Insert anime into database
//       //Uncomment these two lines if you want to see the simplified JSON output
      
//       //console.log(JSON.stringify(simplifyJSON(data), null, 2))
//       //console.log('---------------------------------------');
//     } 
//   } catch (error) {
//     console.log('Error occurred:', error);
//   }
// });

// setTimeout(() => {
//   sqlFunctions.printAllAnimes(db);
// }, animeIds.length * 1000); // Wait for all fetch requests to complete

// //Takes anime json and returns a new one with only the essential attributes
// function simplifyJSON(animeJSON) {
//   let anime = {
//     id: animeJSON.mal_id,
//     title: animeJSON.title,
//     image_url: animeJSON.images.webp.image_url,
//     studios: animeJSON.studios,
//     genres: animeJSON.genres,
//     themes: animeJSON.themes,
//     year: animeJSON.year,
//     demographics: animeJSON.demographics,

//   };

//   for(let j = 0; j < anime.genres.length; j++) {
//     delete anime.genres[j].type;
//     delete anime.genres[j].url;
//   }

//   return anime;
// }


const sqlFunctions = require('./sqlFunctions');
const sqlite3 = require('sqlite3').verbose();
const animeCache = require('./anime_cache.json');


//Access database file
const db = new sqlite3.Database('./test2.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.err(err.message);
});

//BE VERY CAREFUL ABOUT UNCOMMENTING THE FOLLOWING. WE DON'T WANT TO NUKE OUR DATABASE OF 30000 ANIMES
//Drop anime table if it exists, then create a new table
/*
sqlFunctions.dropAnimeTable(db, () => {
  sqlFunctions.createAnimeTable(db);
});
*/

// Array of anime IDs
// const animeIds = [5, 6, 7, 8, 15, 1,];
//const animeIds = [5, 6, 7];

const animeIds = animeCache.sfw.slice(23326,23330);

// Map to store anime details
const animeMap = new Map();

// Function to fetch anime details. Returns JSON data of anime
async function fetchAnimeDetails(animeId) {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
    if (!response.ok) {
      console.log(response);
      throw new Error('Failed to fetch anime details');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Error occurred while fetching anime details:', error);
    return null;
  }
}

// Async function to iterate through each anime ID and fetch/print details
async function fetchAnimeDetailsWithDelay() {
  for (let i = 0; i < animeIds.length; i++) {
    const animeId = animeIds[i];
    try {
      const anime = await fetchAnimeDetails(animeId);
      if (anime) {
        const data = anime.data;
        animeMap.set(data.title, data);
        console.log("animeID:" + i);
        await sqlFunctions.insertAnime(db, simplifyJSON(data));

        // (JSON.stringify(simplifyJSON(data), null, 2));
        // console.log('---------------------------------------');
      }
    } catch (error) {
      console.log('Error occurred:', error);
    }

    // Delay for 1 second before making the next API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

fetchAnimeDetailsWithDelay();

/*
setTimeout(() => {
  sqlFunctions.printAllAnimes(db);
}, animeIds.length * 2000); // Wait for all fetch requests to complete
*/

//Takes anime JSON and returns a new one with only the essential attributes
function simplifyJSON(animeJSON) {
  let anime = {
    id: animeJSON.mal_id,
    title: animeJSON.title,
    studios: animeJSON.studios,
    genres: animeJSON.genres,
    themes: animeJSON.themes,
    year: animeJSON.year,
    synopsis: animeJSON.synopsis,
    images: animeJSON.images,
    demographics: animeJSON.demographics,
  };

  for (let j = 0; j < anime.genres.length; j++) {
    delete anime.genres[j].type;
    delete anime.genres[j].url;
  }

  for (let j = 0; j < anime.themes.length; j++) {
    delete anime.themes[j].type;
    delete anime.themes[j].url;
  }

  return anime;
}