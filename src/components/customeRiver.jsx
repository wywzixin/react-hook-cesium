import Axios from "axios";
import React, {useEffect} from "react";
import CesiumMap from "./map.jsx";
import * as Cesium from 'cesium/Cesium'

function CustomeRiver () {

    const title = "画河流"

    function handleViewerLoaded(viewer) {
        Axios.get("static/json/islandRiver.json").then((res) => {
            let data = res.data.data;
            let riverPoint = [];
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                riverPoint.push(Number.parseFloat(item.longitude));
                riverPoint.push(Number.parseFloat(item.latitude));
            }
            return riverPoint;
        }).then((riverPoint) => {
            // 球上多边形的描述。多边形由多边形层次结构定义。可以使用 Primitive 和 GroundPrimitive 来渲染多边形几何图形一个
            let polygon = new Cesium.PolygonGeometry({
                // new Cesium.PolygonHierarchy ( positions , holes ) 定义多边形及其孔的线性环的层次结构。孔本身也可以具有嵌套内部多边形的孔。
                polygonHierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(riverPoint)),
                extrudedHeight: 0,
                height: 3,   // 多边形和椭球面之间的距离，以米为单位
                // 要计算的顶点属性
                // 椭球表面上的几何外观,  所有 EllipsoidSurfaceAppearance 实例的 VertexFormat 兼容
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
            });
            // 几何体实例化允许一个 Geometry 对象在多个对象中的位置不同的位置和独特的颜色
            let inc = new Cesium.GeometryInstance({
                geometry: polygon 
            })

            // 图元表示 场景 中的几何。几何可以来自单个 GeometryInstance 如下例1所示，或来自实例数组
            let River = new Cesium.Primitive({
                geometryInstances: [inc],
                // 椭球表面上的几何外观，例如 PolygonGeometry 和 RectangleGeometry
                appearance: new Cesium.EllipsoidSurfaceAppearance({
                    aboveGround: true   // 如果为 true ，则该几何体应位于椭球体的表面上
                }),
                show: true
            });
            let a = 0.3;
            let colorg = new Cesium.Color(a * 3.0 / 255, a * 42.0 / 255, a * 111.0 / 255, 1.0);
            var River_Material = new Cesium.Material({
                fabric: {
                    type: 'Water',
                    uniforms: {
                        baseWaterColor: colorg,  // rgba color object base color of the water
                        specularIntensity: 0.0001,   // Number that controls the intensity of specular reflections.
                        normalMap: 'static/images/riverNormal.jpg',  //Normal map for water normal perturbation
                        frequency: 500.0,  // Number that controls the number of waves.
                        animationSpeed: 0.01,  //Number that controls the animations speed of the water.
                        amplitude: 10.0   //Number that controls the amplitude of water waves
                    }
                }
            });
            River.appearance.material = River_Material;
            viewer.scene.primitives.add(River);

            viewer.camera.setView({
                destination: new Cesium.Cartesian3(-2862254.210290102, 4651511.794501719, 3283563.2216813704),
                orientation: {
                    heading: 6.159615851035844, // east, default value is 0.0 (north)
                    pitch: -0.6766046253129958,    // default value (looking down)
                    roll: 6.282714572962707                             // default value
                }
            })
        }).catch(err => {
            console.error(err);
        });
    }

   
    return (
        <CesiumMap id={title} onViewerLoaded={(viewer) => {handleViewerLoaded(viewer) }} />
    )
}

export default CustomeRiver