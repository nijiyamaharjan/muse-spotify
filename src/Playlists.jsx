import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress'; 

function Playlists() {
    const [playlists, setPlaylists] = useState(null);
    const [showPlaylists, setShowPlaylists] = useState(true);
    const [loading, setLoading] = useState(false);
    let accessToken = localStorage.getItem("access_token");
    let userId = localStorage.getItem("user_id");

    const handleShowPlaylists = async () => {
        setLoading(true);
            try {
                const limit = 50;
                const fetchedPlaylists = await fetchPlaylists(accessToken, limit, userId);
                setPlaylists(fetchedPlaylists);
            } catch (error) {
                console.error("Cannot fetch playlists", error);
            } finally {
                setLoading(false);  // End loading
            }
    };

    useEffect(() => {
        handleShowPlaylists();
    }, []);
    return (
        <>
    {loading ? (
        <CircularProgress />
    ) : (
        showPlaylists && playlists ? (
            <div>
    <h1 className="text-3xl font-bold mb-6" >Public Playlists</h1>
    {playlists.length > 0 ? (
        <ol className="flex flex-wrap">
            {playlists.filter(playlist => playlist.owner.display_name == 'nijiya').map(playlist => (
                <li key={playlist.id} className="flex flex-col m-4 items-start"> {/* Added items-start for left alignment */}
                    {playlist.images && playlist.images[0] && (
                        <img 
                            src={playlist.images[0].url} 
                            alt="Playlist" 
                            width={60} 
                            className="w-72 h-72 object-cover" 
                        />
                    )}
                    <div className="flex flex-col w-64 text-left"> {/* Added text-left for left alignment */}
                        <span className="font-semibold mt-2">{playlist.name}</span> {/* Make the name bold */}
                        <span className="text-gray-700">by {playlist.owner.display_name}</span> {/* Use a separate span for the owner */}
                    </div>
                </li>
            ))}
        </ol>
    ) : (
        <p>No playlists found.</p>
    )}
</div>

        ) : (
            <CircularProgress/>
        )
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
