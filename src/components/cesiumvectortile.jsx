import React, { useEffect } from "react";
import * as Cesium from 'cesium/Cesium'

function CesiumVectorTile(props) {
    const title = "cesium加载矢量瓦片"

    useEffect(() => {
        //加载谷歌中国卫星影像，谷歌地球商业版，需要翻墙，报跨域资源请求错误
       const VectorTileImageryProvider = Cesium.VectorTileImageryProvider;
	//创建地图
    let viewer = new Cesium.Viewer('cesiumContainer', {
              animation:false, //动画控制，默认true
              baseLayerPicker:false,//地图切换控件(底图以及地形图)是否显示,默认显示true
              fullscreenButton:false,//全屏按钮,默认显示true
              geocoder:false,//地名查找,默认true
              timeline:false,//时间线,默认true
              vrButton:false,//双屏模式,默认不显示false
              homeButton:false,//主页按钮，默认true
              infoBox:true,//点击要素之后显示的信息,默认true
              selectionIndicator:true,//选中元素显示,默认true
              navigationHelpButton:false,//导航帮助说明,默认true
              navigationInstructionsInitiallyVisible:false,
              sceneModePicker : false,//是否显示地图2D2.5D3D模式
    });    
    viewer.imageryLayers.layerAdded.addEventListener(function () {
          
        setTimeout(function () {
            viewer.imageryLayers.orderByZIndex();
        }, 200)

    })
    viewer.scene.debugShowFramesPerSecond = true;
	  //隐藏logo
	  hideMapLogo();
	  /**
	  * 隐藏logo以及地图服务版权信息
	  * @method hideMapLogo
	  * @param
	  * @return
	  */
	  function hideMapLogo(){
		viewer._cesiumWidget._creditContainer.style.display = "none";
	  }

    let provinceLayer = null;

    Cesium.loadText("static/Data/json/bj.json").then(function (geojson) {
        geojson = eval("(" + geojson + ")");
        var turf = Cesium.turf;
        var mask = null;

        try {
            //缓冲区
            var bufferedOuter = turf.buffer(geojson.features[0], 2, "kilometers");

            var bufferedInner = turf.buffer(geojson.features[0], 1, "kilometers")
            bufferedInner = turf.difference(bufferedInner, geojson.features[0]);

            bufferedOuter = turf.difference(bufferedOuter, bufferedInner);

            bufferedInner = turf.featureCollection([bufferedInner]);
            bufferedOuter = turf.featureCollection([bufferedOuter]);

            var bufferedOuterProvider = new VectorTileImageryProvider({
                source: bufferedOuter,
                zIndex: 99,
                removeDuplicate: false,
                defaultStyle: {
                    outlineColor: "rgba(209,204,226,1)",
                    lineWidth: 2,
                    outline: true,
                    fill: true,
                    fillColor: "rgba(209,204,226,1)",
                    tileCacheSize: 200,
                    showMaker: false,
                    showCenterLabel: true,
                    fontColor: "rgba(255,0,0,1)",
                    labelOffsetX: -10,
                    labelOffsetY: -5,
                    fontSize: 13,
                    fontFamily: "黑体",
                    centerLabelPropertyName: "NAME"
                },
                maximumLevel: 20,
                minimumLevel: 5,
                minimumLevel: 5,
                simplify: false
            });
            let bufferedOuterLayer;
            bufferedOuterProvider.readyPromise.then(function () {
                bufferedOuterLayer = viewer.imageryLayers.addImageryProvider(bufferedOuterProvider);
            });

            let bufferedInnerProvider = new VectorTileImageryProvider({
                source: bufferedInner,
                zIndex: 99,
                removeDuplicate: false,
                defaultStyle: {
                    outlineColor: "rgba(185,169,199,1)",
                    lineWidth: 2,
                    outline: true,
                    fill: true,
                    fillColor: "rgba(185,169,199,1)",
                    tileCacheSize: 200,
                    showMaker: false,
                    showCenterLabel: true,
                    fontColor: "rgba(255,0,0,1)",
                    labelOffsetX: -10,
                    labelOffsetY: -5,
                    fontSize: 13,
                    fontFamily: "黑体",
                    centerLabelPropertyName: "NAME"
                },
                maximumLevel: 20,
                minimumLevel: 5,
                minimumLevel: 5,
                simplify: false
            });
            let bufferedInnerLayer;
            bufferedInnerProvider.readyPromise.then(function () {
                bufferedInnerLayer = viewer.imageryLayers.addImageryProvider(bufferedInnerProvider);
            });


        } catch (e) {
            console.log(e);
        }


        Cesium.loadText("../lib/Data/json/bjsx.json").then(function (bjsx) {
            bjsx = eval("(" + bjsx + ")");

            turf.featureEach(bjsx, function (feature, index) {
                var name = feature.properties.NAME.replace(/\s+$/, '')
                if (name == "海淀区" || name == "门头沟区") {//挖孔
                    mask = feature;
                    if (mask) {
                        geojson = turf.difference(geojson.features[0], mask);
                        geojson = turf.featureCollection([geojson]);
                    }
                }
            })

            var provinceProvider = new VectorTileImageryProvider({
                source: geojson,
                zIndex: 100,
                removeDuplicate: false,
                defaultStyle: {
                    outlineColor: "rgb(255,255,255)",
                    lineWidth: 2,
                    fill: true,
                    tileCacheSize: 200,
                    showMaker: false,
                    showCenterLabel: true,
                    fontColor: "rgba(255,0,0,1)",
                    labelOffsetX: -10,
                    labelOffsetY: -5,
                    fontSize: 13,
                    fontFamily: "黑体",
                    centerLabelPropertyName: "NAME"
                },
                maximumLevel: 20,
                minimumLevel: 5,
                minimumLevel: 5,
                simplify: false
            });
            provinceProvider.readyPromise.then(function () {
                provinceLayer = viewer.imageryLayers.addImageryProvider(provinceProvider);

            });

            //添加区县
            viewer.imageryLayers.addImageryProvider(new VectorTileImageryProvider({
                source: bjsx,
                zIndex: 2,
                removeDuplicate: false,
                defaultStyle: {
                    outlineColor: "rgb(255,255,255)",
                    lineWidth: 2,
                    fill: false,
                    tileCacheSize: 200,
                    showMaker: false,
                    showCenterLabel: true,
                    fontColor: "rgba(255,0,0,1)",
                    labelOffsetX: -10,
                    labelOffsetY: -5,
                    fontSize: 13,
                    fontFamily: "黑体",
                    centerLabelPropertyName: "NAME"
                },
                maximumLevel: 20,
                minimumLevel: 6,
                simplify: false
            }));

        })
    })

    var shpPromises2 = [
        Cesium.loadBlob("static/Data/shp/world/国家简化边界.shp"),
        Cesium.loadBlob("static/Data/shp/world/国家简化边界.dbf"),
        Cesium.loadBlob("static/Data/shp/world/国家简化边界.dbf"),
        Cesium.loadBlob("static/Data/shp/world/国家简化边界.prj"),
    ];
    Cesium.when.all(shpPromises2, function (files) {
        files[0].name = "国家简化边界.shp";
        files[1].name = "国家简化边界.dbf";
        files[2].name = "国家简化边界.prj";

        var shpLayer = null;
        var shpProvider = new VectorTileImageryProvider({
            source: files,
            removeDuplicate: false,
            zIndex:1,
            defaultStyle: {
                lineWidth: 2,
                fill: true,
                tileCacheSize: 200,
                showMaker: false,
                showCenterLabel: true,
                fontColor: Cesium.Color.WHITE,

               // outlineColor: 'rgba(138,138,138,1)',//边界颜色
				outlineColor: "rgb(255,255,0)",//边界颜色
                //fillColor: 'rgba(225,225,225,1)',//陆地颜色
				fillColor: 'rgba(255,255,0,0.1)',//陆地颜色
                //backgroundColor: 'rgba(89,129,188,1)',//海区颜色
				backgroundColor: 'rgba(89,129,188,0)',//海区颜色

                labelOffsetX: 0,
                labelOffsetY: 0,
                fontSize: 16,
                fontFamily: "黑体",
                // lineDash: [2, 5, 2, 5],
                labelStroke: true,
                labelStrokeWidth: 2,
                labelStrokeColor: "rgba(255,0,0,1)",
                centerLabelPropertyName: "NAME"
            },
            maximumLevel: 20,
            minimumLevel: 1,
            simplify: true,
            styleFilter: function (feature, style, x, y, level) {
                if (feature.properties
                    && feature.properties.NAME
                    && feature.properties.NAME.indexOf('CHINA') >= 0) {
                    //style.fillColor = Cesium.Color.fromBytes(255, 255, 255, 255);
					style.fillColor = Cesium.Color.fromBytes(255, 255, 0, 0.1);//中国区域填充颜色
                    
                }
                return style;
            }
        });
        shpProvider.readyPromise.then(function () {
            shpLayer = viewer.imageryLayers.addImageryProvider(shpProvider);
            // viewer.imageryLayers.raiseToTop(chinaLayer);
            //viewer.imageryLayers.raiseToBottom(shpLayer);

        });

    });

	var shpPromises = [
	Cesium.loadBlob("static/Data/shp/china/国界线.shp"),
	Cesium.loadBlob("static/Data/shp/china/国界线.dbf"),
	Cesium.loadBlob("static/Data/shp/china/国界线.prj"),
    ];
    var chinaLayer = null;
    Cesium.when.all(shpPromises, function (files) {
        files[0].name = "国界线.shp";
        files[1].name = "国界线.dbf";
        files[2].name = "国界线.prj";


        var shpProvider = new VectorTileImageryProvider({
            source: files,
            zIndex: 99,
            removeDuplicate: false,
            defaultStyle: {
                outlineColor: "rgb(255,0,0)",
                fillColor: "rgba(255,0,0,0.6)",
                lineWidth: 2,
                fill: false,
                tileCacheSize: 200,
                showMaker: false,
                showCenterLabel: true,
                fontColor: "rgba(255,0,0,1)",
                labelOffsetX: -10,
                labelOffsetY: -5,
                fontSize: 13,
                fontFamily: "黑体",
                centerLabelPropertyName: "NAME",
                lineCap: "round",
                shadowColor: "black",
                shadowOffsetX: 1,
                shadowOffsetY: -1,
                shadowBlur: 1,
                lineJoin: "round"
            },
            maximumLevel: 20,
            minimumLevel: 1,
            simplify: false
        });
        shpProvider.readyPromise.then(function () {
            chinaLayer = viewer.imageryLayers.addImageryProvider(shpProvider);
            
            viewer.flyTo(chinaLayer);
            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = shpProvider.rectangle;

        });

    });

    }, [])
    return (
        <div>
            <div id="cesiumContainer"></div>
        </div>
    )
}

export default CesiumVectorTile

