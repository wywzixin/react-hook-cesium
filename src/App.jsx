import React,{useState,useEffect}from 'react';
import './App.css';
import PointLineFace from './components/pointLineFace.jsx'
 import Navigation from './components/navigation.jsx'
import Load3DTiles from './components/load3dTiles.jsx'
import LoadGltf from './components/loadgltf.jsx'
import CustomeRiver from './components/customeRiver.jsx'
// import CesiumVectortile from './components/cesiumvectortile.jsx'
import ImageryProvider from './components/imageryProvider.jsx'
import FlyCesium from './components/flycesium.jsx'
import LoadGeojson from './components/loadgeojson.jsx'
import AddRectangle from './components/addRectangle.jsx'
import CircleScan from './components/circleScan.jsx'
import Classification from './components/classification.jsx'
import LoadCZML from './components/loadCZML.jsx'
import LoadKML from './components/loadKML.jsx'
import LoadTerrain from './components/loadterrain.jsx'
import DrawFunc from './components/drawFunc.jsx'
import Measure from './components/measure.jsx'
import AddPopup from './components/addpopup.jsx'
import MouseEvent from './components/mouseevent.jsx'
//import HeatMap from './components/heatmap.jsx'

import { Menu } from 'antd';

function App() {

  const [demoIndex, setDemoIndex] = useState(0)

  const demos = [
    { title: '加载影像', element: <ImageryProvider/> },
    { title: '加载地形', element: <LoadTerrain/> },
    { title: '指南针和放大缩小控件', element: <Navigation/> },
    { title: '加载3dTiles', element: <Load3DTiles /> },
    { title: '3dTiles单体化', element: <Classification /> },
    { title: '加载矢量切片', element: <ImageryProvider/> },
    { title: '加载gltf模型', element: <LoadGltf/> },
    { title: '加载geojson数据', element: <LoadGeojson/> },
    { title: 'Entity方式加载点线面', element: <PointLineFace /> },
    { title: 'primitives方式添加矩形', element: <AddRectangle /> },
    { title: '加载河流', element: <CustomeRiver/> },
    { title: '添加popup弹出框', element: <AddPopup/> },
    { title: '鼠标事件', element: <MouseEvent/> },
    { title: '绘制点线面', element: <DrawFunc/> },
    { title: '测量长度面积', element: <Measure/> },
    { title: 'cesium飞行', element: <FlyCesium/> },
    { title: 'cesium雷达扫描', element: <CircleScan/> },
    { title: '加载CZML卫星轨道数据', element: <LoadCZML/> },
    { title: '加载KMLgdp数据', element: <LoadKML/> },
  
   
  ]

  return (
    <div className="App">
      <div className="left">
        <Menu
          onClick={(item) => {
             setDemoIndex(item.key)
          }}
          style={{ 
            width: 256,
            position: "absolute",
            top: 0,
            height: "100%",
          }}
          defaultSelectedKeys={['0']}
          mode="inline"
         >
            {
              demos ? demos.map((demoItem,index) => {
                  return (
                     <Menu.Item key={index}>{demoItem.title}</Menu.Item>
                  )
              }) : null
            }
        </Menu>
      </div>
      <div className="content">
          {  
              demos ? demos[demoIndex].element : null
          }
      </div>
    </div>
  );
}

export default App;
