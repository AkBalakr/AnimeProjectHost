const express = require('express')
const request = require('request');
const sqlite3 = require('sqlite3').verbose();
const jikanjs = require('@mateoaranda/jikanjs');
const axios = require('axios');
const sqlFunctions = require('./sql/sqlFunctions')

const app = express()

const db = new sqlite3.Database('sql/animeDatabase.db'); 

app.use(express.json());
let AnimeList = [];
let AnimeDislikedList = [];

var headers = {
	'X-MAL-CLIENT-ID': '0fe7380035a79335b8a919f3318dfb39'
};

const flaskProxy = 'http://127.0.0.1:7000';

app.get("/api", (req, res) => {
	res.json({"users": ["user1", "user2", "user3"]})
})

// Just tests if the default endpoint is working
app.get('/', function (req, res) {
  res.json({"test": "test"})
});

// Searches database based on anime ID and returns information of anime 
app.get('/database/getAnimeInfo', (req, res) => {
  const id = req.query.id;

  db.get('SELECT * FROM anime WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else if (row) {
      const anime = {
        id: row.id,
        title: row.title,
		images: row.images,
		synopsis: row.synopsis
      };
      res.json(anime);
    } else {
	  console.log("404 error here");
      res.status(404).json({ error: 'Anime not found' });
    }
  });
});

// Database function that returns animes based on title likeness
app.get('/database/animeSearch', (req, res) => {
  const { title } = req.query;
  const query = `SELECT * FROM anime WHERE title LIKE '%${title}%'`;

  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const animes = rows.map((row) => ({
        id: row.id,
        title: row.title,
        images: row.images,
        synopsis: row.synopsis
      }));
      res.json(rows);
    }
  });
});

app.post('/api/get-user-favorites', (req, res) => {
	const username = req.body.username;

	let result = getUserFavorites(username, res)
})

// Returns favorite animes of the given user, assuming they exist in our database
function getUserFavorites(username, res) {
	let userFavorites = [];

	//Create a promist the resolves if API call works, and rejects if otherwise
	let p = new Promise((resolve, reject) => {
		console.log("running promise with " + username);
		let options = {
			url: `https://api.jikan.moe/v4/users/${username}/favorites`,
			headers:headers
		}

		request(options, (error, response, body) => {
			if (error)
				reject(error);
			else {
				try {
					let userFavoriteAnimes = JSON.parse(body).data.anime;
					resolve(userFavoriteAnimes);					
				}
				catch {
					reject()
				}
			}
		})		
	})

	//Once API has returned a result, process that data
	p
	.then(result => {
		console.log("result");
		console.log(result);
		let numAnimes = result.length;
		let count = 0;

		const promises = result.map(item => {
			sqlFunctions.animeIdIsValid(db, item.mal_id)
			.then(() => {
				count++
				item.id = item.mal_id;
				delete item.mal_id;
				delete item.type;
				delete item.url;
				delete item.start_ear;
				console.log("Pushing " + item.title + " into usreFavorites")
				userFavorites.push(item.title);
			})
			.catch(() =>  {
				console.log("Anime with id " + item.mal_id + " does not exist in databse");
			})
		})
		
		//This is a really hacky way to do it, but it's fine for demonstration purposes
		Promise.all(promises)
		.then(() => {
			if(count <= numAnimes) {
				setTimeout(() => {
					console.log("All promsies finished");
					console.log(JSON.stringify(userFavorites, null, 2));
					
					res.status(200).json(userFavorites)					
				}, 1000)
			}
			else {
				res.status(200).json(userFavorites)		
			}
		})
	})
	.catch(() => {
		console.log("INVALID USERNAME")
		res.status(400).json({message : "INVALID USERNAME"})
	});
}


// Define the API endpoint to receive the AnimeList data
app.post('/api/add-anime', (req, res) => {
	const { anime } = req.body;

	// Check if the `anime` property exists
	if (typeof anime === 'undefined') {
		return res.status(400).json({ error: 'Missing anime data' });
	  }
  
	// Process the received AnimeList data as needed
	console.log('Received anime:', anime);

	// Add the received anime to the AnimeList
	AnimeList.push(anime);

	// Access and print the list on the server-side
	console.log('AnimeList on the server-side:', AnimeList);
  
	res.sendStatus(200); // Sending a success status code 
  });

  app.post('/api/dislike-anime', (req, res) => {
	const { anime } = req.body;

	// Check if the `anime` property exists
	if (typeof anime === 'undefined') {
		return res.status(400).json({ error: 'Missing anime data' });
	  }
  
	// Process the received AnimeDislikedList data as needed
	console.log('received Disliked anime:', anime);

	// Add the received anime to the AnimeDislikedList
	AnimeDislikedList.push(anime);

	// Access and print the list on the server-side
	console.log('AnimeDislikedList on the server-side:', AnimeDislikedList);
  
	res.sendStatus(200); // Sending a success status code 
  });

  // Define the API endpoint to delete an anime from the AnimeList
app.delete('/api/delete-anime', (req, res) => {
	const { anime } = req.body;
  
	if (typeof anime === 'undefined') {
	  return res.status(400).json({ error: 'Missing anime data' });
	}
  
	const index = AnimeList.indexOf(anime);
	if (index === -1) {
	  return res.status(404).json({ error: 'Anime not found' });
	}

	// Remove the anime from the AnimeList
	AnimeList.splice(index, 1);
  
	console.log('Updated AnimeList on the server-side:', AnimeList);
  
	res.sendStatus(200); 
  });

app.delete('/api/delete-disliked-anime', (req, res) => {
	const { anime } = req.body;
	console.log(AnimeDislikedList)
  
	if (typeof anime === 'undefined') {
	  return res.status(400).json({ error: 'Missing anime data' });
	}
  
	const index = AnimeDislikedList.indexOf(anime);
	if (index === -1) {
	  return res.status(404).json({ error: 'Anime not found' });
	}

	// Remove the anime from the AnimeList
	AnimeDislikedList.splice(index, 1);
  
	console.log('Updated AnimeDislikedList on the server-side:', AnimeDislikedList);
  
	res.sendStatus(200); 
});

  // Define the API endpoint to reset the AnimeList
app.delete('/api/reset-anime-list', (req, res) => {
	AnimeList = []; // Reset the AnimeList to an empty array
  
	console.log('AnimeList on the server-side after reset:', AnimeList);
  
	res.sendStatus(200);
});

// Flask Endpoints
app.get('/flask_test',  async (req, res) => {
	console.log("Calling flask test endpoint from express");
	try {
		const response = await axios.get(`${flaskProxy}/test`);
		console.log(response.data);
		res.json(response.data);
	} catch (error) {
		console.error(error);
	}
});

app.get('/flask_getRecs', async (req, res) => {

	console.log("Sending favorites to flask")

	const jsonData = { test: "testValue" };
	
	//If no animes have been favorited, return 400 error
	if(AnimeList.length == 0) {
		console.log("/flask_getRecs: Favorites list is empty, no recs returned.")
		return res.status(400);
	}

	try {
		const response = await axios.post(`${flaskProxy}/getRecs`, jsonData);
		console.log(response.data);
		res.json(response.data);
	}
	catch(error) {
		console.error(error);
	}
})

app.listen(5000, () => {console.log("Server started on port 5000")})
