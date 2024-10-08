const clientId = "1c36f767e20148c089bc411db8571932";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

let accessToken = localStorage.getItem("access_token");

if (!accessToken && !code) {
    redirectToAuthCodeFlow(clientId);  // No token or code, redirect to authorize
} else if (code) {
    // If we have a code, exchange it for an access token
    accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    populateUI(profile);
} else {
    // If token exists, use it to fetch profile
    try {
        const profile = await fetchProfile(accessToken);
        populateUI(profile);
    } catch (error) {
        console.error("Token expired or invalid, restarting flow");
        localStorage.removeItem("access_token");
        redirectToAuthCodeFlow(clientId);  // Redirect if token is invalid
    }
}

export async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email");
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


export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier);
    params.append("scope", "user-read-private user-read-email");

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
        return null;
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
        console.log("Fetched profile:", profile);
        return profile;
    } catch (error) {
        console.error("Error fetching profile:", error);
        return null;
    }
}

function populateUI(profile) {
    console.log("Profile data:", profile);
    document.getElementById("displayName").innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar").appendChild(profileImage);
        document.getElementById("imgUrl").innerText = profile.images[0].url;
        document.getElementById("followers").innerText = profile.followers.total;
    }
    document.getElementById("id").innerText = profile.id;
    document.getElementById("email").innerText = profile.email;
    document.getElementById("uri").innerText = profile.uri;
    document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url").innerText = profile.href;
    document.getElementById("url").setAttribute("href", profile.href);
}