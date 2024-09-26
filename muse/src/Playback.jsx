import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress'; 

function Playback() {
    const [playback, setPlayback] = useState(null);
    const [loadingPlayback, setLoadingPlayback] = useState(false);
    const accessToken = localStorage.getItem("access_token");

    const handleShowPlayback = async () => {
        setLoadingPlayback(true); // Start loading
        try {
            const playbackData = await fetchPlayback(accessToken);
            setPlayback(playbackData);
        } catch (error) {
            console.error("Cannot fetch playback", error);
        } finally {
            setLoadingPlayback(false); // End loading
        }
    };

    useEffect(() => {
        handleShowPlayback();
    }, []);

    return (
        <>
            {loadingPlayback ? (
                <p><CircularProgress /></p>
            ) : (
                playback ? (
                    <div>
                        <h4>Current Playback</h4>
                        <p>Device: {playback.device.name} ({playback.device.type})</p>
                        <p>Title: <a href={playback.item.external_urls.spotify}>{playback.item.name}</a></p>
                        <p>Album: <a href={playback.item.album.external_urls.spotify}>{playback.item.album.name}</a></p>
                    </div>
                ) : (
                    <div>No active playback</div>
                )
            )}

           
        </>
    );
}

export default Playback;

async function fetchPlayback(token) {
    try {
        const result = await fetch(`https://api.spotify.com/v1/me/player`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!result.ok) {
            throw new Error(`Playback fetch failed: ${result.statusText}`);
        }

        const text = await result.text();  // Get the response as text
        if (!text) {
            console.log("No content returned from the API.");
            return null;
        }

        const playback = JSON.parse(text);

        if (!playback) {
            console.log("No active playback found.");
            return null;
        }

        console.log("Fetched playback:", playback);
        return playback;
    } catch (error) {
        console.error("Error fetching playback:", error);
        return null;
    }
}

// async function fetchRecentlyPlayed(token) {
//     try {
//         const result = await fetch(`https://api.spotify.com/v1/me/player/recently-played?limit=20`, {
//             method: "GET",
//             headers: { Authorization: `Bearer ${token}` }
//         });

//         if (!result.ok) {
//             throw new Error(`Recently played tracks fetch failed: ${result.statusText}`);
//         }

//         const data = await result.json();
//         const recentlyPlayed = data.items || []; // Fallback to an empty array

//         if (!recentlyPlayed.length) {
//             console.warn("No recently played tracks found.");
//             return [];
//         }

//         console.log("Fetched recently played:", recentlyPlayed);
//         return recentlyPlayed;
//     } catch (error) {
//         console.error("Error fetching recently played:", error);
//         return [];
//     }
// }
