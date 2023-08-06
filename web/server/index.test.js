const request = require('supertest');
const app = require('../client/app.js'); // Replace with the path to your Express app file

// Test /api/get-user-favorites Endpoint
test('GET /api/get-user-favorites returns user favorite animes', async () => {
  // Arrange
  const username = 'testuser'; // Replace 'testuser' with a valid username for testing
  const expectedFavorites = ['Naruto', 'One Piece']; // Replace with expected favorite animes

  // Act
  const response = await request(app).post('/api/get-user-favorites').send({ username });

  // Assert
  expect(response.status).toBe(200);
  expect(response.body).toEqual(expectedFavorites);
});

// // Test /api/add-anime Endpoint
// test('POST /api/add-anime adds a new anime to AnimeList', async () => {
//   // Arrange
//   const anime = { anime: 'Naruto' }; // Replace 'Naruto' with the anime to add

//   // Act
//   const response = await request(app).post('/api/add-anime').send(anime);

//   // Assert
//   expect(response.status).toBe(200);
//   expect(app.AnimeList).toContain('Naruto');
// });

// // Test /api/delete-anime Endpoint
// test('DELETE /api/delete-anime removes an anime from AnimeList', async () => {
//   // Arrange
//   const animeToDelete = { anime: 'Naruto' }; // Replace 'Naruto' with the anime to delete
//   app.AnimeList = ['Naruto', 'One Piece', 'Dragon Ball']; // Sample AnimeList

//   // Act
//   const response = await request(app).delete('/api/delete-anime').send(animeToDelete);

//   // Assert
//   expect(response.status).toBe(200);
//   expect(app.AnimeList).not.toContain('Naruto');
// });

// // Test /api/reset-anime-list Endpoint
// test('DELETE /api/reset-anime-list resets AnimeList to an empty array', async () => {
//   // Arrange
//   app.AnimeList = ['Naruto', 'One Piece', 'Dragon Ball']; // Sample AnimeList

//   // Act
//   const response = await request(app).delete('/api/reset-anime-list');

//   // Assert
//   expect(response.status).toBe(200);
//   expect(app.AnimeList).toEqual([]);
// });

// // Test /flask_getRecs Endpoint
// test('GET /flask_getRecs returns recommended animes', async () => {
//   // Arrange
//   app.AnimeList = ['Naruto', 'One Piece']; // Sample AnimeList with favorite animes

//   // Act
//   const response = await request(app).get('/flask_getRecs');

//   // Assert
//   expect(response.status).toBe(200);
//   // Add more assertions to check if the response contains the expected recommended animes
// });

// // Test /database/getAnimeInfo Endpoint
// test('GET /database/getAnimeInfo returns anime information for a valid ID', async () => {
//   // Arrange
//   const validId = 1; // Replace 1 with a valid anime ID in the database
//   const expectedAnimeInfo = {
//     id: 1,
//     title: 'Naruto',
//     images: 'path/to/anime-image.jpg',
//     synopsis: 'Synopsis of Naruto',
//   };

//   // Act
//   const response = await request(app).get(`/database/getAnimeInfo?id=${validId}`);

//   // Assert
//   expect(response.status).toBe(200);
//   expect(response.body).toEqual(expectedAnimeInfo);
// });
