import React, { useEffect } from "react";
import CesiumMap from "./map.jsx";
import * as Cesium from 'cesium/Cesium'
import CesiumNavigation from "cesium-navigation-es6"
import './mouseevent.css'
function MouseEvent(props) {
    const containerStyle = {
        //width: "100%",
        height: "100%",
        top: 0,
        left: 256,
        bottom: 0,
        right: 0,
        position: "absolute",
    }
  
    const title = "cesium指南针和放大缩小插件"

    useEffect(() => {
       let esri = new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
        enablePickFeatures: false
    });

    let viewer = new Cesium.Viewer('cesiumContainer', {
        imageryProvider: esri,
        contextOptions: {
            webgl: {
                alpha: true
            }
        },
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

    //设置初始位置
    viewer.camera.setView( {
        destination  : Cesium.Cartesian3.fromDegrees( 110.20, 34.55, 3000000 )
    } );
    let scene = viewer.scene;
    let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    let ellipsoid = scene.globe.ellipsoid; //得到当前三维场景的椭球体

    let longitudeString = null;
    let latitudeString = null;
    let height = null;
    let cartesian = null;

    let mouse_state = document.getElementById("mouse_state");//显示状态信息

    //一 鼠标MOUSE_MOVE
    handler.setInputAction(function(movement) {
        //通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
        cartesian = viewer.camera.pickEllipsoid(movement.endPosition, ellipsoid);
        if (cartesian) {
            //将笛卡尔坐标转换为地理坐标
            let cartographic = ellipsoid.cartesianToCartographic(cartesian);
            //将弧度转为度的十进制度表示
            longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(3);
            latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(3);
            //获取相机高度
            height = Math.ceil(viewer.camera.positionCartographic.height).toFixed(3);
            mouse_state.innerText = '移动：(' + longitudeString + ', ' + latitudeString + "," + height + ')';
        }else {
            mouse_state.innerText = "";
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    //二 LEFT_CLICK
    handler.setInputAction(function(movement) {
        //cartesian =   viewer.camera.pickEllipsoid(movement.position, ellipsoid);//movement.endPosition
        //if (cartesian) {
        //    //将笛卡尔坐标转换为地理坐标
        //     let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        //     longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(3);
        //     latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(3);
        //    //获取相机高度
        //    height = Math.ceil(viewer.camera.positionCartographic.height);
        //    mouse_state.innerText = 'LEFT_CLICK：(' + longitudeString + ', ' + latitudeString + "," + height + ')';
        //}else {
        //    mouse_state.innerText = '';
        //}
     }, Cesium.ScreenSpaceEventType.LEFT_CLICK );

    //三 LEFT_DOUBLE_CLICK
    handler.setInputAction(function(movement) {
        cartesian =   viewer.camera.pickEllipsoid(movement.position, ellipsoid);//movement.endPosition
        if (cartesian) {
            //将笛卡尔坐标转换为地理坐标
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(3);
            latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(3);
            //获取相机高度
            height = Math.ceil(viewer.camera.positionCartographic.height);
            mouse_state.innerText = 'LEFT_DOUBLE_CLICK：(' + longitudeString + ', ' + latitudeString + "," + height + ')';
        }else {
            mouse_state.innerText = '';
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK  );

    //四 LEFT_DOWN
    handler.setInputAction(function(movement) {
        cartesian =   viewer.camera.pickEllipsoid(movement.position, ellipsoid);//movement.endPosition
        if (cartesian) {
            //将笛卡尔坐标转换为地理坐标
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(3);
            latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(3);
            //获取相机高度
            height = Math.ceil(viewer.camera.positionCartographic.height);
            mouse_state.innerText = 'LEFT_DOWN ：(' + longitudeString + ', ' + latitudeString + "," + height + ')';
        }else {
            mouse_state.innerText = '';
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN   );

    //五 LEFT_UP
    handler.setInputAction(function(movement) {
        cartesian =   viewer.camera.pickEllipsoid(movement.position, ellipsoid);//movement.endPosition
        if (cartesian) {
            //将笛卡尔坐标转换为地理坐标
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(3);
            latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(3);
            //获取相机高度
            height = Math.ceil(viewer.camera.positionCartographic.height);
            mouse_state.innerText = 'LEFT_UP ：(' + longitudeString + ', ' + latitudeString + "," + height + ')';
        }else {
            mouse_state.innerText = '';
        }
    }, Cesium.ScreenSpaceEventType.LEFT_UP   );

    //六 鼠标WHEEL
    handler.setInputAction(function(wheelment) {
        height = Math.ceil(viewer.camera.positionCartographic.height);
        mouse_state.innerText = '远近(' + "," + height + ')';// longitudeString + ', ' + latitudeString +
    }, Cesium.ScreenSpaceEventType.WHEEL);
    }, [])
    return (
        <div>
            <div id="cesiumContainer" style={containerStyle}></div>
            <div id="mouse_state" className="mousestate"></div>
        </div>
    )
}

export default MouseEvent

