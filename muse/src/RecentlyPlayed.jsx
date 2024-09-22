import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; 

function RecentlyPlayed() {
    const [loadingRecentlyPlayed, setLoadingRecentlyPlayed] = useState(false);
    const [recentlyPlayed, setRecentlyPlayed] = useState([]); // Initialize as an empty array


    // Access token retrieval
    const accessToken = localStorage.getItem("access_token");

    const handleShowRecentlyPlayed = async () => {
        setLoadingRecentlyPlayed(true); // Start loading
        try {
            const recentlyPlayedData = await fetchRecentlyPlayed(accessToken);
            setRecentlyPlayed(recentlyPlayedData);
        } catch (error) {
            console.error("Cannot fetch recently played", error);
        } finally {
            setLoadingRecentlyPlayed(false); // End loading
        }
    };

    useEffect(() => {
        handleShowRecentlyPlayed();
    }, []);

    return (
        <>
            {loadingRecentlyPlayed ? (
                <p><CircularProgress /></p>
            ) : (
                 recentlyPlayed.length > 0 ? (
                    <div>
                        <h4>Recently Played Tracks</h4>
                        <ol>
                            {recentlyPlayed.map((item, index) => (
                                <li key={index}>
                                        {item.track.album.images && item.track.album.images[0] && (
                                            <img src={item.track.album.images[0].url} alt="Profile" width={60} />
                                        )}
                                        {item.track.name} by {item.track.artists.map(artist => artist.name).join(", ")}
                                </li>
                            ))}
                        </ol>
                    </div>
                ) : (
                    <CircularProgress/>
                )
            )}
        </>
    )
}

export default RecentlyPlayed;

async function fetchRecentlyPlayed(token) {
    try {
        const result = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=20`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) {
            throw new Error(`Recently played tracks fetch failed: ${result.statusText}`);
        }

        const data = await result.json();
        const recentlyPlayed = data.items || []; // Fallback to an empty array

        if (!recentlyPlayed.length) {
            console.warn("No recently played tracks found.");
            return [];
        }

        console.log("Fetched recently played:", recentlyPlayed);
        return recentlyPlayed;
    } catch (error) {
        console.error("Error fetching recently played:", error);
        return [];
    }
}
