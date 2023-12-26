import React, { useState } from 'react';
import {Button} from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import '../styles/App.css'
import SettingBar from './SettingBar';
import ThreeApp from './ThreeApp';

const App = () => {
  const [radius, setRadius] = useState(1);
  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [depth, setDepth] = useState(1);
  const [selectedShape, setSelectedShape] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [modificationValue, setModificationValue] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#1677ff'); // Initial color
  const [movementOption, setMovementOption] = useState(); // Initial value set to undefined

  const handleMovementOptionChange = (e) => {
    const newValue = e.target.value;
    setMovementOption(newValue === movementOption ? undefined : newValue);
    if (newValue !== undefined) {
      setModificationValue(false);
    }
  };

  const handleModificationChange = () => {
    setModificationValue(!modificationValue);

    if (!modificationValue) {
      setMovementOption(undefined);
    }
  };

  const handleColorChange = (color, colorString) => {
    setSelectedColor(colorString);
  };

  const updateSlider = (selectedObject) =>{
    setSelectedShape('sphere');
    if(selectedObject.geometry.type === 'SphereGeometry'){
      setRadius(selectedObject.geometry.parameters.radius);

    }
    else if(selectedObject.geometry.type === 'BoxGeometry'){
      setSelectedShape('cube');
      setHeight(selectedObject.geometry.parameters.height);
      setWidth(selectedObject.geometry.parameters.width);
      setDepth(selectedObject.geometry.parameters.depth);

    }
  }

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleShapeChange = (value) => {
    console.log(`selected ${value}`);
    setSelectedShape(value);
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
              movementOption={movementOption}
              handleMovementOptionChange={handleMovementOptionChange}
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
        movementOption={movementOption}
        updateSlider={updateSlider}
        menuVisible={menuVisible}
        />
      </div>
    </div>

  );
};

export default App;
