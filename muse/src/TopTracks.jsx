import React, { useState } from 'react';
import Button from '@mui/material/Button';

function TopTracks() {
    const [topTracks, setTopTracks] = useState(null);
    const [showTopTracks, setShowTopTracks] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    let accessToken = localStorage.getItem("access_token");

    const handleShowTopTracks = async (id, timeRange) => {
        if (!showTopTracks) {
            try {
                const limit = 50;
                const topTracks = await fetchTopTracks(accessToken, timeRange, limit);
                setTopTracks(topTracks);
                setSelectedId(id);
            } catch (error) {
                console.error("Cannot fetch top tracks", error);
            }
        }
        setShowTopTracks(prevState => !prevState);
    };

    return (
        <>
            <Button variant="contained" id="1Year" onClick={() => handleShowTopTracks("1Year", "long_term")}>
                {showTopTracks && selectedId === "1Year" ? 'Hide Top Tracks 1 Year' : 'Show Top Tracks 1 Year'}
            </Button>
            <Button variant="contained" id="6Months" onClick={() => handleShowTopTracks("6Months", "medium_term")}>
                {showTopTracks && selectedId === "6Months" ? 'Hide Top Tracks 6 Months' : 'Show Top Tracks 6 Months'}
            </Button>
            <Button variant="contained" id="4Weeks" onClick={() => handleShowTopTracks("4Weeks", "short_term")}>
                {showTopTracks && selectedId === "4Weeks" ? 'Hide Top Tracks 4 Weeks' : 'Show Top Tracks 4 Weeks'}
            </Button>

            {showTopTracks && topTracks ? (
                <div>
                    {selectedId === "1Year" ? <h2>Top Tracks 1 Year</h2> : 
                     selectedId === "6Months" ? <h2>Top Tracks 6 Months</h2> : 
                     selectedId === "4Weeks" ? <h2>Top Tracks 4 Weeks</h2> : null}
                    
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
    );
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
