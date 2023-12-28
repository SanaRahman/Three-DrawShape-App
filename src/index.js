import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import MapSearch from "./Task2/MapSearch";
import MapTile from "./Task2/MapTile";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<MapSearch />}/>
            <Route path="mapTile" element={<MapTile />}/>
        </Routes>
    </BrowserRouter>
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
);

reportWebVitals();
