import React, { useEffect } from 'react'
import * as Cesium from 'cesium/Cesium'


 function CesiumMap(props) {
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
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMzJmNDgwZi1iNmQ2LTQ0NWEtOWRkNi0wODkxYzYxYTg0ZDIiLCJpZCI6ODUzMiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MjIwMjY4OH0.u4d7x0IxZY06ThT4JFmxrfgBxVjQcfI6xXDLu-fsWsY';
        const viewer = new Cesium.Viewer('cesiumContainer', MapConfig.MAPOPTIONS)
        viewer._cesiumWidget._creditContainer.style.display = "none"
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK); //移除双击选中

        viewer.scene.globe.enableLighting = MapConfig.global.enableLighting; //光照开关
        viewer.scene.globe.depthTestAgainstTerrain = MapConfig.global.depthTestAgainstTerrain; //depth
        viewer.scene.highDynamicRange = true; //是否使用高动态范围渲染

        //viewer.frameUpdate = new Cesium.Event();
        // let lasTime;
        //   // 场景的渲染事件viewer.scene.preUpdate.addEventListener
        // viewer.scene.preUpdate.addEventListener((time) => {
        //       let dateNow = Date.now();
        //       let deltaTime = lasTime != null ? dateNow - lasTime : 0;
        //       lasTime = dateNow;
        //       viewer.frameUpdate.raiseEvent(deltaTime);
        //   });

        if (props.onViewerLoaded != null) {
            props.onViewerLoaded(viewer);
        }

    }, [])
    return ( 
         <div id = "cesiumContainer"  style={containerStyle}> </div>
    )
}

const MapConfig = {
    ION: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMGRlYTM0ZS0zYjQzLTQ0N2EtYTk4ZS0zNmIwMmU3MDRkNTIiLCJpZCI6MTkzMSwiaWF0IjoxNTMwNzU5NTg3fQ.nt8CVoWjIXTeDM9T6qPs-dM7tb7IWnNc56mzAqhcBBY',
    global: {
        enableLighting: false,
        depthTestAgainstTerrain: true,
    },
    MAPOPTIONS: {
        imageryProviderViewModels: [
            new Cesium.ProviderViewModel({
                name: "Google卫星",
                iconUrl: "http://img3.cache.netease.com/photo/0031/2012-03-22/7T6QCSPH1CA10031.jpg",
                tooltip: "Google卫星",
                creationFunction: function() {
                    return new Cesium.UrlTemplateImageryProvider({
                        url: 'http://www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}', //影像图 (中国范围无偏移)
                        //url: 'http://www.google.cn/maps/vt?lyrs=s&gl=cn&x={x}&y={y}&z={z}',//影像图 (中国范围有偏移，以适应偏移后的Google矢量图)
                        // 引用 WebMercatorProjection （EPSG:3857）的几何图形平铺方案。这是Google Maps，Microsoft Bing Maps和大多数ESRI ArcGIS Online使用的切片方案
                        tilingScheme: new Cesium.WebMercatorTilingScheme(),
                        minimumLevel: 1,
                        maximumLevel: 200,
                        credit: 'Google Earth',
                    });
                }
            }),
        ], //设置影像图列表
        shouldAnimate: true,
        geocoder: false, //右上角查询按钮
        shadows: false,
        terrainProviderViewModels: [], //设置地形图列表
        animation: false, //动画小窗口
        baseLayerPicker: false, //图层选择器
        fullscreenButton: false, //全屏
        vrButton: false, //vr按钮
        homeButton: false, //home按钮
        infoBox: false,
        sceneModePicker: false, //2D,2.5D,3D切换
        selectionIndicator: false,
        timeline: false, //时间轴
        navigationHelpButton: false, //帮助按钮
        terrainShadows: Cesium.ShadowMode.DISABLED, // 是否地形接收阴影，Specifies whether the object casts or receives shadows from each light source when shadows are enable
    },
};

export default CesiumMap