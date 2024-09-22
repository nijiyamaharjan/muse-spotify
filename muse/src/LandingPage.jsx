import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Profile from './Profile';
import Playback from './Playback';
import Playlists from './Playlists';
import TopArtists from './TopArtists';
import TopTracks from './TopTracks';
import Box from '@mui/material/Box';
import RecentlyPlayed from './RecentlyPlayed';

function LandingPage() {
  
  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="tabs">
          <Tab label="Profile" {...a11yProps(0)} />
          <Tab label="Top Tracks" {...a11yProps(1)} />
          <Tab label="Top Artists" {...a11yProps(2)} />
          <Tab label="Playlists" {...a11yProps(3)} />
          <Tab label="Recently Played" {...a11yProps(4)} />
        </Tabs>
      </Box>
      
      <CustomTabPanel value={value} index={0}>
        <Profile />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <TopTracks />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <TopArtists />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <Playlists />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <RecentlyPlayed />
      </CustomTabPanel>
    </Box>
  );
}

export default LandingPage;
