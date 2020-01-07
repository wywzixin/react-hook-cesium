import React, { useEffect } from "react"
import * as Cesium from 'cesium/Cesium'
import { Button } from 'antd'
import DrawPolt from '../lib/Draw/draw'


function HeatMap(props) {
    const containerStyle = {
        width: "100%",
        height: "100%",
        top: 0,
        left: 256,
        bottom: 0,
        right: 0,
        position: "absolute",
    }

    const heatmapStyle = {
        width: "500px",
		height: "500px"
    }

    useEffect(() => {

            // let len = 300;
			// let points = [];
			// let max = 100;
			// let width = 600;
			// let height = 400;

			// let latMin = 28.364807;
			// let latMax = 40.251095;
			// let lonMin = 94.389228;
			// let lonMax = 108.666357;

			// let dataRaw = [];
			// for (let i = 0; i < len; i++) {
			// 	let point = {
			// 		lat: latMin + Math.random() * (latMax - latMin),
			// 		lon: lonMin + Math.random() * (lonMax - lonMin),
			// 		value: Math.floor(Math.random() * 100)
			// 	};
			// 	dataRaw.push(point);
			// }

			// for (let i = 0; i < len; i++) {
			// 	let dataItem = dataRaw[i];
			// 	let point = {
			// 		x: Math.floor((dataItem.lat - latMin) / (latMax - latMin) * width),
			// 		y: Math.floor((dataItem.lon - lonMin) / (lonMax - lonMin) * height),
			// 		value: Math.floor(dataItem.value)
			// 	};
			// 	max = Math.max(max, dataItem.value);
			// 	points.push(point);
			// }

			// // let heatmapInstance = h337.create({
			// // 	container: document.querySelector('#heatmap')
			// // });

			// let data = {
			// 	max: max,
			// 	data: points
			// };

			// heatmapInstance.setData(data);


			// let viewer = new Cesium.Viewer('cesiumContainer');

			// viewer._cesiumWidget._creditContainer.style.display = "none";

			// let canvas = document.getElementsByClassName('heatmap-canvas');
			// console.log(canvas);
			// viewer.entities.add({
			// 	name: 'heatmap',
			// 	rectangle: {
			// 		coordinates: Cesium.Rectangle.fromDegrees(lonMin, latMin, lonMax, latMax),
			// 		material: new Cesium.ImageMaterialProperty({
			// 			image: canvas[0],
			// 			transparent: true
			// 		})

			// 	}
			// });

			// viewer.zoomTo(viewer.entities);
    }, [])

    return (
        <div>
            <div class="body-content">
                <div id="cesiumContainer" style={containerStyle}></div>
                <div id="heatmap"  style={heatmapStyle}></div>
            </div>
        </div>
    )
}

export default HeatMap

