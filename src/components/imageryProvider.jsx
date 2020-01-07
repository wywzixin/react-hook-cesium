import React from "react";
import  CesiumMap  from "./map.jsx";
import * as Cesium from 'cesium/Cesium'

function ImageryProvider(props) {
    const title = "cesium加载影像"

    function handleViewerLoaded(viewer) {
        var esri = new Cesium.ArcGisMapServerImageryProvider({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
            enablePickFeatures: false
        });
        //三： createOpenStreetMapImageryProvider 
        var osm = Cesium.createOpenStreetMapImageryProvider({
            url: 'https://a.tile.openstreetmap.org/'
        });
        //四： MapboxImageryProvider  提供了mapbox.satellite、mapbox.streets、mapbox.streets-basic 三种风格 basic不行
        var mbox = new Cesium.MapboxImageryProvider({
            mapId: 'mapbox.satellite'
        });

        // //取消双击事件
        // viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        // //设置homebutton的位置
        // Cesium.Camera.DEFAULT_VIEW_RECTANGLE =
        //     Cesium.Rectangle.fromDegrees(110.15, 34.54, 110.25, 34.56); //Rectangle(west, south, east, north)
        // //设置初始位置
        // viewer.camera.setView({
        //     destination: Cesium.Cartesian3.fromDegrees(110.20, 34.55, 3000000)
        // });
    }
    return (
        <div>
            <CesiumMap id={title} onViewerLoaded={(viewer) => {handleViewerLoaded(viewer)}}/>
        </div>
    )
}

export default ImageryProvider

