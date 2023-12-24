// SettingBar.js
import React from 'react';
import { Button, Card, Space, Select, ColorPicker, Slider, Radio, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import './App.css';

const SettingBar = ({
  handleShapeChange,
  modificationValue,
  handleModificationChange,
  selectedShape,
  radius,
  setRadius,
  width,
  setWidth,
  height,
  setHeight,
  depth,
  setDepth,
  selectedColor,
  handleColorChange,
  toggleMenu,
}) => (
  <Space direction="vertical" size={16} style={{ padding: 12 }}>
    <Card title="Settings" style={{ width: 400 }}>
      {/* Draw Shape */}
      <div style={{ marginBottom: 12 }}>
        <h3>Draw Shape</h3>
        <label>Select the shape you want to draw:</label>
        <Select
          defaultValue="sphere"
          style={{ width: '100%' }}
          onChange={handleShapeChange}
          options={[
            { value: 'sphere', label: 'Sphere' },
            { value: 'cube', label: 'Cube' },
          ]}
        />
      </div>

      {/* Modify Shape */}
      <div style={{ marginBottom: 10 }}>
        <h3>Modify Shape</h3>
        <Radio.Group style={{ }} onChange={handleModificationChange} value={modificationValue}>
        <Radio.Button value={true}>Modification On</Radio.Button>
        <Radio.Button value={false}>Modification Off</Radio.Button>
      </Radio.Group>
        <p style={{ color: '#3273CF' }}>Select a shape and use the sliders and color picker to modify the shape.</p>
      </div>

      {/* Options */}
      <div style={{ marginBottom: 16 }}>
        <hr />
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {selectedShape === 'sphere' && (
            <>
              <div>
                <span>Radius:</span>
                <Tooltip title={radius}>
                  <Slider
                    value={radius}
                    onChange={(value) => setRadius(value)}
                    disabled={false}
                    min={0}
                    max={9}
                    style={{ width: '100%' }}
                  />
                </Tooltip>
              </div>
            </>
          )}
          {selectedShape === 'cube' && (
            <>
              <div>
                <span>Width:</span>
                <Tooltip title={width}>
                  <Slider
                    value={width}
                    onChange={(value) => setWidth(value)}
                    disabled={false}
                    min={0}
                    max={9}
                    style={{ width: '100%' }}
                  />
                </Tooltip>
              </div>
              <div>
                <span>Height:</span>
                <Tooltip title={height}>
                  <Slider
                    value={height}
                    onChange={(value) => setHeight(value)}
                    disabled={false}
                    min={0}
                    max={9}
                    style={{ width: '100%' }}
                  />
                </Tooltip>
              </div>
              <div>
                <span>Depth:</span>
                <Tooltip title={depth}>
                  <Slider
                    value={depth}
                    onChange={(value) => setDepth(value)}
                    disabled={false}
                    min={0}
                    max={9}
                    style={{ width: '100%' }}
                  />
                </Tooltip>
              </div>
            </>
          )}

        <ColorPicker
          showText={(color) => <span>Custom Text ({color.toHexString()})</span>}
          onChange={handleColorChange}
          style={{ width: '100%' }}
          />
        </Space>
      </div>

      {/* Movements */}
      <div style={{ marginBottom: 16 }}>
        <h3>Movement Options</h3>
        <label>Choose a movement option:</label>
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Radio.Group name="radiogroup" defaultValue={1}>
            <Radio value={1} className="radioButton">
              Rotate Camera
            </Radio>
            <Radio value={2} className="radioButton">
              Drag Shape
            </Radio>
          </Radio.Group>
        </Space>
      </div>

      <Button
        type="text"
        icon={<CloseOutlined />}
        style={{ position: 'absolute', top: 12, right: 8 }}
        onClick={toggleMenu}
      />
    </Card>
  </Space>
);

export default SettingBar;
