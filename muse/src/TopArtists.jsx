import React, { useState } from 'react';
import Button from '@mui/material/Button';

function TopArtists() {
    const [topArtists, setTopArtists] = useState(null);
    const [showTopArtists, setShowTopArtists] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    let accessToken = localStorage.getItem("access_token");

    const handleShowTopArtists = async (id, timeRange) => {
        if (!showTopArtists) {
            try {
                const limit = 50;
                const topArtists = await fetchTopArtists(accessToken, timeRange, limit);
                setTopArtists(topArtists);
                setSelectedId(id);
            } catch (error) {
                console.error("Cannot fetch top artists", error);
            }
        }
        setShowTopArtists(prevState => !prevState);
    };

    return (
        <>
            <Button variant="contained" id="1Year" onClick={() => handleShowTopArtists("1Year", "long_term")}>
                {showTopArtists && selectedId === "1Year" ? 'Hide Top Artists 1 Year' : 'Show Top Artists 1 Year'}
            </Button>
            <Button variant="contained" id="6Months" onClick={() => handleShowTopArtists("6Months", "medium_term")}>
                {showTopArtists && selectedId === "6Months" ? 'Hide Top Artists 6 Months' : 'Show Top Artists 6 Months'}
            </Button>
            <Button variant="contained" id="4Weeks" onClick={() => handleShowTopArtists("4Weeks", "short_term")}>
                {showTopArtists && selectedId === "4Weeks" ? 'Hide Top Artists 4 Weeks' : 'Show Top Artists 4 Weeks'}
            </Button>

            {showTopArtists && topArtists ? (
                <div>
                    {selectedId === "1Year" ? <h2>Top Artists 1 Year</h2> : 
                     selectedId === "6Months" ? <h2>Top Artists 6 Months</h2> : 
                     selectedId === "4Weeks" ? <h2>Top Artists 4 Weeks</h2> : null}
                    
                    <ol>
                        {topArtists.map(artist => (
                            <li key={artist.id}>
                                {artist.name}
                            </li>
                        ))}
                    </ol>
                </div>
            ) : (
                <p>Top Artists Hidden</p>
            )}
        </>
    );
}

export default TopArtists;

async function fetchTopArtists(token, timeRange, limit) {
    try {
        const result = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}&offset=0`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) {
            throw new Error(`Top artists fetch failed: ${result.statusText}`);
        }

        const data = await result.json();
        const topArtists = data.items;
        console.log("Fetched top artists:", topArtists);
        return topArtists;
    } catch (error) {
        console.error("Error fetching top artists:", error);
        return [];
    }
}
