import React, { useState, useEffect, useRef } from "react"
import * as Cesium from 'cesium/Cesium'
import './addpopup.css'

function AddPopup(props) {
    let viewer = null
    let [showPopup, setShowPopup] = useState(false)
   
    const trackPopUpContent = useRef()
    const trackPopUpLink = useRef()

    let [popupWidth,setPopupWidth] = useState(187)
    let [popupHeight,setPopupHeight] = useState(105)
    
    function addPictureMarkerSymbols(symbols) {
        if (symbols && symbols.length > 0) {
            for (let i = 0; i < symbols.length; i++) {
                let type = null;
                if (symbols[i].type) {
                    type = symbols[i].type;
                }
                viewer.entities.add({
                    id: symbols[i].id,
                    name: symbols[i].name,
                    type: type,
                    position: symbols[i].position,
                    description: symbols[i].description,
                    billboard: {
                        image: symbols[i].url,
                        width: symbols[i].width,
                        height: symbols[i].height
                    },
                    label: {
                        text: symbols[i].name,
                        //font : '13pt monospace',
                        font: '13px sans-serif',
                        //fillColor:Cesium.Color.BLUE,
                        //outlineColor:Cesium.Color.WHITE,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 1,
                        verticalOrigin: Cesium.VerticalOrigin.TOP,
                        pixelOffset: new Cesium.Cartesian2(0, 16)
                    }
                });
            }
        }

    }

    function infoWindow(obj) {
        let picked = viewer.scene.pick(obj.position);
        if (Cesium.defined(picked)) {
            let id = Cesium.defaultValue(picked.id, picked.primitive.id);
            if (id instanceof Cesium.Entity) {
                if (obj.destination) {
                    viewer.camera.flyTo({//初始化跳转某个地方
                        destination: obj.destination
                    });
                }
                //填充内容
                //$(".cesium-selection-wrapper").show();
                //$('#trackPopUpLink').empty();
               // setPopupContent('')
                //$('#trackPopUpLink').append(obj.content);
                //setPopupContent(obj.content)
                function positionPopUp(c) {
                    let x = c.x - popupWidth / 2;
                    let y = c.y - popupHeight;
                    //trackPopUpContent.current.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)'
                    trackPopUpContent.current.style.transform = 'translate3d(1129.535px, 320.517px, 0px)'
                    // translate3d(1100.535px, 288.517px, 0px)
                    //$('#trackPopUpContent').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
                }
                let c = new Cesium.Cartesian2(obj.position.x, obj.position.y);
                //$('#trackPopUp').show();
                setShowPopup(true)
                setPopupWidth(trackPopUpContent.current.clientWidth)
                setPopupHeight(trackPopUpLink.current.clientHeight)
                positionPopUp(c); // Initial position at the place item picked
                let removeHandler = viewer.scene.postRender.addEventListener(function () {
                    let changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, id._position._value);
                    // If things moved, move the popUp too
                    if (c && changedC && c.x && changedC.x && c.y && changedC.y) {
                        if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
                            positionPopUp(changedC);
                            c = changedC;
                        }
                    }

                });
                // PopUp close button event handler
                // $('.leaflet-popup-close-button').click(function () {
                //     $('#trackPopUp').hide();
                //     $('#trackPopUpLink').empty();
                //     //$(".cesium-selection-wrapper").hide();
                //     removeHandler.call();
                //     return false;
                // });
                return id;
            }
        }

    }

    useEffect(() => {
        viewer = new Cesium.Viewer('cesiumContainer', {
            animation: false, //动画控制，默认true
            geocoder: false,//地名查找,默认true
            timeline: false,//时间线,默认true
            homeButton: false,//主页按钮，默认true
            fullscreenButton: false,//全屏按钮,默认显示true
            infoBox: false,//点击要素之后显示的信息,默认true
            navigationHelpButton: false,//导航帮助说明,默认true
            navigationInstructionsInitiallyVisible: false,
        })
        //跳转
        viewer.camera.flyTo({//初始化跳转某个地方
            destination: Cesium.Cartesian3.fromDegrees(111.828682, 21.579571, 3000)
        })

        //隐藏logo
        viewer._cesiumWidget._creditContainer.style.display = "none"

        let symbols = []
        let obj = {
            id: "monitorID_1",
            name: "测试监控1",
            type: "infoWindow",
            position: Cesium.Cartesian3.fromDegrees(111.828682, 21.579571),
            url: require("../lib/images/red.png"),
            description: { name: "测试监控1", content: "测试在线监控气泡窗口内容1" },
            width: 32,
            height: 60
        };
        symbols.push(obj)
        addPictureMarkerSymbols(symbols)

        let handler3D = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler3D.setInputAction(function (movement) {
            //点击弹出气泡窗口
            let pick = viewer.scene.pick(movement.position);
            if (pick && pick.id && pick.id._position) {//选中某模型
                let cartographic = Cesium.Cartographic.fromCartesian(pick.id._position._value);//世界坐标转地理坐标（弧度）
                let point = [cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180];//地理坐标（弧度）转经纬度坐标
                let destination = Cesium.Cartesian3.fromDegrees(point[0], point[1], 3000.0);
                //debugger;
                //判断是否弹出气泡窗口内容
                switch (pick.id._type) {
                    case "infoWindow":
                        // let content =
                        //     "<div>" +
                        //     "<span>测试监控1:</span><span>测试监控11</span></br>" +
                        //     "<span>测试监控12:</span><span>测试监控12</span></br>" +
                        //     "<span>测试监控13:</span><span>测试监控13</span></br>" +
                        //     "</div>";
                        let obj = { position: movement.position, destination: destination };
                        infoWindow(obj);
                        break;
                }
            }
            else {
                setShowPopup(false)
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }, [])

    return (
        <div>
            <div id="cesiumContainer" className="container"> </div>
            {
                showPopup ?
                    <div id="trackPopUp" >
                        <div ref={trackPopUpContent}
                            className="leaflet-popup"
                            style={{
                                width: popupWidth ,
                                height: popupHeight,
                            }}>
                            <a className="leaflet-popup-close-button" href="#">×</a>
                            <div className="leaflet-popup-content-wrapper">
                                <div ref={trackPopUpLink} className="leaflet-popup-content" style={{ width:'300px'}}>
                                    <div>
                                      <div><span>测试监控1:</span><span>测试监控11</span></div>
                                      <div><span>测试监控12:</span><span>测试监控12</span></div>
                                      <div><span>测试监控13:</span><span>测试监控13</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="leaflet-popup-tip-container">
                                <div className="leaflet-popup-tip">
                                </div>
                            </div>
                        </div>
                    </div>
                    : null
            }
        </div>
    )
}

export default AddPopup

