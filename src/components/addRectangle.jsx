import React, { useEffect } from "react";
import * as Cesium from 'cesium/Cesium'

function AddRectangle(props) {
    const containerStyle = {
        width: "100%",
        height: "100%",
        top: 0,
        left: 256,
        bottom: 0,
        right: 0,
        position: "absolute",
    }
    const title = "cesium指添加矩形"
   
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
        let homePOsition = [110.20, 34.55, 3000000];
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(homePOsition[0], homePOsition[1], homePOsition[2])
        });

        //entity方式
        viewer.entities.add({
            rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(110.20, 34.55, 111.20, 35.55),
                material: new Cesium.StripeMaterialProperty({
                    evenColor: Cesium.Color.WHITE,
                    oddColor: Cesium.Color.BLUE,
                    repeat:5
                })
            }
        });

        //primitive方式
        let instance = new Cesium.GeometryInstance({
            geometry: new Cesium.RectangleGeometry({
                rectangle: Cesium.Rectangle.fromDegrees(105.20, 30.55, 106.20, 31.55),
                vertexFormat:Cesium.EllipsoidSurfaceAppearance.VERTEXT_FORMAT
            })
        });
        viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                material:Cesium.Material.fromType('Stripe')
            })
        }));
    }, [])
    return (
        <div>
            <div id="cesiumContainer" style={containerStyle}></div>
        </div>
    )
}

export default AddRectangle

