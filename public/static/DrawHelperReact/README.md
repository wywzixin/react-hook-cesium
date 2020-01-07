# CesiumDrawHelperReact
CesiumJS, DrawHelper.Js for React

Dependcy is having Cesium.

To use:
import './DrawHelper.css';
import './moreStyle.css';

import {DrawHelper} from './DrawHelper.js';

var drawHelper;
var scene, viewer;

..viewer = new CesiumViewer(this.refs.map, options);

drawHelper = new DrawHelper(viewer);
