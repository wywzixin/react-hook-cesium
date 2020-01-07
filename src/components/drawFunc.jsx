import React, { useEffect } from "react"
import * as Cesium from 'cesium/Cesium'
import { Button } from 'antd'
import DrawPolt from '../lib/Draw/draw'
import './flycesium.css'

function DrawFunc(props) {
     const containerStyle = {
        // width: "100%",
        height: "100%",
        top: 0,
        left: 256,
        bottom: 0,
        right: 0,
        position: "absolute",
    }
    
    let viewer = null
    let draw = null  
    function drawBillboard() {
        draw.create(1)
    }
    function drawLine() {
        draw.create(2)
    }
    function drawGon() {
        draw.create(3)
    }
    function clearOne() {
        draw.clearAll()
    }
    function clear() {
        draw.clearOne()
    }
    useEffect(() => {
      viewer = new Cesium.Viewer('cesiumContainer', {
		imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
			url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer"
		}),
		terrainProvider: new Cesium.CesiumTerrainProvider({ //加载火星在线地形
			url: "http://data.marsgis.cn/terrain"
		})
	   })
       draw = new DrawPolt({
		   viewer:viewer
	   })
    },[])

    return (
        <div>
           <div className="flyTools">
                 <Button onClick={() => {drawBillboard()}}>绘制点</Button>
                 <Button onClick={() => {drawLine()}} className="btn">绘制线</Button>
                 <Button onClick={() => {drawGon()}} className="btn">绘制面</Button>
                 <Button onClick={() => {clearOne()}} className="btn">单个清除</Button>
                 <Button onClick={() => {clear()}} className="btn">全部清除</Button>
           </div>
           <div id = "cesiumContainer" style={containerStyle}> </div>
        </div>
    )
}

export default  DrawFunc

