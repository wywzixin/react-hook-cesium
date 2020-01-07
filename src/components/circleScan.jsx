import React, { useEffect } from "react";
import * as Cesium from 'cesium/Cesium'
import './flycesium.css'
import { Button } from 'antd'

function CircleScan(props) {
    const containerStyle = {
        width: "100%",
        height: "100%",
        top: 0,
        left: 256,
        bottom: 0,
        right: 0,
        position: "absolute",
    }
    const title = "cesium雷达扫描"

    let viewer = null 

    function AddCircleScanPostStage(viewer, cartographicCenter, maxRadius, scanColor, duration) {
        var ScanSegmentShader =
            "uniform sampler2D colorTexture;\n" +
            "uniform sampler2D depthTexture;\n" +
            "varying vec2 v_textureCoordinates;\n" +
            "uniform vec4 u_scanCenterEC;\n" +
            "uniform vec3 u_scanPlaneNormalEC;\n" +
            "uniform float u_radius;\n" +
            "uniform vec4 u_scanColor;\n" +

            "vec4 toEye(in vec2 uv, in float depth)\n" +
            " {\n" +
              " vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
              " vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +
              " posInCamera =posInCamera / posInCamera.w;\n" +
              " return posInCamera;\n" +
            " }\n" +

            "vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +
            "{\n" +
                "vec3 v01 = point -planeOrigin;\n" +
                "float d = dot(planeNormal, v01) ;\n" +
                "return (point - planeNormal * d);\n" +
             "}\n" +

             "float getDepth(in vec4 depth)\n" +
             "{\n" +
                "float z_window = czm_unpackDepth(depth);\n" +
                "z_window = czm_reverseLogDepth(z_window);\n" +
                "float n_range = czm_depthRange.near;\n" +
                "float f_range = czm_depthRange.far;\n" +
                "return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +
             "}\n" +

             "void main()\n" +
             "{\n" +
                "gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n" +
                "float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n" +
                "vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +
                "vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +
                "float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
                "if(dis < u_radius)\n" +
                    "{\n" +
                    "float f = 1.0 -abs(u_radius - dis) / u_radius;\n" +
                    "f = pow(f, 4.0);\n" +
                    "gl_FragColor = mix(gl_FragColor, u_scanColor, f);\n" +
                 "}\n" +
              "}\n";

        var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

        var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
        var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
        var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

        var _time = (new Date()).getTime();

        var _scratchCartesian4Center = new Cesium.Cartesian4();
        var _scratchCartesian4Center1 = new Cesium.Cartesian4();
        var _scratchCartesian3Normal = new Cesium.Cartesian3();

        var ScanPostStage = new Cesium.PostProcessStage({
            fragmentShader: ScanSegmentShader,
            uniforms: {
                u_scanCenterEC: function () {
                    return Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                },
                u_scanPlaneNormalEC: function () {
                    var temp = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    var temp1 = Cesium.Matrix4.multiplyByVector(viewer.camera._viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                    return _scratchCartesian3Normal;
                },
                u_radius: function () {
                    return maxRadius * (((new Date()).getTime() - _time) % duration) / duration;
                },
                u_scanColor: scanColor
            }
        });

        viewer.scene.postProcessStages.add(ScanPostStage);
    }
    function showCircleScan () {
          // 添加雷达扫描
          let lat = 40.70524201566827;// 42.006;
          let lon = -74.01296152309055;//128.055;
          let CartographicCenter = new Cesium.Cartographic(Cesium.Math.toRadians(lon), Cesium.Math.toRadians(lat), 0);
          let scanColor = new Cesium.Color(1.0, 0.0, 0.0, 1);
          AddCircleScanPostStage(viewer, CartographicCenter, 1500, scanColor, 4000);
    }
    useEffect(() => {
        const image_Source = new Cesium.UrlTemplateImageryProvider({
            //url: 'http://mt0.google.cn/vt/lyrs=t,r&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
            //url: 'https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            url: "http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
            //tilingScheme : new Cesium.GeographicTilingScheme(),
            credit: ''
        });
         viewer = new Cesium.Viewer('cesiumContainer', {
            geocoder: false,
            homeButton: false,
            sceneModePicker: false,
            fullscreenButton: false,
            vrButton: false,
            baseLayerPicker: false,
            infoBox: false,
            selectionIndicator: true,
            animation: false,
            timeline: false,
            shouldAnimate: true,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            imageryProvider: image_Source
        });
        
        let lat = 40.70524201566827;// 42.006;
        let lon = -74.01296152309055;//128.055;
    
        viewer.scene.globe.enableLighting = false;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.globe.showGroundAtmosphere = false;
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 300000)
        });
        //取消双击事件
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        /*let tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
            url: 'http://localhost:8010/3dtiles/NewYork/tileset.json' //   ./data/3dtiles-lab/tileset.json
        }));*/
        // Load the NYC buildings tileset.
        //let tileset = new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(5741) });
        let tileset = new Cesium.Cesium3DTileset({ url: 'static/NewYork-3dtiles/tileset.json'});
        viewer.scene.primitives.add(tileset);
        tileset.readyPromise.then(function () {
            let boundingSphere = tileset.boundingSphere;
            viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius));
            viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        }).otherwise(function (error) {
            throw (error);
        });
    
    },[])
    return (
        <div>
            <div className="flyTools">
                 <Button onClick={() => {showCircleScan()}}>添加雷达扫描</Button>
           </div>
            <div id="cesiumContainer" style={containerStyle}></div>
        </div>
    )
}

export default CircleScan