import React from 'react';
import './Sidebar.css';
import MalSearch from './MALsearch';

const Sidebar = ({ favAnimes, disAnimes, deleteItem,deleteDislikedItem, resetList }) => {
  const handleDelete = (item) => {
    deleteItem(item);
  };

  const handleDislikedDelete = (item) => {
    deleteDislikedItem(item);
  };

  const handleReset = () => {
    resetList();
  };

  return (
    <div className="sidebar-container">
      <div className="Sidebar">
        <h2>Favorite Anime</h2>
        {/* Reset Button that resets the Favorite Anime List and Disliked Anime List*/}
        <button onClick={handleReset} className="reset-btn">Reset</button>
        <ul>
          {/* Unordered List of Favorite Animes */}
          {favAnimes && favAnimes.length > 0 ? (
            favAnimes.map((anime, index) => (
              <li key={index}>
                <button onClick={() => handleDelete(anime)} className="delete-btn">X</button> {/* Delete Button "X" */}
                <span>{anime}</span>
              </li>
            ))
          ) : (
            // When list is Empty
            <li>Anime Hater</li> 
          )}
        </ul>

        <h2>Disliked Anime</h2>
        <ul>
          {/* Unordered List of Favorite Animes */}
          {disAnimes && disAnimes.length > 0 ? (
            disAnimes.map((anime, index) => (
              <li key={index}>
                <button onClick={() => handleDislikedDelete(anime)} className="delete-btn">X</button>
                <span>{anime}</span>
              </li>
            ))
          ) : (
            // When list is Empty
            <li>Anime Lover</li> 
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
