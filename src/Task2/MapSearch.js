import React, { useState, useEffect } from 'react';
import { Card, Button, AutoComplete } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import * as OpenCage from 'opencage-api-client';

const API_KEY= '494406aff1584b23ac5248a08c7bbbbf';
const MapSearch = () => {
    const [address, setAddress] = useState('');
    const [mapUrl, setMapUrl] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    // const [initialCenter, setInitialCenter] = useState({ lat: 52.2435, lng: 5.6343 });

    // Update the map URL when the component mounts
    useEffect(() => {
      fetchMapUrl( 52.2435, 5.6343) ;
    }, []);
    
  
    const handleInputChange = (value) => {
      setAddress(value);
      fetchSuggestions(value);
    };
  
    const fetchSuggestions = async (query) => {
      try {
        const response = await OpenCage.geocode({ q: query, key: API_KEY });
        const suggestions = response.results.map((result) => result.formatted);
        setSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };
  
    const handleSuggestionSelect = async (selectedAddress) => {
      setAddress(selectedAddress);
      fetchMapUrl(selectedAddress);
    };
  
    const fetchMapUrl = async (selectedAddress) => {
      try {
        const response = await OpenCage.geocode({ q: selectedAddress, key: API_KEY });
        const { lat, lng } = response.results[0].geometry;
        const placeholderMapUrl = `https://maps.google.com/maps?q=${lat},${lng}&output=embed`;
        setMapUrl(placeholderMapUrl);
      } catch (error) {
        console.error('Error fetching map URL:', error);
      }
    };
  
    return (
      <div style={{ padding: '20px', overflow: 'hidden', height: 'calc(100vh - 20%)' }}>
        <Card
          title="Map Search"
          style={{
            width: '70%',
            margin: 'auto',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            height: '100%',
          }}
        >
          <AutoComplete
            style={{ width: '100%' }} // Set the width to 100%
            placeholder="Enter address"
            value={address}
            onChange={handleInputChange}
            onSelect={handleSuggestionSelect}
          >
            {suggestions.map((suggestion, index) => (
              <AutoComplete.Option key={index} value={suggestion}>
                {suggestion}
              </AutoComplete.Option>
            ))}
          </AutoComplete>
          {mapUrl && (
            <div style={{ position: 'relative', height: 'calc(100% - 60px)', overflow: 'hidden' }}>
              <iframe
                title="map"
                width="100%"
                height="100%"
                frameBorder="0"
                src={mapUrl}
                allowFullScreen
                center={{ lat: 52.2435, lng: 5.6343 }}
              ></iframe>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <EnvironmentOutlined style={{ fontSize: '24px', color: 'red' }} />
              </div>
            </div>
          )}
          <Button
            type="primary"
            style={{ marginTop: '10px', position: 'absolute', bottom: '10px', right: '20px' }}
          >
            Confirm
          </Button>
        </Card>
      </div>
    );
  };
  
  export default MapSearch;
  
