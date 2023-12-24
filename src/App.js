import React, { useState } from 'react';
import {Button} from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import './App.css'
import SettingBar from './SettingBar';
import ThreeApp from './ThreeApp';

const App = () => {
  const [radius, setRadius] = useState(1);
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [depth, setDepth] = useState(1);
  const [selectedShape, setSelectedShape] = useState('sphere');
  const [menuVisible, setMenuVisible] = useState(false);
  const [modificationValue, setModificationValue] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff'); // Initial color

  const handleColorChange = (color, colorString) => {
    setSelectedColor(colorString);
    // You can perform additional actions based on the selected color if needed
  };

  const handleModificationChange = () => {
    setModificationValue(!modificationValue);
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleShapeChange = (value) => {
    console.log(`selected ${value}`);
    setSelectedShape(value);
  };

  const onChange1 = ({ target: { value } }) => {
    console.log('radio1 checked', value);
  };

  return (
 
    <div className='main-container'>
      <div className='side-menu'>

        {!menuVisible && (
          <Button
            type="primary"
            shape="circle"
            icon={<SettingOutlined />}
            size="large"
            style={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}
            onClick={toggleMenu}
          />
        )}

        <div className={`overlay ${menuVisible ? 'visible' : ''}`}>
          <div className="card-wrapper">
            <SettingBar
              handleShapeChange={handleShapeChange}
              selectedShape={selectedShape}
              modificationValue={modificationValue}
              handleModificationChange={handleModificationChange}
              radius={radius}
              setRadius={setRadius}
              width={width}
              setWidth={setWidth}
              height={height}
              setHeight={setHeight}
              depth={depth}
              setDepth={setDepth}
              selectedColor={selectedColor}
              handleColorChange={handleColorChange}
              toggleMenu={toggleMenu}
            />
          </div>
        </div>

      </div>
      
      <div className='three-js-container'>
        <ThreeApp
        selectedShape= {selectedShape}
        modificationValue={modificationValue}
        radius={radius}
        height={height}
        width={width}
        depth={depth}
        selectedColor={selectedColor}
        />
      </div>
    </div>

  );
};

export default App;
