import { useState } from "react"
import './MALsearch.css';


function MalSearch ({setAnimeList}){
    const [userName, setUserName] = useState(' ') 
    
    // handle the api here with the onclick and then update it into the favorite list 
    
    return(
        <div className="malSearch-container">
        <div className="mal-searchbar"> 
            <input className="MAL-input" type="text" placeholder="Username..." value={userName} onChange={(e) => setUserName(e.target.value)} />
            <button className="search-button" onClick={(e) => loadUserFavorites()}> Import Favs From MAL Account </button>
        </div>
        </div>
    )

    async function loadUserFavorites() {
        try {
            console.log("Getting favorites of user " + userName);
            await fetch('/api/get-user-favorites', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ username: userName }),
            })
            .then((response) => {
                console.log("RECEIVED RESULTS")
                if (response.status != 200)
                    throw new Error("Invalid username")
                return response.json()
            }).then((data) => {
                console.log(JSON.stringify(data, null, 2))
                setAnimeList(data)
            }).catch((err) => {
                console.log("ERROR RETRIEVING FAVORITES: " + err)
            });
          } catch (error) {
            console.error('ERROR Failed to retrieve favorites:', error);
          }
    }
} 


export default MalSearch;