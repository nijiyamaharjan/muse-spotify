import React, {useEffect, useState} from 'react';
import Button from '@mui/material/Button';

function TopTracks() {
    const [topTracks, setTopTracks] = useState(null);
    const [showTopTracks, setShowTopTracks] = useState(false);
    let accessToken = localStorage.getItem("access_token");

    const handleShowTopTracks = async () => {
        if (!showTopTracks) {
            try {
            const topTracks = await fetchTopTracks(accessToken);
            setTopTracks(topTracks);
          } catch (error) {
            console.error("Cannot fetch top tracks", error);
          }
        }
        setShowTopTracks(prevState => !prevState);
    };

    return (
    <>
      <Button variant="contained" onClick={handleShowTopTracks}>
        {showTopTracks ? 'Hide Top Tracks' : 'Show Top Tracks'}
      </Button>
      {showTopTracks && topTracks ? (
        <div>
          <h2>Top Tracks</h2>
          <ol>
            {topTracks.map(track => (
              <li key={track.id}>
                {track.name} by {track.artists.map(artist => artist.name).join(", ")}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p>Top Tracks Hidden</p>
      )}
    </>
    )
}

export default TopTracks;

async function fetchTopTracks(token) {
    try {
        const result = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=50&offset=0", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) {
            throw new Error(`Top tracks fetch failed: ${result.statusText}`);
        } else 
        {
            console.log(result);
        }

        const data = await result.json();
        const topTracks = data.items;
        console.log("Fetched top tracks:", topTracks);
        return topTracks;
    } catch (error) {
        console.error("Error fetching top tracks:", error);
        return [];
    }
}