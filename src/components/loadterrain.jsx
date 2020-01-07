import React, { useEffect } from "react"
import * as Cesium from 'cesium/Cesium'

function LoadTerrain(props) {

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
    //加载谷歌中国卫星影像，谷歌地球商业版，需要翻墙，报跨域资源请求错误
    var url = "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali";
    var Google = new Cesium.UrlTemplateImageryProvider({ url: url })
    //加载在线地形图数据
    var worldTerrain = Cesium.createWorldTerrain({
      // required for water effects
      requestWaterMask: true,
      // required for terrain lighting
      requestVertexNormals: true
    });

    //Viewer第一个参数容器就是需要上面的div容器承载
    var viewer = new Cesium.Viewer('cesiumContainer', {
      // 将图层选择的控件关掉，才能添加其他影像数据
      baselLayerPicker: false,
      //imageryProvider: Google,
      terrainProvider: worldTerrain
    });

    viewer.camera.setView({
      // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
      // fromDegrees()方法，将经纬度和高程转换为世界坐标
      destination: Cesium.Cartesian3.fromDegrees(117.48, 30.67, 15000.0),
      orientation: {
        // 指向
        heading: Cesium.Math.toRadians(90, 0),
        // 视角
        pitch: Cesium.Math.toRadians(-90),
        roll: 0.0
      }
    });
    // 同理，想要标记某个位置和角度，下次直接进入，可以在选好的角度上按F12进入开发者工具
    // 输入viewer.camera.heading  viewer.camera.pitch  viewer.camera.position回车可以得到信息

  }, [])
  return (
    <div>
      <div id="cesiumContainer" style={containerStyle} ></div>
    </div>
  )
}

export default LoadTerrain

