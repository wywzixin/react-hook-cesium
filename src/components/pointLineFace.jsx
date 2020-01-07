import React from "react";
import  CesiumMap  from "./map.jsx";
import * as Cesium from 'cesium/Cesium'

function PointLineFace(props) {
    const title = "点线面与鼠标交互"

    function handleViewerLoaded(viewer) {
        let pointArr = Cesium.Cartesian3.fromDegreesArrayHeights([
            121.444409, 31.247417, 200.0,
            121.533521, 31.235685, 200.0,
            121.563273, 31.190347, 200.0,
            121.546744, 31.194054, 200.0,
            121.516705, 31.191459, 200.0,
            121.502188, 31.203074, 200.0,
        ]);

        //--------------draw points
        pointArr.forEach(item => {
            viewer.entities.add({
                point: {
                    color: Cesium.Color.AQUA,
                    pixelSize: 15,
                    zIndex: 20
                },
                position: item,
            });
        });
        //-------------draw face
        viewer.entities.add({
            polygon: {
                hierarchy: pointArr,
                material: Cesium.Color.RED.withAlpha(0.3),
                perPositionHeight: true   // 一个布尔值，指定是否使用每个位置的高度
            }
        });
        pointArr.push(pointArr[0]);
        //-----------------draw line
        viewer.entities.add({
            polyline: {
                positions: pointArr,
                material: Cesium.Color.BLUE,
                zIndex: 10
            }
        });
        // flyToBoundingSphere (boundingSphere, options ) 将相机移到当前视图包含所提供的包围球的位置
        //  Cesium.BoundingSphere.fromPoints 计算包含3D笛卡尔点列表的紧配合边界球。
        // 边界球是通过运行两种算法来计算的:朴素算法和里特的算法。两个球体中较小的一个用于确保紧密配合
        viewer.scene.camera.flyToBoundingSphere(Cesium.BoundingSphere.fromPoints(pointArr));
    }
    return (
        <div>
            <CesiumMap id={title}  onViewerLoaded={(viewer) => {handleViewerLoaded(viewer)}}/>
        </div>
    )
}

export default PointLineFace

