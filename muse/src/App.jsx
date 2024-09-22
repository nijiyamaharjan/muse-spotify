import React, {useEffect, useState} from 'react';
import './App.css'
import Profile from './Profile';
import TopTracks from './TopTracks';
import TopArtists from './TopArtists';
import Playlists from './Playlists';
import Playback from './Playback';


function App() {
  
  return (
    <>
      <Profile />
      <TopTracks />
      <TopArtists />
      <Playlists />
    </>
  )
}

export default App;
