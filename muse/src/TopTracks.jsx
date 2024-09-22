import React, {useEffect, useState} from 'react';
import Button from '@mui/material/Button';

function TopTracks() {
    const [topTracks, setTopTracks] = useState(null);
    const [showTopTracks, setShowTopTracks] = useState(false);
    let accessToken = localStorage.getItem("access_token");

    const handleShowTopTracks_1Year = async () => {
        if (!showTopTracks) {
            try {
            const timeRange = 'long_term';
            const limit = 50;
            const topTracks = await fetchTopTracks(accessToken, timeRange, limit);
            setTopTracks(topTracks);
          } catch (error) {
            console.error("Cannot fetch top tracks", error);
          }
        }
        setShowTopTracks(prevState => !prevState);
    };

    const handleShowTopTracks_6Months = async () => {
        if (!showTopTracks) {
            try {
            const timeRange = 'medium_term';
            const limit = 50;
            const topTracks = await fetchTopTracks(accessToken, timeRange, limit);
            setTopTracks(topTracks);
          } catch (error) {
            console.error("Cannot fetch top tracks", error);
          }
        }
        setShowTopTracks(prevState => !prevState);
    };

    const handleShowTopTracks_4Weeks = async () => {
        if (!showTopTracks) {
            try {
            const timeRange = 'short_term';
            const limit = 50;
            const topTracks = await fetchTopTracks(accessToken, timeRange, limit);
            setTopTracks(topTracks);
          } catch (error) {
            console.error("Cannot fetch top tracks", error);
          }
        }
        setShowTopTracks(prevState => !prevState);
    };

    return (
    <>
      <Button variant="contained" id="1Year" onClick={handleShowTopTracks_1Year}>
        {showTopTracks ? 'Hide Top Tracks 1 Year' : 'Show Top Tracks 1 Year'}
      </Button>
      <Button variant="contained" id="6Months" onClick={handleShowTopTracks_6Months}>
        {showTopTracks ? 'Hide Top Tracks 6 Months' : 'Show Top Tracks 6 Months'}
      </Button>
      <Button variant="contained" id="4Weeks" onClick={handleShowTopTracks_4Weeks}>
        {showTopTracks ? 'Hide Top Tracks 4 Weeks' : 'Show Top Tracks 4 Weeks'}
      </Button>
      {showTopTracks && topTracks ? (
        <div>
          {<h2>Top Tracks</h2>}
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

async function fetchTopTracks(token, timeRange, limit) {
    try {
        const result = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=0`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) {
            throw new Error(`Top tracks fetch failed: ${result.statusText}`);
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
