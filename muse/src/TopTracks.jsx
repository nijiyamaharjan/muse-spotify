import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function TopTracks() {
    const [value, setValue] = useState(0);
    const [topTracks, setTopTracks] = useState(null);
    const [loading, setLoading] = useState(false);

    let accessToken = localStorage.getItem("access_token");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const getTimeRange = () => {
        switch (value) {
            case 0:
                return 'short_term';  // Last 4 weeks
            case 1:
                return 'medium_term'; // Last 6 months
            case 2:
                return 'long_term';   // Last 12 months
            default:
                return 'short_term';
        }
    };

    useEffect(() => {
        const fetchTracks = async () => {
            setLoading(true);  // Start loading
            try {
                const timeRange = getTimeRange();
                const limit = 50;  
                const topTracksData = await fetchTopTracks(accessToken, timeRange, limit);
                setTopTracks(topTracksData);
            } catch (error) {
                console.error("Cannot fetch top tracks", error);
            } finally {
                setLoading(false);  // End loading
            }
        };

        fetchTracks();
    }, [value, accessToken]);

    const renderTopTracks = () => {
        if (loading) {
            return <p>Loading...</p>;
        }

        if (!topTracks || topTracks.length === 0) {
            return <p>No top tracks available.</p>;
        }

        return (
            <ol>
                {topTracks.map((track, index) => (
                    <li key={index}>
                        {track.name} by {track.artists.map(artist => artist.name).join(", ")}
                    </li>
                ))}
            </ol>
        );
    };

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
    
    return (
        <>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="tabs">
              <Tab label="Last 4 Weeks" {...a11yProps(0)} />
              <Tab label="Last 6 Months" {...a11yProps(1)} />
              <Tab label="Last 12 Months" {...a11yProps(2)} />
            </Tabs>
          </Box>
          
          <CustomTabPanel value={value} index={0}>
          <h1>Top Tracks (Last 4 Weeks)</h1>
            {renderTopTracks()}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
          <h1>Top Tracks (Last 6 Months)</h1>
            {renderTopTracks()}
          </CustomTabPanel>
          <CustomTabPanel value={value} index={2}>
          <h1>Top Tracks (Last 12 Months)</h1>
            {renderTopTracks()}
          </CustomTabPanel>
        </Box>

        </>
    );
}

export default TopTracks;

async function fetchTopTracks(token, timeRange, limit) {
    try {
        const result = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}&offset=0`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) {
            throw new Error(`Top tracks fetch failed: ${result.statusText}`);
        }

        const data = await result.json();
        const topTracks = data.items;
        console.log("Fetched top tracks:", topTracks);
        return topTracks;
    } catch (error) {
        console.error("Error fetching top tracks:", error);
        return [];
    }
}
