import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Playback from './Playback';
import CircularProgress from '@mui/material/CircularProgress'; 

const clientId = import.meta.env.VITE_REACT_APP_CLIENT_ID;

function Profile() {
  // redirectToAuthCodeFlow(clientId);
  const [profile, setProfile] = useState(null);
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShowProfile = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    let accessToken = localStorage.getItem("access_token");
    setAccess(accessToken);

    if (!accessToken && !code) {
      redirectToAuthCodeFlow(clientId); // No token or code, redirect to authorize
    } else if (code) {
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
    } else {
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
    // setShowProfile(prevState => !prevState);
  };

  useEffect(() => {
    handleShowProfile();
}, []);

  return (
    <>
    <h1 className="text-3xl font-bold underline">Muse</h1>
    {/* <Button variant="contained" onClick={handleShowProfile}>{!showProfile? 'Show Profile': 'Hide Profile'}</Button> */}
    {loading ? (
      <CircularProgress />
    ) : profile ? (
      <div>
        <h2>{profile.display_name}</h2>
        {profile.images && profile.images[0] && (
          <img src={profile.images[0].url} alt="Profile" width={200} />
        )}
        <p>Email: {profile.email}</p>
        <p>User ID: {profile.id}</p>
        <p>Followers: {profile.followers.total}</p>
        <a href={profile.external_urls.spotify}>Spotify Profile Link</a>
        <Playback />
      </div>
    ) : (
      <CircularProgress/>
    )}
  </>
  );
};

async function redirectToAuthCodeFlow(clientId) {
  const verifier = generateCodeVerifier(128);
  const challenge = await generateCodeChallenge(verifier);

  localStorage.setItem("verifier", verifier);

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("response_type", "code");
  params.append("redirect_uri", "http://localhost:5173/callback");
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
  params.append("scope", "user-read-private user-read-email user-top-read playlist-read-private playlist-read-collaborative user-read-playback-state user-read-recently-played");

  try {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    if (!result.ok) {
      throw new Error(`Token request failed: ${result.statusText}`);
    }

    const { access_token } = await result.json();
    localStorage.setItem("access_token", access_token);
    console.log("Access Token:", access_token);
    return access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error; // Propagate error for handling in the calling function
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
