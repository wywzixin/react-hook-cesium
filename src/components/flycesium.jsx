import React, { useEffect } from "react"
import * as Cesium from 'cesium/Cesium'
import CesiumMap from "./map.jsx" 
import { Button } from 'antd'
import './flycesium.css'
function FlyCesium(props) {
   
    const containerStyle = {
        // width: "100%",
        height: "100%",
        top: 0,
        left: 256,
        bottom: 0,
        right: 0,
        position: "absolute",
    }
    let cesiumViewer = null 
    let entityFly  = null 
    const geojson = {
        "orientation":{"heading":0.07372076173362352,
        "pitch":-1.5574628887292024,"roll":0},
        "position":{"x":-2205629.231433604,"y":5509184.64306962,"z":2331219.615547844},
        "geometry":{
            "type":"LineString",
            "coordinates":[[111.8181532375421,21.57868178213224],[111.81835028960268,21.578460581633188],[111.81832383076255,21.57812489081727],[111.81847943987464,21.577930686377922],[111.81878489838651,21.57765953027421],[111.81916083936886,21.577412646930927],[111.81958489944898,21.57729241143278],[111.82004766614196,21.57718315464893],[111.8206409631356,21.577000552080584],[111.82134398589339,21.576873639989994],[111.8219423400026,21.576726154070943],[111.822467537162,21.576376210912294],[111.82307030263561,21.576058642812292],[111.8237103973151,21.5756704298083],[111.8240924390803,21.575296152837485],[111.82504071801145,21.575766169089448],[111.82603850185104,21.576124273877287],[111.82694738799758,21.576428149353344],[111.82754018969692,21.576728981595224],[111.828099605676,21.57697046673728],[111.82845968318266,21.577307788777407],[111.8287111214647,21.577998110617774],[111.82881328135024,21.578557636789135],[111.82905095574245,21.57877846306897],[111.82918966895863,21.579074053131905],[111.82928422024466,21.579329257594996],[111.82930019172734,21.579630618390876],[111.82966603969574,21.580020790142015],[111.82960868244719,21.580744679418963],[111.82989219533579,21.581251462292837],[111.83013608532544,21.582236343172],[111.83037855800974,21.58254231013029],[111.83032824715998,21.58299431932842],[111.83001717858694,21.583468817164515],[111.8299185766154,21.584290601587544],[111.82948276544901,21.58496623602712],[111.8289749235787,21.58556878427974],[111.82886305199469,21.585776309810406],[111.8287779821505,21.585946333271792],[111.82865496967007,21.586265136888645],[111.82847674720864,21.586438092096014],[111.82845974740698,21.586567373767977],[111.828355170664,21.586736247366822],[111.82830843296874,21.586863152790087],[111.82825365102633,21.58710380271154],[111.82821734971404,21.587138762444976],[111.82817916952548,21.587294814193356],[111.82787759367034,21.587314539280754],[111.82719468513524,21.587237821164194],[111.82672929414602,21.58716013804561],[111.82658494057793,21.587131014021804],[111.82652478882481,21.587094797111455],[111.82647814913857,21.58694770659332],[111.82649812273736,21.58651375697629],[111.82650209141173,21.586517166652694],[111.82650209141173,21.586517166652694]]
        }
    }
    const title = "cesium飞行"

    function showFly3DPaths(pathsData) {
      
        cesiumViewer.camera.setView({
            destination: pathsData.position,
            orientation: pathsData.orientation,
        });
        setTimeout(function() {
            executeFly3D(pathsData);
        }, 200);
    }

    function executeFly3D(pathsData) {
        if (pathsData && pathsData.geometry) {
            var positionA = pathsData.geometry.coordinates;
            var position = [];
            if (positionA.length > 0) {
                for (var i = 0; i < positionA.length; i++) {
                    var x = positionA[i][0];
                    var y = positionA[i][1];
                    position.push({ x: x, y: y });
                }
            } else {
                return;
            }
            function computeCirclularFlight() {
                var property = new Cesium.SampledPositionProperty();
                for (var i = 0; i < position.length; i++) {
                    if (i == 0) {
                        var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
                        //var _position = Cesium.Cartesian3.fromDegrees(position[i].x, position[i].y, 1170);
                        var _position = Cesium.Cartesian3.fromDegrees(position[i].x, position[i].y, 0);
                        property.addSample(time, _position);
                    }
                    if (i < 10000 && i > 0) {
                        var position_a = new Cesium.Cartesian3(property._property._values[i * 3 - 3], property._property._values[i * 3 - 2], property._property._values[i * 3 - 1]);
                        if (i < 976) {
                            //var _position = Cesium.Cartesian3.fromDegrees(position[i].x, position[i].y, 1170);
                            var _position = Cesium.Cartesian3.fromDegrees(position[i].x, position[i].y, 0);
                        } else if (i > 975 && i < 986) {
                            //var _position = Cesium.Cartesian3.fromDegrees(position[i].x, position[i].y, 1170 + 20 * (i - 980));
                            var _position = Cesium.Cartesian3.fromDegrees(position[i].x, position[i].y, 0);
                        } else if (i > 985) {
                            //var _position = Cesium.Cartesian3.fromDegrees(position[i].x, position[i].y, 1170 + 200);
                            var _position = Cesium.Cartesian3.fromDegrees(position[i].x, position[i].y, 0);
                        }
        
                        var positions = [Cesium.Ellipsoid.WGS84.cartesianToCartographic(position_a), Cesium.Ellipsoid.WGS84.cartesianToCartographic(_position)];
                        var a = new Cesium.EllipsoidGeodesic(positions[0], positions[1]);
                        var long = a.surfaceDistance;
                        var _time = long / 50;
                        var time = Cesium.JulianDate.addSeconds(property._property._times[i - 1], _time, new Cesium.JulianDate());
        
                        property.addSample(time, _position);
                    }
                }
                return property;
            }
            let start = Cesium.JulianDate.fromDate(new Date(2018, 3, 15, 16));
            let stop = Cesium.JulianDate.addSeconds(start, 30000, new Cesium.JulianDate());

            //Make sure viewer is at the desired time.
            cesiumViewer.clock.startTime = start.clone();
            cesiumViewer.clock.stopTime = stop.clone();
            cesiumViewer.clock.currentTime = start.clone();
            cesiumViewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
            //T.cesiumViewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED; //
            //T.cesiumViewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; //
            //T.cesiumViewer.clock.multiplier = 10;//值越大，飞行越快
            cesiumViewer.clock.multiplier = 0.6;
            cesiumViewer.clock.canAnimate = false;
            cesiumViewer.clock.shouldAnimate = true; //设置时间轴动态效果

            let _position = computeCirclularFlight();

            entityFly = cesiumViewer.entities.add({
                //Set the entity availability to the same interval as the simulation time.
                availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
                    start: start,
                    stop: stop
                })]),
                position: _position,
                orientation: new Cesium.VelocityOrientationProperty(_position),
                /*model: {
                    uri:GLOBAL.domainResource+"/systems/common-bx-gis/models/cesium/SampleData/models/CesiumAir/Cesium_Air.gltf",
                    scale: 6,
                    minimumPixelSize: 64,
                    //heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
                },*/
                point: {
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    pixelSize: 15,
                },
                //Show the path as a pink line sampled in 1 second increments.
                path: {
                    resolution: 1,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.1,
                        color: Cesium.Color.YELLOW
                    }),
                    //width: 30
                    width: 10
                }
            });
            cesiumViewer.trackedEntity = entityFly;
            setTimeout(function() {
                cesiumViewer.camera.zoomOut(500.0); //缩小地图，避免底图没有数据
            }, 100);
        } else {
            return;
        }

    }

    function pauseFly3DPaths () {
        let clockViewModel = cesiumViewer.clockViewModel
        if (clockViewModel.shouldAnimate) {
            clockViewModel.shouldAnimate = false;
        } else if (cesiumViewer.clockViewModel.canAnimate) {
            clockViewModel.shouldAnimate = true;
        }
    }
    
    function playForwardFly3DPaths() {
        let clockViewModel = cesiumViewer.clockViewModel;
        let multiplier = clockViewModel.multiplier;
        if (multiplier < 0) {
            clockViewModel.multiplier = -multiplier;
        }
        clockViewModel.shouldAnimate = true;
    }
    function playReverseFly3DPaths (){
        let clockViewModel = cesiumViewer.clockViewModel;
        let multiplier = clockViewModel.multiplier;
        if (multiplier > 0) {
            clockViewModel.multiplier = -multiplier;
        }
        clockViewModel.shouldAnimate = true;
    }

    function stopFly3DPaths (){
        let start = Cesium.JulianDate.fromDate(new Date());
        cesiumViewer.clock.startTime = start.clone();
        let stop = Cesium.JulianDate.addSeconds(start, 300000000, new Cesium.JulianDate());
        cesiumViewer.clock.stopTime = stop.clone();
        //this.cesiumViewer.entities.remove(this.entityFly);
        clearFly3DPaths();
    }
    function clearFly3DPaths (){
        cesiumViewer.trackedEntity = undefined;
        cesiumViewer.entities.removeAll(); //清空所有模型
    }
    useEffect(() => {
         cesiumViewer = new Cesium.Viewer('cesiumContainer', {
            animation: false, //动画控制，默认true
            geocoder: false, //地名查找,默认true
            timeline: false, //时间线,默认true
            homeButton: false, //主页按钮，默认true
            fullscreenButton: false, //全屏按钮,默认显示true
            infoBox: false, //点击要素之后显示的信息,默认true
            navigationHelpButton: false, //导航帮助说明,默认true
            navigationInstructionsInitiallyVisible: false,
            sceneModePicker: false, //是否显示地图2D2.5D3D模式
        });
        //跳转
        cesiumViewer.camera.flyTo({ //初始化跳转某个地方
            destination: Cesium.Cartesian3.fromDegrees(111.828682, 21.579571, 3000)
        });
    
        cesiumViewer._cesiumWidget._creditContainer.style.display = "none"
    },[])

    return (
        <div>
           <div className="flyTools">
                 <Button onClick={() => {showFly3DPaths(geojson)}}>开始飞行</Button>
                 <Button onClick={() => {pauseFly3DPaths()}} className="btn">暂停飞行</Button>
                 <Button onClick={() => {playForwardFly3DPaths()}} className="btn">向前飞行</Button>
                 <Button onClick={() => {playReverseFly3DPaths()}} className="btn">向后飞行</Button>
                 <Button onClick={() => {stopFly3DPaths()}} className="btn">退出飞行</Button>
           </div>
           <div id = "cesiumContainer" style={containerStyle}> </div>
        </div>
    )
}

export default FlyCesium

