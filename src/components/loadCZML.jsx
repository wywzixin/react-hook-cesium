import React, { useEffect } from "react"
import * as Cesium from 'cesium/Cesium'
import CesiumMap from "./map.jsx"
function LoadCZML(props) {
    
    const containerStyle = {
        width: "100%",
        height: "100%",
        top: 0,
        left: 256,
        bottom: 0,
        right: 0,
        position: "absolute",
    }

    const title = "cesium加载3DTiles"

    useEffect(() => {
        var viewer = new Cesium.Viewer('cesiumContainer');
        viewer.dataSources.add(Cesium.CzmlDataSource.load('static/data.czml'));
    },[])
    return (
        <div>
            <div id="cesiumContainer" style={containerStyle} ></div>
        </div>
    )
}

export default LoadCZML

