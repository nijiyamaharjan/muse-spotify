import React, { useState } from 'react';
import Button from '@mui/material/Button';

function Playlists() {
    const [playlists, setPlaylists] = useState(null);
    const [showPlaylists, setShowPlaylists] = useState(false);
    const [selectedId, setSelectedId] = useState(null); // Added state for selected ID
    let accessToken = localStorage.getItem("access_token");
    let userId = localStorage.getItem("user_id");

    const handleShowPlaylists = async () => {
        if (!showPlaylists) {
            try {
                const limit = 50;
                const fetchedPlaylists = await fetchPlaylists(accessToken, limit, userId);
                setPlaylists(fetchedPlaylists);
            } catch (error) {
                console.error("Cannot fetch playlists", error);
            }
        }
        setShowPlaylists(prevState => !prevState);
    };

    return (
        <>
            <Button variant="contained" id="playlists" onClick={handleShowPlaylists}>
                {showPlaylists ? 'Hide Playlists' : 'Show Playlists'}
            </Button>

            {showPlaylists && playlists ? (
                <div>
                    <h2>Playlists</h2>
                    {playlists.length > 0 ? (
                        <ol>
                            {playlists.map(playlist => (
                                <li key={playlist.id}>
                                    {playlist.name} by {playlist.owner.display_name}
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p>No playlists found.</p>
                    )}
                </div>
            ) : (
                <p>Playlists Hidden</p>
            )}
        </>
    );
}

export default Playlists;

async function fetchPlaylists(token, limit, userId) {
    try {
        const result = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists?limit=${limit}&offset=0`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) {
            throw new Error(`Playlists fetch failed: ${result.statusText}`);
        }

        const data = await result.json();
        const playlists = data.items;
        console.log("Fetched playlists:", playlists);
        return playlists;
    } catch (error) {
        console.error("Error fetching playlists:", error);
        return [];
    }
}
