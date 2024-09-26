import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress'; 
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function TopArtists() {
    const [value, setValue] = useState(0);
    const [topArtists, setTopArtists] = useState(null);
    const [loading, setLoading] = useState(false);

    let accessToken = localStorage.getItem("access_token");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    }

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
        const fetchArtists = async () => {
            setLoading(true);  // Start loading
            try {
                const timeRange = getTimeRange();
                const limit = 50;  
                const topArtistsData = await fetchTopArtists(accessToken, timeRange, limit);
                setTopArtists(topArtistsData);
            } catch (error) {
                console.error("Cannot fetch top artists", error);
            } finally {
                setLoading(false);  // End loading
            }
        };

        fetchArtists();
    }, [value, accessToken]);

    const renderTopArtists = () => {
        if (loading) {
            return <CircularProgress color="inherit" />; // Use inherit color for dark mode
        }

        if (!topArtists || topArtists.length === 0) {
            return <p className="text-white">No top artists found.</p>; // Change text color for dark mode
        }

        return (
            <ul className="flex flex-wrap justify-center items-center">
                {topArtists.map((artist, index) => (
                    <li key={index} className="flex flex-col items-center justify-center m-4">
                        {artist.images && artist.images[0] && (
                            <img src={artist.images[0].url} alt={artist.name} className="w-72 h-72 object-cover m-3" />
                        )}
                        <p className="text-center font-semibold text-white">
                            {index + 1}. {artist.name}
                        </p>
                    </li>
                ))}
            </ul>
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
            <Box sx={{ width: '100%', backgroundColor: '#121212', color: '#ffffff' }}> {/* Dark background */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="tabs" textColor="inherit">
                        <Tab label="Last 4 Weeks" {...a11yProps(0)} />
                        <Tab label="Last 6 Months" {...a11yProps(1)} />
                        <Tab label="Last 12 Months" {...a11yProps(2)} />
                    </Tabs>
                </Box>
                
                <CustomTabPanel value={value} index={0}>
                    <h1 className="text-3xl text-center font-bold mb-6">Top Artists (Last 4 Weeks)</h1>
                    {renderTopArtists()}
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <h1 className="text-3xl text-center font-bold mb-6">Top Artists (Last 6 Months)</h1>
                    {renderTopArtists()}
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <h1 className="text-3xl text-center font-bold mb-6">Top Artists (Last 12 Months)</h1>
                    {renderTopArtists()}
                </CustomTabPanel>
            </Box>
        </>
    );
}

export default TopArtists;

async function fetchTopArtists(token, timeRange, limit) {
    try {
        const result = await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}&offset=0`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!result.ok) {
            throw new Error(`Top artists fetch failed: ${result.statusText}`);
        }

        const data = await result.json();
        const topArtists = data.items;
        console.log("Fetched top artists:", topArtists);
        return topArtists;
    } catch (error) {
        console.error("Error fetching top artists:", error);
        return [];
    }
}
