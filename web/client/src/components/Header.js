import React, { useEffect, useState, useRef } from 'react';
import './Header.css';

function Header({ animes, setAnimes, setAnimeList, AnimeList,cleanedRecommendations, handleToggleRecommendations, }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [aniList, setAniList] = useState([]);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchAnimeData(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setSearchTerm(''); // Collapse the dropdown by resetting the search term
      }
    };

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const fetchAnimeData = async (searchTerm) => {
    try {
      const response = await fetch(`/database/animeSearch?title=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        // console.log("Animes List:", data.map(anime => anime.title));
        setAniList(data);
      } else {
        console.error('Failed to fetch anime data');
      }
    } catch (error) {
      console.error('Failed to fetch anime data:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddAnime = async (animeTitle) => {
    if (AnimeList.includes(animeTitle)) {
      return; // Do not add if it already exists
    }
    
    try {
      const response = await fetch('/api/add-anime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anime: animeTitle }),
      });

      if (response.ok) {
        setAnimeList((prevList) => [...prevList, animeTitle]);
        setAnimes([])
        console.log('Anime added successfully!');
      } else {
        console.error('Failed to add anime');
      }
    } catch (error) {
      console.error('Failed to add anime:', error);
    }
  };

  return (


    <div className="Header">
    <div className="recommendation-switch" style={{ marginTop: '20px' }}>
      <button className={`toggle-button ${cleanedRecommendations ? 'cleaned' : 'uncleaned'}`} onClick={handleToggleRecommendations}>
        {cleanedRecommendations ? 'Cleaned' : 'Uncleaned'}
      </button>
      <div style={{ color: 'white', marginTop: '8px' }}>Reload page after toggling</div>
    </div>

      <h1>Anim<strong>AI</strong></h1>
      <div className="searchBar" ref={searchRef}>
        {AnimeList.length <= 0 && (
          <h3 className="instruction">Search Animes to get Recommendations</h3>
        )}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="dropdown" ref={dropdownRef}>
        {searchTerm.length > 0 && (
          <ul>
            {aniList.slice(0, 5).map((anime) => {
              const { image_url } = JSON.parse(anime.images).jpg;
              return (
                <li key={anime.id} onClick={() => handleAddAnime(anime.title)}>
                  <div
                    className="animePic"
                    style={{ backgroundImage: `url(${image_url})` }}
                  ></div>
                  <span className="animeTitle">{anime.title}</span>
                  <div className="description">{anime.synopsis}</div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Header;
