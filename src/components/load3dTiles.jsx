import React, { useEffect } from "react"
import * as Cesium from 'cesium/Cesium'
import CesiumMap from "./map.jsx"
function Load3DTiles(props) {


    const title = "cesium加载3DTiles"

    function handleViewerLoaded(viewer) {
        let modelPath = "http://cloudv2bucket.oss-cn-shanghai.aliyuncs.com/185/1254/resultCC/Production_1.json"

        let tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
            url: modelPath,
            maximumScreenSpaceError: 0.8,
            maximumNumberOfLoadedTiles: 100,
            // shadows: Cesium.ShadowMode.DISABLED
        }));
        viewer.zoomTo(tileset);
    }
    return (
        <div>
            <CesiumMap id={title} onViewerLoaded={(viewer) => {handleViewerLoaded(viewer) }} />
        </div>
    )
}

export default Load3DTiles

