import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MalSearch from './components/MALsearch';
import sun from './assets/duck.gif';
import './App.css';

function AnimeButton({ anime, addNewItem, addNewDislikedItem }) {
  const { image_url } = JSON.parse(anime.images).jpg;

  return (
    <div className="Anime-Block anime-holder" key={anime.id}>
      <div className="descriptions">{anime.synopsis}</div>
      <div
        className="anime-image"
        style={{
          backgroundImage: `url(${image_url})`,
        }}
      /> 
      <div className="anime-title">{anime.title}</div> 
      <button className="insert-anime-button" onClick={addNewItem} value={anime.title}>
        Like Anime
      </button>
      <button className="insert-anime-button" onClick={addNewDislikedItem} value={anime.title}>
        Dislike Anime
      </button>
    </div>
  );
}

function App() {

  const [testData, setTestData] = useState([{}]);
  const [malTest, setMalTest] = useState([{}]);
  const [id, setId] = useState(1476);
  const [animes, setAnimes] = useState([]);
  const [recommendationsList, setRecommendationList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [waitDislike, setWaitDislike] = useState(true);
  const [waitLike, setWaitLike] = useState(true);

  // State variable to toggle between cleaned and uncleaned recommendations
  const [cleanedRecommendations, setCleanedRecommendations] = useState(
    JSON.parse(localStorage.getItem('cleanedRecommendations')) || false
  );

  // Effect hook to save cleanedRecommendations to local storage
  useEffect(() => {
    localStorage.setItem('cleanedRecommendations', JSON.stringify(cleanedRecommendations));
  }, [cleanedRecommendations]);

 
  // Defining Favorite List local storage
  const [AnimeList, setAnimeList] = useState(
    JSON.parse(localStorage.getItem('favoriteAnimeList')) || []
  );

  // Defining Disliked List local storage
  const [DislikedAnimeList, setDislikedAnimeList] = useState(
    JSON.parse(localStorage.getItem('dislikedAnimeList')) || []
  );
  
  // Function to handle the toggle button click
  const handleToggleRecommendations = () => {
    setCleanedRecommendations(!cleanedRecommendations);
  };

  // Placing AnimeList into local cache update when AnimeList changes
  useEffect(() => {
    localStorage.setItem('favoriteAnimeList', JSON.stringify(AnimeList));
    console.log(AnimeList)
  }, [AnimeList]);

  // Placing DislikedAnimeList into local cache update when DislikedAnimeList changes
  useEffect(() => {
    localStorage.setItem('dislikedAnimeList', JSON.stringify(DislikedAnimeList));
    console.log(DislikedAnimeList)
  }, [DislikedAnimeList]);

  // Looks like repeat code?
  useEffect(() => {
    const storedAnimeList = localStorage.getItem('favoriteAnimeList');
    if (storedAnimeList) {
      setAnimeList(JSON.parse(storedAnimeList));
    }
  }, []);

  useEffect(() => {
    const storedDislikedAnimeList = localStorage.getItem('dislikedAnimeList');
    if (storedDislikedAnimeList) {
      setDislikedAnimeList(JSON.parse(storedDislikedAnimeList));
    }
  }, []);

  //Test Code (Remove? Parm?)
  useEffect(() => {
    fetch('/api')
      .then((response) => response.json())
      .then((data) => {
        setTestData(data);
      });
  }, []);

  // Define an asynchronous function named fetchRecommendations
  const fetchRecommendations = async () => {
    setRecommendationList([]);
    const data = { anime_titles: AnimeList }; // Prepare the data to be sent in the request body 
    console.log("Sending to ML:", data);

    try {
      const queryString = JSON.stringify(data);
      const headers = {'Content-Type': 'application/json'};
      const rec_number = 20 + DislikedAnimeList.length; // probs place this somewhere else

      // Try to send a POST request to the server at 'http://localhost:7000/getRecs'
      console.log("cleaned rec: ",cleanedRecommendations);
      const response = await fetch(`http://localhost:7000/getRecs?recs=${rec_number}&cleaned=${cleanedRecommendations}`, { //now takes in cleaned or uncleaned
        method:'POST', 
        headers: headers,
        body: JSON.stringify(data)
      });

      
      // Check if the response from the server is successful (status code in the 2xx range)
      if (response.ok) {
        // If the response is successful, parse the JSON data from the response body
        // The JSON data contains the recommendation list
        const recommendationList = await response.json();
        console.log('Recommendation IDs:', recommendationList);
        // Update the recommendationList state with the received recommendations
        setRecommendationList(recommendationList);
      } else {
        // If the response is not successful, log an error indicating the failure to fetch anime recommendations
        console.error('Failed to fetch anime recommendations');
      }
    } catch (error) {
      // If there is an error during the fetch request, catch it and log an error message
      console.error('Error fetching anime recommendations:', error);
    }
  };

  useEffect(() => {
    // Call the function to fetch recommendations when AnimeList changes
    fetchRecommendations();
  }, [AnimeList, DislikedAnimeList, cleanedRecommendations]);

  //Test Code (Keep until ML is integrated)
  useEffect(() => {
    const fetchData = async (currentId) => {
      try {
        const response = await fetch(`/database/getAnimeInfo?id=${currentId}`);
        if (response.ok) {
          const data = await response.json();
          const isDuplicate = animes.some((anime) => anime.id === data.id);
          if (!isDuplicate) {
            setAnimes((prevAnimes) => [...prevAnimes, data]);
          }
          setMalTest(data);
        } else {
          console.error('Failed to fetch anime data');
        }
      } catch (error) {
        console.error('Error fetching anime data:', error);
      }
    };
    
    const fetchMultipleData = async () => {
      console.log("Rec Ids:", recommendationsList);
      let ids = [];
      ids = recommendationsList;
      const promises = ids.map((currentId) => fetchData(currentId));
      await Promise.all(promises);
    };
      fetchMultipleData();
      setWaitDislike(true);
      setWaitLike(true);
  }, [recommendationsList]);

  //18 animes displayed (Secondary Searchbar doesn't exist anymore)
  // filteredAnimes will have animes that match the search term, animes that are not in the DislikedAnimeList, and animes
  // that are not in the favorite animes list
  const filteredAnimesTest = animes.filter((anime) => anime.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
                    !DislikedAnimeList.includes(anime.title) && !AnimeList.includes(anime.title));
  const filteredAnimes = Array.from(new Set(filteredAnimesTest));

  //UNIT TEST//
  const animeSet = new Set(filteredAnimes.map((anime) => anime.title.toLowerCase()));
  const hasDuplicates = animeSet.size !== filteredAnimes.length;

  // Print the result
  if (hasDuplicates) {
    console.log('The filteredAnimes array contains duplicates.');
  } else {
    console.log('The filteredAnimes array does not contain duplicates.');
  }
  //UNIT TEST END//

  const numAnimes = 18;
  const numAnimesInRow = 6;
  const anime_rows = [];

  for (let i = 0; i < numAnimes; i += numAnimesInRow) {
    const rowAnimes = filteredAnimes.slice(i, i + numAnimesInRow);
    anime_rows.push(rowAnimes);
  }

  async function addNewItem(anime_add) {
    if (waitLike) {
      setWaitLike(false);
      anime_add.preventDefault();

      const newAnime = anime_add.target.value; // Anime name

      if (AnimeList.includes(newAnime)) { // Checks if anime is in the list already
        return; // won't add it to the list
      }

      try {
        const response = await fetch('/api/add-anime', { // send to server backend
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ anime: newAnime }),
        });
        if (response.ok) {
          setAnimeList((prevList) => [...prevList, newAnime]); // add the anime to the list
          setAnimes([]) // reset the animes that will be displayed for recommendations
          console.log('Anime added successfully!');
        } else {
          setWaitLike(true);
          console.error('Failed to add anime');
        }
      } catch (error) {
        console.error('Failed to add anime:', error);
      }
    }
  }

  async function addNewDislikedItem(anime_add) {
    if (waitDislike) {
      setWaitDislike(false);
      anime_add.preventDefault();
      const newAnime = anime_add.target.value;
      if (DislikedAnimeList.includes(newAnime)) { //Do nothing if repeat
        return;
      }

      try {
        const response = await fetch('/api/dislike-anime', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ anime: newAnime }),
        });
        if (response.ok) {
          setDislikedAnimeList((prevList) => [...prevList, newAnime]);
          setAnimes([]) // reset the animes that will be displayed for recommendations
          console.log('Anime disliked successfully!');
        } else {
          setWaitDislike(true);
          console.error('Failed to dislike anime');
        }
      } catch (error) {
        console.error('Failed to dislike anime:', error);
      }
    }
  }

  /**** deleteItem ****/
  // uses api method DELETE to check if response is possible. If OK then delete if not then throw error 
  const deleteItem = async (item) => {
    try {
      const response = await fetch('/api/delete-anime', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anime: item }),
      });
      if (response.ok) {
        setAnimeList((prevList) => prevList.filter((anime) => anime !== item)); // Update the AnimeList state
        setAnimes([]) // reset the animes that will be displayed for recommendations
        console.log('Anime deleted successfully!');
      } else {
        console.error('Failed to delete anime');
      }
    } catch (error) {
      console.error('Failed to delete anime:', error);
    }
  };

  const deleteDislikedItem = async (item) => {
    try {
      const response = await fetch('/api/delete-disliked-anime', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anime: item }),
      });
      if (response.ok) {
        setDislikedAnimeList((prevList) => prevList.filter((anime) => anime !== item)); // Update the AnimeList state
        setAnimes([]) // reset the animes that will be displayed for recommendations
        console.log('Disliked Anime deleted successfully!');
      } else {
        console.error('Failed to delete anime');
      }
    } catch (error) {
      console.error('Failed to delete anime:', error);
    }
  };
  /**** END OF deleteItem  ****/

  /**** resetList ****/
  // try the DELTE method if ok then delete list setAnimeList. If response is not ok throw error
  const resetList = async () => {
    try {
      const response = await fetch('/api/reset-anime-list', {
        method: 'DELETE',
      });
      if (response.ok) {
        setAnimeList([]); // Clear the AnimeList state
        setDislikedAnimeList([]); //clear the dislike anime list too. 
        setRecommendationList([]); // reset the list the recommended list given from the flask server
        setAnimes([]) // reset the animes that will be displayed for recommendations
        console.log('Anime list reset successfully!');
      } else {
        console.error('Failed to reset anime list');
      }
    } catch (error) {
      console.error('Failed to reset anime list:', error);
    }
  };
  /*** END OF resetList ****/

  return (
      <div>
      <MalSearch setAnimeList={setAnimeList}/>
      <Sidebar  favAnimes={AnimeList} disAnimes={DislikedAnimeList} 
                deleteItem={deleteItem} deleteDislikedItem={deleteDislikedItem} 
                resetList={resetList} />
      <body>
        <Header animes={animes} setAnimes={setAnimes} setAnimeList={setAnimeList} AnimeList={AnimeList} cleanedRecommendations={cleanedRecommendations}
        handleToggleRecommendations={handleToggleRecommendations} />
        <br></br> {/* Gap Break Line */}

        {AnimeList.length <= 0 ? (
          <div className="no-recommendation-instructions">
            <h1>NO RECOMMENDATIONS</h1>
            <div className="image-holder">
              <img src={sun} alt="sleepingCat" /> {/* Duck is called sleepingCat? Why? A: because it used to be a picture of a sleeping cat :D*/}
            </div>
          </div>
        ) : (
          <div className="Anime-Container">
            <h1 className="recommendation-header"> RECOMMENDATIONS </h1>
            {anime_rows.map((anime_rows, rowIndex) => (
              <div className="Anime-Row" key={rowIndex}>
                {anime_rows.map((anime) => (
                  <React.Fragment key={rowIndex}> 
                    <AnimeButton anime={anime} addNewItem={addNewItem} addNewDislikedItem={addNewDislikedItem}/>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        )}
      </body>
    </div>
  );
}

export default App;