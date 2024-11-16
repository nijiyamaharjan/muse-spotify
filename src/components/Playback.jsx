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
    <div className="m-8">
      <h4 className="text-xl font-bold my-4">Current Playback</h4>
      {loadingPlayback ? (
        <p><CircularProgress /></p>
      ) : (
        playback ? (
          <div className="flex flex-row w-full max-w-md p-4 border rounded-lg shadow-md bg-white">
            <div className="flex">
              {playback.item.album.images && playback.item.album.images[0] && (
                <img
                  src={playback.item.album.images[0].url}
                  className="w-40 h-40 object-cover rounded-lg"
                  alt="Album Cover"
                />
              )}
            </div>
            <div className="ml-3">
              <p className="text-gray-700 text-lg">{playback.item.name}</p>
              <p className="text-gray-700 text-lg">{playback.item.artists[0].name}</p>
              <p className="text-gray-700 text-lg">{playback.item.album.name}</p>
              <p className="text-gray-700 text-lg">
                <span>Playing On: </span>{playback.device.name} ({playback.device.type})
              </p>
              <p className="mt-1">
                <a
                  href={playback.item.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-gray-800 text-white rounded hover:bg-green-700 transition duration-300"
                >
                  <img
                    width={25}
                    src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png"
                    alt="link"
                    className="mr-2 justify-center"
                  />
                  Listen on Spotify
                </a>
              </p>
            </div>
          </div>
        ) : (
          <div>No active playback found.</div>
        )
      )}
    </div>
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

    const text = await result.text(); // Get the response as text
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
