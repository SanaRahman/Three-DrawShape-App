import React, { useState } from 'react';
import { Card, Input, Button } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';

const MapSearch = () => {
    const [address, setAddress] = useState('');
    const [mapUrl, setMapUrl] = useState('');

    const handleSearch = () => {
        // Use the address to fetch the coordinates or update the map URL
        // For simplicity, I'm just creating a placeholder map URL here.
        const placeholderMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
        setMapUrl(placeholderMapUrl);
    };

    return (
        <div style={{ padding: '20px',  overflow: 'hidden', height: 'calc(100vh - 20%)'  }}>
            <Card
                title="Map Search"
                style={{
                    width: '70%',
                    margin: 'auto',
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                    height: '100%'
                }}
            >
                <Input
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ marginBottom: '10px' }}
                />
                <Button type="primary" onClick={handleSearch} style={{ marginBottom: '20px' }}>
                    Search
                </Button>
                {mapUrl && (
                    <div style={{ position: 'relative', height: '300px', overflow: 'hidden' }}>
                        <iframe
                            title="map"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            src={mapUrl}
                            allowFullScreen
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
                <Button type="primary" style={{ marginTop: '20px',position: 'absolute', 'bottom': '20px', 'right' : '20px' }}>
                    Confirm
                </Button>
            </Card>
        </div>
    );
};

export default MapSearch;
