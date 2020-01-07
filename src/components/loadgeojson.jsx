import React, { useEffect } from "react";
import CesiumMap from "./map.jsx";
import * as Cesium from 'cesium/Cesium'

function LoadGeojson(props) {
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
        let viewer = new Cesium.Viewer('cesiumContainer');
        //这块写自己的json路径	
        let promise = Cesium.GeoJsonDataSource.load('static/Data/jianzhu.json');
        promise.then(function(dataSource) {
            viewer.dataSources.add(dataSource);
            // dataSource.entities  Gets the collection of Entity instances
            //  new Cesium.EntityCollection(owner) values 
            //Gets the array of Entity instances in the collection. This array should not be modified directly
            let entities = dataSource.entities.values;
            let colorHash = {};
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                let name = entity.name;
                let color = colorHash[name];
                if (!color) {
                    color = Cesium.Color.WHITESMOKE;
                    colorHash[name] = color;
                }
                entity.polygon.material = color;
                entity.polygon.outline = false;
                entity.polygon.extrudedHeight = 50.0;
            }
        });

        viewer.flyTo(promise);
    }, [])
    return (
        <div>
            <div id="cesiumContainer" style={containerStyle}></div>
        </div>
    )
}

export default LoadGeojson

