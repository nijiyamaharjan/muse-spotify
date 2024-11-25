import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Profile from './Profile';
import TopTracks from './TopTracks';
import TopArtists from './TopArtists';
import Playlists from './Playlists';
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

  const [value, setValue] = useState(0);

  const handleButtonClick = (index) => {
    setValue(index);
  };

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100vh',  // Set height to fill the viewport
        bgcolor: '#121212', 
        borderRadius: '8px', 
        color: '#ffffff', 
        display: 'flex', 
        flexDirection: 'column', // Stack elements vertically
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-around', borderBottom: '1px solid #333', padding: '10px' }}>
        {['Profile', 'Top Tracks', 'Top Artists', 'Playlists', 'Recently Played'].map((label, index) => (
          <Button 
            key={index}
            variant={value === index ? "contained" : "text"} 
            onClick={() => handleButtonClick(index)} 
            sx={{
              flexGrow: 1,
              padding: '10px 0',  // Adjust padding for larger buttons
              fontSize: '12px',  // Increase font size
              fontWeight: value === index ? 'bold' : 'normal',
              color: value === index ? '#ffffff' : '#b0b0b0',
              backgroundColor: value === index ? '#1db954' : 'transparent',
              transition: 'background-color 0.3s',
              '&:hover': {
                backgroundColor: value === index ? '#1db954' : '#424242',
              }
            }}
          >
            {label}
          </Button>
        ))}
      </Box>
      
      <Box sx={{ flex: 1, overflowY: 'auto' }}> {/* Make this box scrollable if content overflows */}
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
    </Box>
  );
}

export default LandingPage;
