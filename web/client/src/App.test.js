import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});


// import React from 'react';
// import { render, fireEvent } from '@testing-library/react';
// import App from './App';

// test('clicking "Like Anime" button adds an anime to the AnimeList', () => {
//   const { getByText } = render(<App />);
//   const likeButton = getByText('Like Anime');

//   fireEvent.click(likeButton);

//   // Implement further assertions to check if the anime is added to AnimeList
// });



// import React from 'react';
// import { render, fireEvent } from '@testing-library/react';
// import App from './App';

// test('clicking "Dislike Anime" button adds an anime to the DislikedAnimeList', () => {
//   const { getByText } = render(<App />);
//   const dislikeButton = getByText('Dislike Anime');

//   fireEvent.click(dislikeButton);

//   // Implement further assertions to check if the anime is added to DislikedAnimeList
// });


// import React from 'react';
// import { render, waitFor } from '@testing-library/react';
// import App from './App';

// test('renders the Recommendations section with anime recommendations', async () => {
//   // Mock the API response to return some recommendations
//   jest.spyOn(window, 'fetch').mockResolvedValue({
//     ok: true,
//     json: () => Promise.resolve([/* mock your recommendations data here */]),
//   });

//   const { getByText } = render(<App />);

//   // Wait for the recommendations to be fetched and displayed
//   await waitFor(() => getByText('RECOMMENDATIONS'));

//   // Implement further assertions to check if the recommendations are displayed correctly
// });



// import React from 'react';
// import { render, fireEvent } from '@testing-library/react';
// import App from './App';

// test('toggling the recommendations works correctly', () => {
//   const { getByTestId, getByText } = render(<App />);

//   const toggleButton = getByTestId('toggle-button');

//   fireEvent.click(toggleButton);

//   // Implement assertions to check if the recommendations are toggled correctly
// });


// import React from 'react';
// import { render, fireEvent, waitFor } from '@testing-library/react';
// import App from './App';

// test('deleting an anime from AnimeList works correctly', async () => {
//   // Mock the API response to return a successful deletion
//   jest.spyOn(window, 'fetch').mockResolvedValue({
//     ok: true,
//   });

//   const { getByText } = render(<App />);

//   // Wait for the recommendations to be fetched and displayed
//   await waitFor(() => getByText('RECOMMENDATIONS'));

//   const deleteButton = getByText('Delete'); // Adjust the text to match the delete button's text

//   fireEvent.click(deleteButton);

//   // Implement assertions to check if the anime is deleted from AnimeList
// });



