import React, { useEffect } from "react"
import * as Cesium from 'cesium/Cesium'

function LoadKML(props) {
    
    const containerStyle = {
        width: "100%",
        height: "100%",
        top: 0,
        left: 256,
        bottom: 0,
        right: 0,
        position: "absolute",
    }

    

    useEffect(() => {
       let viewer = new Cesium.Viewer('cesiumContainer')
       let options = {
         camera : viewer.scene.camera,
         canvas : viewer.scene.canvas
       }
       viewer.dataSources.add(Cesium.KmlDataSource.load('../lib/kml/gdpPerCapita2008.kmz', options));
      viewer.camera.flyHome(0);
       
    },[])
    return (
        <div>
            <div id="cesiumContainer"  ></div>
        </div>
    )
}

export default LoadKML

