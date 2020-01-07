import React , {useEffect}from "react";
import * as Cesium from 'cesium/Cesium'
import './classification.css'
function Classification() {
    const containerStyle = {
        //width: "100%",
        height: "100%",
        top: 0,
        left: 256,
        bottom: 0,
        right: 0,
        position: "absolute",
    }

    useEffect(() => {
         let viewer = new Cesium.Viewer("cesiumContainer")
         let dayantaTileset = new Cesium.Cesium3DTileset({
            url: 'static/dyt3dtiles/tileset.json'
         })
         let tileset =  viewer.scene.primitives.add(dayantaTileset)
         viewer.zoomTo(tileset)
    },[])

    return (
       <div>
           <div id="cesiumContainer" style={containerStyle}></div>
       </div>
    )
}

export default Classification