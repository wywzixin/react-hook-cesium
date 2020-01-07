import React, { useEffect } from "react";
import * as Cesium from 'cesium/Cesium'

function LoadGltf(props) {
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
    function createModel(url, height,viewer) {
        viewer.entities.removeAll();

        var position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, height);
        var heading = Cesium.Math.toRadians(135);
        var pitch = Cesium.Math.toRadians(90);
        var roll = 0;
        var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

        var entity = viewer.entities.add({
            name: url,
            position: position,
            orientation: orientation,
            model: {
                uri: url,
                minimumPixelSize: 128,
                maximumScale: 20000
            }
        });
        viewer.trackedEntity = entity;
    }

    useEffect(() => {
        const esri = new Cesium.ArcGisMapServerImageryProvider({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
            enablePickFeatures: false
        });
       
        const viewer = new Cesium.Viewer('cesiumContainer', {
            imageryProvider: esri,
            contextOptions: {
                webgl: {
                    alpha: true
                }
            },
            // creditContainer: "creditContainer",
            selectionIndicator: false,
            animation: false,  //是否显示动画控件
            baseLayerPicker: false, //是否显示图层选择控件
            geocoder: false, //是否显示地名查找控件
            timeline: false, //是否显示时间线控件
            sceneModePicker: true, //是否显示投影方式控件
            navigationHelpButton: false, //是否显示帮助信息控件
            infoBox: false,  //是否显示点击要素之后显示的信息
            fullscreenButton: true
        });
    
        //取消双击事件
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    
        createModel('static/model/barrel.gltf', 100000.0,viewer);
        
    }, [])
    return (
        <div>
            <div id="cesiumContainer" style={containerStyle}></div>
        </div>
    )
}

export default LoadGltf

