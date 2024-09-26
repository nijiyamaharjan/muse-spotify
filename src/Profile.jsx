import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Playback from './Playback';
import CircularProgress from '@mui/material/CircularProgress';

const clientId = import.meta.env.VITE_REACT_APP_CLIENT_ID;

function Profile() {
  //redirectToAuthCodeFlow(clientId);
  const [profile, setProfile] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShowProfile = async () => {
    //localStorage.clear();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    let accessToken = localStorage.getItem("access_token");

    if (!accessToken && !code) {
      redirectToAuthCodeFlow(clientId); // No token or code, redirect to authorize
    } else if (code && !accessToken) {
      // If we have a code, exchange it for an access token
      try {
        accessToken = await getAccessToken(clientId, code);
        const profile = await fetchProfile(accessToken);
        setProfile(profile);

        // Clean up URL after successful exchange
        window.history.replaceState({}, document.title, "/");
      } catch (error) {
        console.error("Authorization error:", error);
        localStorage.removeItem("access_token");
        redirectToAuthCodeFlow(clientId); // Restart auth flow
      }
    } else if (accessToken) {
      setLoading(true);
      // If token exists, use it to fetch profile
      try {
        const profile = await fetchProfile(accessToken);
        setProfile(profile);
      } catch (error) {
        console.error("Token expired or invalid:", error);
        localStorage.removeItem("access_token");
        redirectToAuthCodeFlow(clientId); // Restart auth flow
      } finally {
        setLoading(false);  // End loading
      }
    }
  };

  useEffect(() => {
    handleShowProfile();
  }, []);

  return (
    <>
  {loading ? (
    <div className="flex">
      <CircularProgress />
    </div>
  ) : profile ? (
    <div className='flex flex-col text-left items-center text-white'>
      <div className='flex flex-row'>
        <div>
          {profile.images && profile.images[0] && (
            <img 
              src={profile.images[0].url} 
              alt="Profile" 
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4" 
            />
          )}
        </div>
        <div className='text-left mb-6 ml-3'>
          <div className='flex flex-row'>
            <h2 className="text-2xl font-semibold  mb-4">{profile.display_name} </h2> 
            <a 
              href={profile.external_urls.spotify} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-1.5 h-7 ml-4"
            >
              <img width={25} src="https://storage.googleapis.com/pr-newsroom-wp/1/2023/05/Spotify_Primary_Logo_RGB_Green.png" alt="link" />
            </a>
          </div>
          <p className="text-lg">Email: <span className="font-medium">{profile.email}</span></p>
          <p className="text-lg">User ID: <span className="font-medium">{profile.id}</span></p>
          <p className="text-lg">Followers: <span className="font-medium">{profile.followers.total}</span></p>
        </div> 
      </div>
      
      <Playback />
    </div>
    
  ) : (
    <div className="text-center text-lg text-gray-600">No profile available</div>
  )}
</>

  );
}

async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", 'https://nijiyamaharjan.github.io/muse-spotify/');//"http://localhost:5173/callback");
  params.append("scope", "user-read-private user-read-email user-top-read playlist-read-private playlist-read-collaborative user-read-playback-state user-read-recently-played");
  params.append("code_challenge_method", "S256");
  params.append("code_challenge", challenge);

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "http://localhost:5173/callback");
  params.append("code_verifier", verifier);

  try {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    console.log("Token Request Response:", result);

    if (!result.ok) {
      console.error(`Error during token exchange: ${result.statusText}`);
      throw new Error(`Token request failed: ${result.statusText}`);
    }

    const responseBody = await result.json();
    console.log("Token Response Body:", responseBody);

    const { access_token } = responseBody;
    if (!access_token) {
      throw new Error("No access token received from Spotify.");
    }

    // Store and return access token
    localStorage.setItem("access_token", access_token);
    console.log("Access token stored successfully.");
    return access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
}


async function fetchProfile(token) {
  try {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!result.ok) {
      throw new Error(`Profile fetch failed: ${result.statusText}`);
    }

    const profile = await result.json();
    localStorage.setItem("user_id", profile.id);
    console.log("Fetched profile:", profile);
    return profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export default Profile;
