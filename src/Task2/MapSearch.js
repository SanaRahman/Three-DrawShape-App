import React, {useEffect, useMemo, useState} from 'react';
import { Card, Button, AutoComplete } from 'antd';
import { DownloadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import * as OpenCage from 'opencage-api-client';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Outlet, Link } from "react-router-dom";

const API_KEY = '494406aff1584b23ac5248a08c7bbbbf';
let download= `https://maps.googleapis.com/maps/api/staticmap?center=42.3359182924998,-71.60280179232359&size=640x480&scale=2&zoom=14&key=AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0`;
const libraries = ['places'];
const MapSearch = () => {
    const [address, setAddress] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [mapCenter, setMapCenter] = useState({ lat: 42.3359182924998, lng: -71.60280179232359 });
    const [mapZoom, setMapZoom] = useState(14);
    const [markerPosition, setMarkerPosition] = useState(mapCenter);
    const memoizedMapCenter = useMemo(() => mapCenter, [mapCenter]);
    const memoizedMapZoom = useMemo(() => mapZoom, [mapZoom])


    const mapContainerStyle = {
        width: '100vw',
        height: '100vh',
        position: 'relative',
        // height: 'calc(100% - 60px)',
        overflow: 'hidden',
        marginBottom: '14px'
    };

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey:'AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0',
        libraries,
        initialCenter: memoizedMapCenter,
        initialZoom:memoizedMapZoom,
    });

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
            setMapCenter({ lat, lng });
            console.log(mapCenter)
            setMapZoom(14);
            setMarkerPosition({ lat, lng });
            download = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&size=500x500&scale=2&zoom=${mapZoom}&key=AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0`
        } catch (error) {
            console.error('Error fetching map URL:', error);
        }
    };

    return (
        <div id="map-container" style={{ padding: '20px', overflow: 'hidden', height: 'calc(100vh - 20%)' }}>
            <Card
                title="Map Search"
                style={{
                    width: '68%',
                    margin: 'auto',
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                    height: '100%',
                }}
            >
                <AutoComplete
                    style={{width: '100%', marginBottom: '8px'}}
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
                {isLoaded && (
                    <div style={{
                        position: 'relative',
                        height: 'calc(100% - 80px)',
                        overflow: 'hidden',
                        marginBottom: '14px'
                    }}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            zoom={mapZoom}
                            center={mapCenter}
                            onLoad={(map) => {
                                // Handle map load
                                map.addListener('dragend', () => {
                                    const newCenter = map.getCenter();
                                    setMapCenter({lat: newCenter.lat(), lng: newCenter.lng()});
                                });
                                map.addListener('zoom_changed', () => {
                                    const newZoom = map.getZoom();
                                    setMapZoom(newZoom);

                                });
                            }}

                        >
                            <Marker
                                position={markerPosition}
                                draggable={true}
                                onDragEnd={(e) => {
                                    setMarkerPosition({lat: e.latLng.lat(), lng: e.latLng.lng()});
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                color: 'white',
                                background: 'black',
                                padding: '6px'
                            }}>
                                {`Lat: ${markerPosition.lat.toFixed(6)}, Lng: ${markerPosition.lng.toFixed(6)}`}
                            </div>

                        </GoogleMap>
                    </div>
                )}

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
                    <Link to={"mapTile"}>
                        <Button
                            type="primary"
                            icon={<EnvironmentOutlined/>}
                            style={{marginRight:'10px'}}
                        >
                            Draw on Map
                        </Button>
                    </Link>

                    <a href={download = `https://maps.googleapis.com/maps/api/staticmap?center=${mapCenter.lat},${mapCenter.lng}&size=500x500&scale=2&zoom=${mapZoom}&maptype=satellite&key=AIzaSyAo1viD-Ut0TzXTyihevwuf-9tv_J3dPa0`}
                       target="_blank"
                       rel="noopener noreferrer" download={'map'}
                      >
                        <Button
                            type="primary"
                            icon={<DownloadOutlined/>}
                        >
                            Download Map
                        </Button>
                    </a>
                </div>

            </Card>
        </div>
);
};

export default MapSearch;