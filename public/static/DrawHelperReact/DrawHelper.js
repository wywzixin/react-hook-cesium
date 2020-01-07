/* ADDED */

// CORE CESIUM IMPORTS
import Rectangle from 'cesium/Source/Core/Rectangle.js';

import CesiumMath from 'cesium/Source/Core/Math.js';

import ScreenSpaceEventHandler from 'cesium/Source/Core/ScreenSpaceEventHandler.js';
import ColorGeometryInstanceAttribute from 'cesium/Source/Core/ColorGeometryInstanceAttribute.js';
import EllipsoidGeodesic from 'cesium/Source/Core/EllipsoidGeodesic.js';
import ScreenSpaceEventType from 'cesium/Source/Core/ScreenSpaceEventType.js';

import Ellipsoid from 'cesium/Source/Core/Ellipsoid.js';
import GeometryInstance from 'cesium/Source/Core/GeometryInstance.js';
import Color from 'cesium/Source/Core/Color.js';
import defined from 'cesium/Source/Core/defined.js';
import destroyObject from 'cesium/Source/Core/destroyObject.js';

import CircleGeometry from 'cesium/Source/Core/CircleGeometry.js';
import PolygonGeometry from 'cesium/Source/Core/PolygonGeometry.js';
import RectangleGeometry from 'cesium/Source/Core/RectangleGeometry.js';
import PolylineGeometry from 'cesium/Source/Core/PolylineGeometry.js';
import EllipseGeometry from 'cesium/Source/Core/EllipseGeometry.js';

import CircleOutlineGeometry from 'cesium/Source/Core/CircleOutlineGeometry.js';
import RectangleOutlineGeometry from 'cesium/Source/Core/RectangleOutlineGeometry.js';
import EllipseOutlineGeometry from 'cesium/Source/Core/EllipseOutlineGeometry.js';
import PolygonOutlineGeometry from 'cesium/Source/Core/PolygonOutlineGeometry.js';

import DeveloperError from 'cesium/Source/Core/DeveloperError.js';

import Cartographic from 'cesium/Source/Core/Cartographic.js';
import Cartesian2 from 'cesium/Source/Core/Cartesian2.js'
import Cartesian3 from 'cesium/Source/Core/Cartesian3.js';
import defaultValue from 'cesium/Source/Core/defaultValue.js';
import Matrix3 from 'cesium/Source/Core/Matrix3.js';
import Quaternion from 'cesium/Source/Core/Quaternion.js';

// Scene CESIUM IMPORTS
import Material from 'cesium/Source/Scene/Material.js';
import Billboard from 'cesium/Source/Scene/Billboard.js';
import Primitive from 'cesium/Source/Scene/Primitive.js';
import EllipsoidSurfaceAppearance from 'cesium/Source/Scene/EllipsoidSurfaceAppearance.js';
import PerInstanceColorAppearance from 'cesium/Source/Scene/PerInstanceColorAppearance.js';
import PolylineMaterialAppearance from 'cesium/Source/Scene/PolylineMaterialAppearance.js';
import HorizontalOrigin from 'cesium/Source/Scene/HorizontalOrigin.js';
import VerticalOrigin from 'cesium/Source/Scene/VerticalOrigin.js';
import BillboardCollection from 'cesium/Source/Scene/BillboardCollection.js';

var Extent = function(west, south, east, north) {
    /**
     * The westernmost longitude in radians in the range [-Pi, Pi].
     *
     * @type {Number}
     * @default 0.0
     */
    this.west = defaultValue(west, 0.0);

    /**
     * The southernmost latitude in radians in the range [-Pi/2, Pi/2].
     *
     * @type {Number}
     * @default 0.0
     */
    this.south = defaultValue(south, 0.0);

    /**
     * The easternmost longitude in radians in the range [-Pi, Pi].
     *
     * @type {Number}
     * @default 0.0
     */
    this.east = defaultValue(east, 0.0);

    /**
     * The northernmost latitude in radians in the range [-Pi/2, Pi/2].
     *
     * @type {Number}
     * @default 0.0
     */
    this.north = defaultValue(north, 0.0);
};

var fromCartographicArray = function(cartographics, result) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(cartographics)) {
        throw new DeveloperError('cartographics is required.');
    }
    //>>includeEnd('debug');

    var minLon = Number.MAX_VALUE;
    var maxLon = -Number.MAX_VALUE;
    var minLat = Number.MAX_VALUE;
    var maxLat = -Number.MAX_VALUE;

    for (var i = 0, len = cartographics.length; i < len; i++) {
        var position = cartographics[i];
        minLon = Math.min(minLon, position.longitude);
        maxLon = Math.max(maxLon, position.longitude);
        minLat = Math.min(minLat, position.latitude);
        maxLat = Math.max(maxLat, position.latitude);
    }

    if (!defined(result)) {

        return new Extent(minLon, minLat, maxLon, maxLat);
    }

    result.west = minLon;
    result.south = minLat;
    result.east = maxLon;
    result.north = maxLat;
    return result;
};

var computeEllipseBoundary = function(ellipsoid, center, semiMajorAxis, semiMinorAxis, rotation, granularity) {
    rotation = defaultValue(rotation, 0.0);
    granularity = defaultValue(granularity, CesiumMath.RADIANS_PER_DEGREE);

    //>>includeStart('debug', pragmas.debug);
    if (!defined(ellipsoid) || !defined(center) || !defined(semiMajorAxis) || !defined(semiMinorAxis)) {
        throw new DeveloperError('ellipsoid, center, semiMajorAxis, and semiMinorAxis are required.');
    }
    if (semiMajorAxis <= 0.0 || semiMinorAxis <= 0.0) {
        throw new DeveloperError('Semi-major and semi-minor axes must be greater than zero.');
    }
    if (granularity <= 0.0) {
        throw new DeveloperError('granularity must be greater than zero.');
    }
    //>>includeEnd('debug');

    if (semiMajorAxis < semiMinorAxis) {
        var t = semiMajorAxis;
        semiMajorAxis = semiMinorAxis;
        semiMinorAxis = t;
    }

    var MAX_ANOMALY_LIMIT = 2.31;

    var aSqr = semiMajorAxis * semiMajorAxis;
    var bSqr = semiMinorAxis * semiMinorAxis;
    var ab = semiMajorAxis * semiMinorAxis;

    var value = 1.0 - (bSqr / aSqr);
    var ecc = Math.sqrt(value);

    var surfPos = Cartesian3.clone(center);
    var surfPosMag = Cartesian3.magnitude(surfPos);

    var tempVec = new Cartesian3(0.0, 0.0, 1);
    var temp = 1.0 / surfPosMag;

    var unitPos = Cartesian3.multiplyByScalar(surfPos, temp);
    var eastVec = Cartesian3.normalize(Cartesian3.cross(tempVec, surfPos));
    var northVec = Cartesian3.cross(unitPos, eastVec);

    var numQuadrantPts = 1 + Math.ceil(CesiumMath.PI_OVER_TWO / granularity);
    var deltaTheta = MAX_ANOMALY_LIMIT / (numQuadrantPts - 1);
    var thetaPts = [];
    var thetaPtsIndex = 0;

    var sampleTheta = 0.0;
    for (var i = 0; i < numQuadrantPts; i++, sampleTheta += deltaTheta, ++thetaPtsIndex) {
        thetaPts[thetaPtsIndex] = sampleTheta - ecc * Math.sin(sampleTheta);
        if (thetaPts[thetaPtsIndex] >= CesiumMath.PI_OVER_TWO) {
            thetaPts[thetaPtsIndex] = CesiumMath.PI_OVER_TWO;
            numQuadrantPts = i + 1;
            break;
        }
    }

    var ellipsePts = [];

    _computeEllipseQuadrant(ellipsoid, surfPosMag, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation,
        thetaPts, 0.0, 0.0, 1, ellipsePts, 0, numQuadrantPts - 1);

    _computeEllipseQuadrant(ellipsoid, surfPosMag, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation,
        thetaPts, numQuadrantPts - 1, Math.PI, -1, ellipsePts, numQuadrantPts - 1, numQuadrantPts - 1);

    _computeEllipseQuadrant(ellipsoid, surfPosMag, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation,
        thetaPts, 0.0, Math.PI, 1, ellipsePts, (2 * numQuadrantPts) - 2, numQuadrantPts - 1);

    _computeEllipseQuadrant(ellipsoid, surfPosMag, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation,
        thetaPts, numQuadrantPts - 1, CesiumMath.TWO_PI, -1, ellipsePts, (3 * numQuadrantPts) - 3, numQuadrantPts);

    ellipsePts.push(Cartesian3.clone(ellipsePts[0])); // Duplicates first and last point for polyline

    return ellipsePts;
};

var RectanglePrimitive = function(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);

    /**
     * The ellipsoid that the rectangle is drawn on.
     *
     * @type Ellipsoid
     *
     * @default Ellipsoid.WGS84
     */
    this.ellipsoid = defaultValue(options.ellipsoid, Ellipsoid.WGS84);
    this._ellipsoid = undefined;

    /**
     * The rectangle, which defines the rectangular region to draw.
     *
     * @type Rectangle
     *
     * @default undefined
     */
    this.rectangle = Rectangle.clone(options.rectangle);
    this._rectangle = undefined;

    /**
     * The distance, in radians, between each latitude and longitude in the underlying geometry.
     * A lower granularity fits the curvature of the {@link RectanglePrimitive#ellipsoid} better,
     * but uses more triangles.
     *
     * @type Number
     *
     * @default CesiumMath.RADIANS_PER_DEGREE
     */
    this.granularity = defaultValue(options.granularity, CesiumMath.RADIANS_PER_DEGREE);
    this._granularity = undefined;

    /**
     * The height, in meters, that the rectangle is raised above the {@link RectanglePrimitive#ellipsoid}.
     *
     * @type Number
     *
     * @default 0.0
     */
    this.height = defaultValue(options.height, 0.0);
    this._height = undefined;

    /**
     * The angle, in radians, relative to north that the rectangle is rotated.
     * Positive angles rotate counter-clockwise.
     *
     * @type Number
     *
     * @default 0.0
     */
    this.rotation = defaultValue(options.rotation, 0.0);
    this._rotation = undefined;

    /**
     * The angle, in radians, relative to north that the primitive's texture is rotated.
     * Positive angles rotate counter-clockwise.
     *
     * @type Number
     *
     * @default 0.0
     */
    this.textureRotationAngle = defaultValue(options.textureRotationAngle, 0.0);
    this._textureRotationAngle = undefined;

    /**
     * Determines if this primitive will be shown.
     *
     * @type Boolean
     *
     * @default true
     */
    this.show = defaultValue(options.show, true);

    var material = Material.fromType(Material.ColorType, {
        color: new Color(1.0, 1.0, 0.0, 0.5)
    });

    /**
     * The surface appearance of the primitive.  This can be one of several built-in {@link Material} objects or a custom material, scripted with
     * {@link https://github.com/AnalyticalGraphicsInc/cesium/wiki/Fabric|Fabric}.
     * <p>
     * The default material is <code>Material.ColorType</code>.
     * </p>
     *
     * @type Material
     *
     * @see {@link https://github.com/AnalyticalGraphicsInc/cesium/wiki/Fabric|Fabric}
     *
     * @example
     * // 1. Change the color of the default material to yellow
     * rectangle.material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 1.0);
     *
     * // 2. Change material to horizontal stripes
     * rectangle.material = Cesium.Material.fromType(Material.StripeType);
     */
    this.material = defaultValue(options.material, material);

    /**
     * User-defined object returned when the rectangle is picked.
     *
     * @type Object
     *
     * @default undefined
     *
     * @see Scene#pick
     */
    this.id = options.id;
    this._id = undefined;

    /**
     * Determines if the geometry instances will be created and batched on
     * a web worker.
     *
     * @type Boolean
     *
     * @default true
     */
    this.asynchronous = defaultValue(options.asynchronous, true);

    /**
     * This property is for debugging only; it is not for production use nor is it optimized.
     * <p>
     * Draws the bounding sphere for each draw command in the primitive.
     * </p>
     *
     * @type {Boolean}
     *
     * @default false
     */
    this.debugShowBoundingVolume = defaultValue(options.debugShowBoundingVolume, false);

    this._primitive = undefined;
};

RectanglePrimitive.prototype.update = function(context, frameState, commandList) {
    //>>includeStart('debug', pragmas.debug);
    if (!defined(this.ellipsoid)) {
        throw new DeveloperError('this.ellipsoid must be defined.');
    }
    if (!defined(this.material)) {
        throw new DeveloperError('this.material must be defined.');
    }
    if (this.granularity < 0.0) {
        throw new DeveloperError('this.granularity must be greater than zero.');
    }
    //>>includeEnd('debug');

    if (!this.show || (!defined(this.rectangle))) {
        return;
    }

    if (!Rectangle.equals(this._rectangle, this.rectangle) ||
        (this._ellipsoid !== this.ellipsoid) ||
        (this._granularity !== this.granularity) ||
        (this._height !== this.height) ||
        (this._rotation !== this.rotation) ||
        (this._textureRotationAngle !== this.textureRotationAngle) ||
        (this._id !== this.id)) {

        this._rectangle = Rectangle.clone(this.rectangle, this._rectangle);
        this._ellipsoid = this.ellipsoid;
        this._granularity = this.granularity;
        this._height = this.height;
        this._rotation = this.rotation;
        this._textureRotationAngle = this.textureRotationAngle;
        this._id = this.id;

        var instance = new GeometryInstance({
            geometry: new RectangleGeometry({
                rectangle: this.rectangle,
                vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity,
                height: this.height,
                rotation: this.rotation,
                stRotation: this.textureRotationAngle
            }),
            id: this.id,
            pickPrimitive: this
        });

        if (defined(this._primitive)) {
            this._primitive.destroy();
        }

        this._primitive = new Primitive({
            geometryInstances: instance,
            appearance: new EllipsoidSurfaceAppearance({
                aboveGround: (this.height > 0.0)
            }),
            asynchronous: this.asynchronous
        });
    }

    var primitive = this._primitive;
    primitive.appearance.material = this.material;
    primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
    primitive.update(context, frameState, commandList);
};

/**
 * Returns true if this object was destroyed; otherwise, false.
 * <br /><br />
 * If this object was destroyed, it should not be used; calling any function other than
 * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
 *
 * @returns {Boolean} <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
 *
 * @see Rectangle#destroy
 */
RectanglePrimitive.prototype.isDestroyed = function() {
    return false;
};

/**
 * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
 * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
 * <br /><br />
 * Once an object is destroyed, it should not be used; calling any function other than
 * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
 * assign the return value (<code>undefined</code>) to the object as done in the example.
 *
 * @returns {undefined}
 *
 * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
 *
 * @example
 * rectangle = rectangle && rectangle.destroy();
 *
 * @see Rectangle#isDestroyed
 */
RectanglePrimitive.prototype.destroy = function() {
    this._primitive = this._primitive && this._primitive.destroy();
    return destroyObject(this);
};

var _computeEllipseQuadrant = function(cb, cbRadius, aSqr, bSqr, ab, ecc, unitPos, eastVec, northVec, rotation, thetaPts, thetaPtsIndex, offset, clockDir, ellipsePts, ellipsePtsIndex, numPts) {
    var angle;
    var theta;
    var radius;
    var azimuth;
    var temp;
    var temp2;
    var rotAxis;
    var tempVec;

    for (var i = 0; i < numPts; i++, thetaPtsIndex += clockDir, ++ellipsePtsIndex) {
        theta = (clockDir > 0) ? (thetaPts[thetaPtsIndex] + offset) : (offset - thetaPts[thetaPtsIndex]);

        azimuth = theta + rotation;

        temp = -Math.cos(azimuth);

        rotAxis = Cartesian3.multiplyByScalar(eastVec, temp);

        temp = Math.sin(azimuth);
        tempVec = Cartesian3.multiplyByScalar(northVec, temp);

        rotAxis = Cartesian3.add(rotAxis, tempVec, rotAxis);

        temp = Math.cos(theta);
        temp = temp * temp;

        temp2 = Math.sin(theta);
        temp2 = temp2 * temp2;

        radius = ab / Math.sqrt(bSqr * temp + aSqr * temp2);
        angle = radius / cbRadius;

        // Create the quaternion to rotate the position vector to the boundary of the ellipse.
        temp = Math.sin(angle / 2.0);

        var unitQuat = Quaternion.normalize(new Quaternion(rotAxis.x * temp, rotAxis.y * temp, rotAxis.z * temp, Math.cos(angle / 2.0)));
        var rotMtx = Matrix3.fromQuaternion(unitQuat);

        var tmpEllipsePts = Matrix3.multiplyByVector(rotMtx, unitPos);
        var unitCart = Cartesian3.normalize(tmpEllipsePts);
        tmpEllipsePts = Cartesian3.multiplyByScalar(unitCart, cbRadius);
        ellipsePts[ellipsePtsIndex] = tmpEllipsePts;
    }
}

/* END ADDED */
var DrawHelper = (function() {

    // static variables
    var ellipsoid = Ellipsoid.WGS84;

    // constructor
    function _(cesiumWidget) {
        this._scene = cesiumWidget.scene;
        this._tooltip = createTooltip(cesiumWidget.container);
        this._surfaces = [];

        this.initialiseHandlers();

        this.enhancePrimitives();

    }

    _.prototype.initialiseHandlers = function() {
        var scene = this._scene;
        var _self = this;
        // scene events
        var handler = new ScreenSpaceEventHandler(scene.canvas);

        function callPrimitiveCallback(name, position) {
            if (_self._handlersMuted == true) return;
            var pickedObject = scene.pick(position);
            if (pickedObject && pickedObject.primitive && pickedObject.primitive[name]) {
                pickedObject.primitive[name](position);
            }
        }
        handler.setInputAction(
            function(movement) {
                callPrimitiveCallback('leftClick', movement.position);
            }, ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(
            function(movement) {
                callPrimitiveCallback('leftDoubleClick', movement.position);
            }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        var mouseOutObject;
        handler.setInputAction(
            function(movement) {
                if (_self._handlersMuted == true) return;
                var pickedObject = scene.pick(movement.endPosition);
                if (mouseOutObject && (!pickedObject || mouseOutObject != pickedObject.primitive)) {
                    !(mouseOutObject.isDestroyed && mouseOutObject.isDestroyed()) && mouseOutObject.mouseOut(movement.endPosition);
                    mouseOutObject = null;
                }
                if (pickedObject && pickedObject.primitive) {
                    pickedObject = pickedObject.primitive;
                    if (pickedObject.mouseOut) {
                        mouseOutObject = pickedObject;
                    }
                    if (pickedObject.mouseMove) {
                        pickedObject.mouseMove(movement.endPosition);
                    }
                }
            }, ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(
            function(movement) {
                callPrimitiveCallback('leftUp', movement.position);
            }, ScreenSpaceEventType.LEFT_UP);
        handler.setInputAction(
            function(movement) {
                callPrimitiveCallback('leftDown', movement.position);
            }, ScreenSpaceEventType.LEFT_DOWN);
    }

    _.prototype.setListener = function(primitive, type, callback) {
        primitive[type] = callback;
    }

    _.prototype.muteHandlers = function(muted) {
        this._handlersMuted = muted;
    }

    // register event handling for an editable shape
    // shape should implement setEditMode and setHighlighted
    _.prototype.registerEditableShape = function(surface) {
        var _self = this;

        // handlers for interactions
        // highlight polygon when mouse is entering
        setListener(surface, 'mouseMove', function(position) {
            surface.setHighlighted(true);
            if (!surface._editMode) {
                _self._tooltip.showAt(position, "Click to edit this shape");
            }
        });
        // hide the highlighting when mouse is leaving the polygon
        setListener(surface, 'mouseOut', function(position) {
            surface.setHighlighted(false);
            _self._tooltip.setVisible(false);
        });
        setListener(surface, 'leftClick', function(position) {
            surface.setEditMode(true);
        });
    }

    _.prototype.startDrawing = function(cleanUp) {
        // undo any current edit of shapes
        this.disableAllEditMode();
        // check for cleanUp first
        if (this.editCleanUp) {
            this.editCleanUp();
        }
        this.editCleanUp = cleanUp;
        this.muteHandlers(true);
    }

    _.prototype.stopDrawing = function() {
        // check for cleanUp first
        if (this.editCleanUp) {
            this.editCleanUp();
            this.editCleanUp = null;
        }
        this.muteHandlers(false);
    }

    // make sure only one shape is highlighted at a time
    _.prototype.disableAllHighlights = function() {
        this.setHighlighted(undefined);
    }

    _.prototype.setHighlighted = function(surface) {
        if (this._highlightedSurface && !this._highlightedSurface.isDestroyed() && this._highlightedSurface != surface) {
            this._highlightedSurface.setHighlighted(false);
        }
        this._highlightedSurface = surface;
    }

    _.prototype.disableAllEditMode = function() {
        this.setEdited(undefined);
    }

    _.prototype.setEdited = function(surface) {
        if (this._editedSurface && !this._editedSurface.isDestroyed()) {
            this._editedSurface.setEditMode(false);
        }
        this._editedSurface = surface;
    }

    var material = Material.fromType(Material.ColorType);
    material.uniforms.color = new Color(1.0, 1.0, 0.0, 0.5);

    var defaultShapeOptions = {
        ellipsoid: Ellipsoid.WGS84,
        textureRotationAngle: 0.0,
        height: 0.0,
        asynchronous: true,
        show: true,
        debugShowBoundingVolume: false
    }

    var defaultSurfaceOptions = copyOptions(defaultShapeOptions, {
        appearance: new EllipsoidSurfaceAppearance({
            aboveGround: false
        }),
        material: material,
        granularity: Math.PI / 180.0
    });

    var defaultPolygonOptions = copyOptions(defaultShapeOptions, {});
    var defaultExtentOptions = copyOptions(defaultShapeOptions, {});
    var defaultCircleOptions = copyOptions(defaultShapeOptions, {});
    var defaultEllipseOptions = copyOptions(defaultSurfaceOptions, { rotation: 0 });

    var defaultPolylineOptions = copyOptions(defaultShapeOptions, {
        width: 5,
        geodesic: true,
        granularity: 10000,
        appearance: new PolylineMaterialAppearance({
            aboveGround: false
        }),
        material: material
    });

    var ChangeablePrimitive = (function() {
        function _() {}

        _.prototype.initialiseOptions = function(options) {

            fillOptions(this, options);

            this._ellipsoid = undefined;
            this._granularity = undefined;
            this._height = undefined;
            this._textureRotationAngle = undefined;
            this._id = undefined;

            // set the flags to initiate a first drawing
            this._createPrimitive = true;
            this._primitive = undefined;
            this._outlinePolygon = undefined;

        }

        _.prototype.setAttribute = function(name, value) {
            this[name] = value;
            this._createPrimitive = true;
        };

        _.prototype.getAttribute = function(name) {
            return this[name];
        };

        /**
         * @private
         */
        _.prototype.update = function(context, frameState, commandList) {

            if (!defined(this.ellipsoid)) {
                throw new DeveloperError('this.ellipsoid must be defined.');
            }

            if (!defined(this.appearance)) {
                throw new DeveloperError('this.material must be defined.');
            }

            if (this.granularity < 0.0) {
                throw new DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
            }

            if (!this.show) {
                return;
            }

            if (!this._createPrimitive && (!defined(this._primitive))) {
                // No positions/hierarchy to draw
                return;
            }

            if (this._createPrimitive ||
                (this._ellipsoid !== this.ellipsoid) ||
                (this._granularity !== this.granularity) ||
                (this._height !== this.height) ||
                (this._textureRotationAngle !== this.textureRotationAngle) ||
                (this._id !== this.id)) {

                var geometry = this.getGeometry();
                if (!geometry) {
                    return;
                }

                this._createPrimitive = false;
                this._ellipsoid = this.ellipsoid;
                this._granularity = this.granularity;
                this._height = this.height;
                this._textureRotationAngle = this.textureRotationAngle;
                this._id = this.id;

                this._primitive = this._primitive && this._primitive.destroy();

                this._primitive = new Primitive({
                    geometryInstances: new GeometryInstance({
                        geometry: geometry,
                        id: this.id,
                        pickPrimitive: this
                    }),
                    appearance: this.appearance,
                    asynchronous: this.asynchronous
                });

                this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
                if (this.strokeColor && this.getOutlineGeometry) {
                    // create the highlighting frame
                    var _strokeWidth = this.strokeWidth || 1.0;
                    var _context_aliasedLineWidthRange = (context._aliasedLineWidthRange && context._aliasedLineWidthRange[1]) ? context._aliasedLineWidthRange[1] : _strokeWidth;
                    this._outlinePolygon = new Primitive({
                        geometryInstances: new GeometryInstance({
                            geometry: this.getOutlineGeometry(),
                            attributes: {
                                color: ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                            }
                        }),
                        appearance: new PerInstanceColorAppearance({
                            flat: true,
                            renderState: {
                                depthTest: {
                                    enabled: true
                                },
                                lineWidth: _strokeWidth //Math.min(_strokeWidth , _context_aliasedLineWidthRange )
                            }
                        })
                    });
                }
            }

            var primitive = this._primitive;
            primitive.appearance.material = this.material;
            primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
            primitive.update(context, frameState, commandList);
            this._outlinePolygon && this._outlinePolygon.update(context, frameState, commandList);

        };

        _.prototype.isDestroyed = function() {
            return false;
        };

        _.prototype.destroy = function() {
            this._primitive = this._primitive && this._primitive.destroy();
            return destroyObject(this);
        };

        _.prototype.setStrokeStyle = function(strokeColor, strokeWidth) {
            if (!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth != strokeWidth) {
                this._createPrimitive = true;
                this.strokeColor = strokeColor;
                this.strokeWidth = strokeWidth;
            }
        }

        return _;
    })();

    _.ExtentPrimitive = (function() {
        function _(options) {

            if (!defined(options.extent)) {
                throw new DeveloperError('Extent is required');
            }

            options = copyOptions(options, defaultSurfaceOptions);

            this.initialiseOptions(options);

            this.setExtent(options.extent);

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setExtent = function(extent) {
            this.setAttribute('extent', extent);
        };

        _.prototype.getExtent = function() {
            return this.getAttribute('extent');
        };

        _.prototype.getGeometry = function() {

            if (!defined(this.extent)) {
                return;
            }

            return new RectangleGeometry({
                rectangle: this.extent,
                height: this.height,
                vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function() {
            return new RectangleOutlineGeometry({
                rectangle: this.extent
            });
        }

        return _;
    })();

    _.PolygonPrimitive = (function() {

        function _(options) {

            options = copyOptions(options, defaultSurfaceOptions);

            this.initialiseOptions(options);

            this.isPolygon = true;

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setPositions = function(positions) {
            this.setAttribute('positions', positions);
        };

        _.prototype.getPositions = function() {
            return this.getAttribute('positions');
        };

        _.prototype.getGeometry = function() {

            if (!defined(this.positions) || this.positions.length < 3) {
                return;
            }

            return PolygonGeometry.fromPositions({
                positions: this.positions,
                height: this.height,
                vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function() {
            return PolygonOutlineGeometry.fromPositions({
                positions: this.getPositions()
            });
        }

        return _;
    })();

    _.CirclePrimitive = (function() {

        function _(options) {

            if (!(defined(options.center) && defined(options.radius))) {
                throw new DeveloperError('Center and radius are required');
            }

            options = copyOptions(options, defaultSurfaceOptions);

            this.initialiseOptions(options);

            this.setRadius(options.radius);

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setCenter = function(center) {
            this.setAttribute('center', center);
        };

        _.prototype.setRadius = function(radius) {
            this.setAttribute('radius', Math.max(0.1, radius));
        };

        _.prototype.getCenter = function() {
            return this.getAttribute('center');
        };

        _.prototype.getRadius = function() {
            return this.getAttribute('radius');
        };

        _.prototype.getGeometry = function() {

            if (!(defined(this.center) && defined(this.radius))) {
                return;
            }

            return new CircleGeometry({
                center: this.center,
                radius: this.radius,
                height: this.height,
                vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function() {
            return new CircleOutlineGeometry({
                center: this.getCenter(),
                radius: this.getRadius()
            });
        }

        return _;
    })();

    _.EllipsePrimitive = (function() {
        function _(options) {

            if (!(defined(options.center) && defined(options.semiMajorAxis) && defined(options.semiMinorAxis))) {
                throw new DeveloperError('Center and semi major and semi minor axis are required');
            }

            options = copyOptions(options, defaultEllipseOptions);

            this.initialiseOptions(options);

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setCenter = function(center) {
            this.setAttribute('center', center);
        };

        _.prototype.setSemiMajorAxis = function(semiMajorAxis) {
            if (semiMajorAxis < this.getSemiMinorAxis()) return;
            this.setAttribute('semiMajorAxis', semiMajorAxis);
        };

        _.prototype.setSemiMinorAxis = function(semiMinorAxis) {
            if (semiMinorAxis > this.getSemiMajorAxis()) return;
            this.setAttribute('semiMinorAxis', semiMinorAxis);
        };

        _.prototype.setRotation = function(rotation) {
            return this.setAttribute('rotation', rotation);
        };

        _.prototype.getCenter = function() {
            return this.getAttribute('center');
        };

        _.prototype.getSemiMajorAxis = function() {
            return this.getAttribute('semiMajorAxis');
        };

        _.prototype.getSemiMinorAxis = function() {
            return this.getAttribute('semiMinorAxis');
        };

        _.prototype.getRotation = function() {
            return this.getAttribute('rotation');
        };

        _.prototype.getGeometry = function() {

            if (!(defined(this.center) && defined(this.semiMajorAxis) && defined(this.semiMinorAxis))) {
                return;
            }

            return new EllipseGeometry({
                ellipsoid: this.ellipsoid,
                center: this.center,
                semiMajorAxis: this.semiMajorAxis,
                semiMinorAxis: this.semiMinorAxis,
                rotation: this.rotation,
                height: this.height,
                vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                stRotation: this.textureRotationAngle,
                ellipsoid: this.ellipsoid,
                granularity: this.granularity
            });
        };

        _.prototype.getOutlineGeometry = function() {
            return new EllipseOutlineGeometry({
                center: this.getCenter(),
                semiMajorAxis: this.getSemiMajorAxis(),
                semiMinorAxis: this.getSemiMinorAxis(),
                rotation: this.getRotation()
            });
        }

        return _;
    })();

    _.PolylinePrimitive = (function() {

        function _(options) {

            options = copyOptions(options, defaultPolylineOptions);

            this.initialiseOptions(options);

        }

        _.prototype = new ChangeablePrimitive();

        _.prototype.setPositions = function(positions) {
            this.setAttribute('positions', positions);
        };

        _.prototype.setWidth = function(width) {
            this.setAttribute('width', width);
        };

        _.prototype.setGeodesic = function(geodesic) {
            this.setAttribute('geodesic', geodesic);
        };

        _.prototype.getPositions = function() {
            return this.getAttribute('positions');
        };

        _.prototype.getWidth = function() {
            return this.getAttribute('width');
        };

        _.prototype.getGeodesic = function(geodesic) {
            return this.getAttribute('geodesic');
        };

        _.prototype.getGeometry = function() {

            if (!defined(this.positions) || this.positions.length < 2) {
                return;
            }

            return new PolylineGeometry({
                positions: this.positions,
                height: this.height,
                width: this.width < 1 ? 1 : this.width,
                vertexFormat: EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                ellipsoid: this.ellipsoid
            });
        }

        return _;
    })();

    var defaultBillboard = {
        iconUrl: "./img/dragIcon.png",
        shiftX: 0,
        shiftY: 0
    }

    var dragBillboard = {
        iconUrl: "./img/dragIcon.png",
        shiftX: 0,
        shiftY: 0
    }

    var dragHalfBillboard = {
        iconUrl: "./img/dragIconLight.png",
        shiftX: 0,
        shiftY: 0
    }

    _.prototype.createBillboardGroup = function(points, options, callbacks) {
        var markers = new _.BillboardGroup(this, options);
        markers.addBillboards(points, callbacks);
        return markers;
    }

    _.BillboardGroup = function(drawHelper, options) {

        this._drawHelper = drawHelper;
        this._scene = drawHelper._scene;

        this._options = copyOptions(options, defaultBillboard);

        // create one common billboard collection for all billboards
        var b = new BillboardCollection();
        this._scene.primitives.add(b);
        this._billboards = b;
        // keep an ordered list of billboards
        this._orderedBillboards = [];
    }

    _.BillboardGroup.prototype.createBillboard = function(position, callbacks) {

        var billboard = this._billboards.add({
            show: true,
            position: position,
            pixelOffset: new Cartesian2(this._options.shiftX, this._options.shiftY),
            eyeOffset: new Cartesian3(0.0, 0.0, 0.0),
            horizontalOrigin: HorizontalOrigin.CENTER,
            verticalOrigin: VerticalOrigin.CENTER,
            scale: 1.0,
            image: this._options.iconUrl,
            color: new Color(1.0, 1.0, 1.0, 1.0)
        });

        // if editable
        if (callbacks) {
            var _self = this;
            var screenSpaceCameraController = this._scene.screenSpaceCameraController;

            function enableRotation(enable) {
                screenSpaceCameraController.enableRotate = enable;
            }

            function getIndex() {
                // find index
                for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                return i;
            }
            if (callbacks.dragHandlers) {
                var _self = this;
                setListener(billboard, 'leftDown', function(position) {
                    // TODO - start the drag handlers here
                    // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                    function onDrag(position) {
                        billboard.position = position;
                        // find index
                        for (var i = 0, I = _self._orderedBillboards.length; i < I && _self._orderedBillboards[i] != billboard; ++i);
                        callbacks.dragHandlers.onDrag && callbacks.dragHandlers.onDrag(getIndex(), position);
                    }

                    function onDragEnd(position) {
                        handler.destroy();
                        enableRotation(true);
                        callbacks.dragHandlers.onDragEnd && callbacks.dragHandlers.onDragEnd(getIndex(), position);
                    }

                    var handler = new ScreenSpaceEventHandler(_self._scene.canvas);

                    handler.setInputAction(function(movement) {
                        var cartesian = _self._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian) {
                            onDrag(cartesian);
                        } else {
                            onDragEnd(cartesian);
                        }
                    }, ScreenSpaceEventType.MOUSE_MOVE);

                    handler.setInputAction(function(movement) {
                        onDragEnd(_self._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }, ScreenSpaceEventType.LEFT_UP);

                    enableRotation(false);

                    callbacks.dragHandlers.onDragStart && callbacks.dragHandlers.onDragStart(getIndex(), _self._scene.camera.pickEllipsoid(position, ellipsoid));
                });
            }
            if (callbacks.onDoubleClick) {
                setListener(billboard, 'leftDoubleClick', function(position) {
                    callbacks.onDoubleClick(getIndex());
                });
            }
            if (callbacks.onClick) {
                setListener(billboard, 'leftClick', function(position) {
                    callbacks.onClick(getIndex());
                });
            }
            if (callbacks.tooltip) {
                setListener(billboard, 'mouseMove', function(position) {
                    _self._drawHelper._tooltip.showAt(position, callbacks.tooltip());
                });
                setListener(billboard, 'mouseOut', function(position) {
                    _self._drawHelper._tooltip.setVisible(false);
                });
            }
        }

        return billboard;
    }

    _.BillboardGroup.prototype.insertBillboard = function(index, position, callbacks) {
        this._orderedBillboards.splice(index, 0, this.createBillboard(position, callbacks));
    }

    _.BillboardGroup.prototype.addBillboard = function(position, callbacks) {
        this._orderedBillboards.push(this.createBillboard(position, callbacks));
    }

    _.BillboardGroup.prototype.addBillboards = function(positions, callbacks) {
        var index = 0;
        for (; index < positions.length; index++) {
            this.addBillboard(positions[index], callbacks);
        }
    }

    _.BillboardGroup.prototype.updateBillboardsPositions = function(positions) {
        var index = 0;
        for (; index < positions.length; index++) {
            this.getBillboard(index).position = positions[index];
        }
    }

    _.BillboardGroup.prototype.countBillboards = function() {
        return this._orderedBillboards.length;
    }

    _.BillboardGroup.prototype.getBillboard = function(index) {
        return this._orderedBillboards[index];
    }

    _.BillboardGroup.prototype.removeBillboard = function(index) {
        this._billboards.remove(this.getBillboard(index));
        this._orderedBillboards.splice(index, 1);
    }

    _.BillboardGroup.prototype.remove = function() {
        this._billboards = this._billboards && this._billboards.removeAll() && this._billboards.destroy();
    }

    _.BillboardGroup.prototype.setOnTop = function() {
        this._scene.primitives.raiseToTop(this._billboards);
    }

    _.prototype.startDrawingMarker = function(options) {

        var options = copyOptions(options, defaultBillboard);

        this.startDrawing(
            function() {
                markers.remove();
                mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;

        var markers = new _.BillboardGroup(this, options);

        var mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

        // Now wait for start
        mouseHandler.setInputAction(function(movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    markers.addBillboard(cartesian);
                    _self.stopDrawing();
                    options.callback(cartesian);
                }
            }
        }, ScreenSpaceEventType.LEFT_CLICK);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.endPosition;
            if (position != null) {
                var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                if (cartesian) {
                    tooltip.showAt(position, "<p>Click to add your marker. Position is: </p>" + getDisplayLatLngString(ellipsoid.cartesianToCartographic(cartesian)));
                } else {
                    tooltip.showAt(position, "<p>Click on the globe to add your marker.</p>");
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);

    }

    _.prototype.startDrawingPolygon = function(options) {
        var options = copyOptions(options, defaultSurfaceOptions);
        this.startDrawingPolyshape(true, options);
    }

    _.prototype.startDrawingPolyline = function(options) {
        var options = copyOptions(options, defaultPolylineOptions);
        this.startDrawingPolyshape(false, options);
    }

    _.prototype.startDrawingPolyshape = function(isPolygon, options) {

        this.startDrawing(
            function() {
                primitives.remove(poly);
                markers.remove();
                mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = scene.primitives;
        var tooltip = this._tooltip;

        var minPoints = isPolygon ? 3 : 2;
        var poly;
        if (isPolygon) {
            poly = new DrawHelper.PolygonPrimitive(options);
        } else {
            poly = new DrawHelper.PolylinePrimitive(options);
        }
        poly.asynchronous = false;
        primitives.add(poly);

        var positions = [];
        var markers = new _.BillboardGroup(this, defaultBillboard);

        var mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

        // Now wait for start
        mouseHandler.setInputAction(function(movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    // first click
                    if (positions.length == 0) {
                        positions.push(cartesian.clone());
                        markers.addBillboard(positions[0]);
                    }
                    if (positions.length >= minPoints) {
                        poly.positions = positions;
                        poly._createPrimitive = true;
                    }
                    // add new point to polygon
                    // this one will move with the mouse
                    positions.push(cartesian);
                    // add marker at the new position
                    markers.addBillboard(cartesian);
                }
            }
        }, ScreenSpaceEventType.LEFT_CLICK);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (positions.length == 0) {
                    tooltip.showAt(position, "<p>Click to add first point</p>");
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        positions.pop();
                        // make sure it is slightly different
                        cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        // update marker
                        markers.getBillboard(positions.length - 1).position = cartesian;
                        // show tooltip
                        tooltip.showAt(position, "<p>Click to add new point (" + positions.length + ")</p>" + (positions.length > minPoints ? "<p>Double click to finish drawing</p>" : ""));
                    }
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.position;
            if (position != null) {
                if (positions.length < minPoints + 2) {
                    return;
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        _self.stopDrawing();
                        if (typeof options.callback == 'function') {
                            // remove overlapping ones
                            var index = positions.length - 1;
                            options.callback(positions);
                        }
                    }
                }
            }
        }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    }

    function getExtentCorners(value) {
        return ellipsoid.cartographicArrayToCartesianArray([Rectangle.northwest(value), Rectangle.northeast(value), Rectangle.southeast(value), Rectangle.southwest(value)]);
    }

    _.prototype.startDrawingExtent = function(options) {

        var options = copyOptions(options, defaultSurfaceOptions);

        this.startDrawing(
            function() {
                if (extent != null) {
                    primitives.remove(extent);
                }
                markers.remove();
                mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var tooltip = this._tooltip;

        var firstPoint = null;
        var extent = null;
        var markers = null;

        var mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

        function updateExtent(value) {
            if (extent == null) {
                extent = new RectanglePrimitive();
                extent.asynchronous = false;
                primitives.add(extent);
            }
            extent.rectangle = value;
            // update the markers
            var corners = getExtentCorners(value);
            // create if they do not yet exist
            if (markers == null) {
                markers = new _.BillboardGroup(_self, defaultBillboard);
                markers.addBillboards(corners);
            } else {
                markers.updateBillboardsPositions(corners);
            }
        }

        // Now wait for start
        mouseHandler.setInputAction(function(movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    if (extent == null) {
                        // create the rectangle
                        firstPoint = ellipsoid.cartesianToCartographic(cartesian);
                        var value = getExtent(firstPoint, firstPoint);
                        updateExtent(value);
                    } else {
                        _self.stopDrawing();
                        if (typeof options.callback == 'function') {
                            options.callback(getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian)));
                        }
                    }
                }
            }
        }, ScreenSpaceEventType.LEFT_DOWN);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (extent == null) {
                    tooltip.showAt(position, "<p>Click to start drawing rectangle</p>");
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        var value = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
                        updateExtent(value);
                        tooltip.showAt(position, "<p>Drag to change rectangle extent</p><p>Click again to finish drawing</p>");
                    }
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);

    }

    _.prototype.startDrawingCircle = function(options) {

        var options = copyOptions(options, defaultSurfaceOptions);

        this.startDrawing(
            function cleanUp() {
                if (circle != null) {
                    primitives.remove(circle);
                }
                markers.remove();
                mouseHandler.destroy();
                tooltip.setVisible(false);
            }
        );

        var _self = this;
        var scene = this._scene;
        var primitives = this._scene.primitives;
        var tooltip = this._tooltip;

        var circle = null;
        var markers = null;

        var mouseHandler = new ScreenSpaceEventHandler(scene.canvas);

        // Now wait for start
        mouseHandler.setInputAction(function(movement) {
            if (movement.position != null) {
                var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                if (cartesian) {
                    if (circle == null) {
                        // create the circle
                        circle = new _.CirclePrimitive({
                            center: cartesian,
                            radius: 0,
                            asynchronous: false,
                            material: options.material
                        });
                        primitives.add(circle);
                        markers = new _.BillboardGroup(_self, defaultBillboard);
                        markers.addBillboards([cartesian]);
                    } else {
                        if (typeof options.callback == 'function') {
                            options.callback(circle.getCenter(), circle.getRadius());
                        }
                        _self.stopDrawing();
                    }
                }
            }
        }, ScreenSpaceEventType.LEFT_DOWN);

        mouseHandler.setInputAction(function(movement) {
            var position = movement.endPosition;
            if (position != null) {
                if (circle == null) {
                    tooltip.showAt(position, "<p>Click to start drawing the circle</p>");
                } else {
                    var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                    if (cartesian) {
                        circle.setRadius(Cartesian3.distance(circle.getCenter(), cartesian));
                        markers.updateBillboardsPositions(cartesian);
                        tooltip.showAt(position, "<p>Move mouse to change circle radius</p><p>Click again to finish drawing</p>");
                    }
                }
            }
        }, ScreenSpaceEventType.MOUSE_MOVE);

    }

    _.prototype.enhancePrimitives = function() {

        var drawHelper = this;

        Billboard.prototype.setEditable = function() {

            if (this._editable) {
                return;
            }

            this._editable = true;

            var billboard = this;

            var _self = this;

            function enableRotation(enable) {
                drawHelper._scene.screenSpaceCameraController.enableRotate = enable;
            }

            setListener(billboard, 'leftDown', function(position) {
                // TODO - start the drag handlers here
                // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                function onDrag(position) {
                    billboard.position = position;
                    _self.executeListeners({ name: 'drag', positions: position });
                }

                function onDragEnd(position) {
                    handler.destroy();
                    enableRotation(true);
                    _self.executeListeners({ name: 'dragEnd', positions: position });
                }

                var handler = new ScreenSpaceEventHandler(drawHelper._scene.canvas);

                handler.setInputAction(function(movement) {
                    var cartesian = drawHelper._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                    if (cartesian) {
                        onDrag(cartesian);
                    } else {
                        onDragEnd(cartesian);
                    }
                }, ScreenSpaceEventType.MOUSE_MOVE);

                handler.setInputAction(function(movement) {
                    onDragEnd(drawHelper._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                }, ScreenSpaceEventType.LEFT_UP);

                enableRotation(false);

            });

            enhanceWithListeners(billboard);

        }

        function setHighlighted(highlighted) {

            var scene = drawHelper._scene;

            // if no change
            // if already highlighted, the outline polygon will be available
            if (this._highlighted && this._highlighted == highlighted) {
                return;
            }
            // disable if already in edit mode
            if (this._editMode === true) {
                return;
            }
            this._highlighted = highlighted;
            // highlight by creating an outline polygon matching the polygon points
            if (highlighted) {
                // make sure all other shapes are not highlighted
                drawHelper.setHighlighted(this);
                this._strokeColor = this.strokeColor;
                this.setStrokeStyle(Color.fromCssColorString('white'), this.strokeWidth);
            } else {
                if (this._strokeColor) {
                    this.setStrokeStyle(this._strokeColor, this.strokeWidth);
                } else {
                    this.setStrokeStyle(undefined, undefined);
                }
            }
        }

        function setEditMode(editMode) {
            // if no change
            if (this._editMode == editMode) {
                return;
            }
            // make sure all other shapes are not in edit mode before starting the editing of this shape
            drawHelper.disableAllHighlights();
            // display markers
            if (editMode) {
                drawHelper.setEdited(this);
                var scene = drawHelper._scene;
                var _self = this;
                // create the markers and handlers for the editing
                if (this._markers == null) {
                    var markers = new _.BillboardGroup(drawHelper, dragBillboard);
                    var editMarkers = new _.BillboardGroup(drawHelper, dragHalfBillboard);
                    // function for updating the edit markers around a certain point
                    function updateHalfMarkers(index, positions) {
                        // update the half markers before and after the index
                        var editIndex = index - 1 < 0 ? positions.length - 1 : index - 1;
                        if (editIndex < editMarkers.countBillboards()) {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                        editIndex = index;
                        if (editIndex < editMarkers.countBillboards()) {
                            editMarkers.getBillboard(editIndex).position = calculateHalfMarkerPosition(editIndex);
                        }
                    }

                    function onEdited() {
                        _self.executeListeners({ name: 'onEdited', positions: _self.positions });
                    }
                    var handleMarkerChanges = {
                        dragHandlers: {
                            onDrag: function(index, position) {
                                _self.positions[index] = position;
                                updateHalfMarkers(index, _self.positions);
                                _self._createPrimitive = true;
                            },
                            onDragEnd: function(index, position) {
                                _self._createPrimitive = true;
                                onEdited();
                            }
                        },
                        onDoubleClick: function(index) {
                            if (_self.positions.length < 4) {
                                return;
                            }
                            // remove the point and the corresponding markers
                            _self.positions.splice(index, 1);
                            _self._createPrimitive = true;
                            markers.removeBillboard(index);
                            editMarkers.removeBillboard(index);
                            updateHalfMarkers(index, _self.positions);
                            onEdited();
                        },
                        tooltip: function() {
                            if (_self.positions.length > 3) {
                                return "Double click to remove this point";
                            }
                        }
                    };
                    // add billboards and keep an ordered list of them for the polygon edges
                    markers.addBillboards(_self.positions, handleMarkerChanges);
                    this._markers = markers;

                    function calculateHalfMarkerPosition(index) {
                        var positions = _self.positions;
                        return ellipsoid.cartographicToCartesian(
                            new EllipsoidGeodesic(ellipsoid.cartesianToCartographic(positions[index]),
                                ellipsoid.cartesianToCartographic(positions[index < positions.length - 1 ? index + 1 : 0])).interpolateUsingFraction(0.5)
                        );
                    }
                    var halfPositions = [];
                    var index = 0;
                    var length = _self.positions.length + (this.isPolygon ? 0 : -1);
                    for (; index < length; index++) {
                        halfPositions.push(calculateHalfMarkerPosition(index));
                    }
                    var handleEditMarkerChanges = {
                        dragHandlers: {
                            onDragStart: function(index, position) {
                                // add a new position to the polygon but not a new marker yet
                                this.index = index + 1;
                                _self.positions.splice(this.index, 0, position);
                                _self._createPrimitive = true;
                            },
                            onDrag: function(index, position) {
                                _self.positions[this.index] = position;
                                _self._createPrimitive = true;
                            },
                            onDragEnd: function(index, position) {
                                // create new sets of makers for editing
                                markers.insertBillboard(this.index, position, handleMarkerChanges);
                                editMarkers.getBillboard(this.index - 1).position = calculateHalfMarkerPosition(this.index - 1);
                                editMarkers.insertBillboard(this.index, calculateHalfMarkerPosition(this.index), handleEditMarkerChanges);
                                _self._createPrimitive = true;
                                onEdited();
                            }
                        },
                        tooltip: function() {
                            return "Drag to create a new point";
                        }
                    };
                    editMarkers.addBillboards(halfPositions, handleEditMarkerChanges);
                    this._editMarkers = editMarkers;
                    // add a handler for clicking in the globe
                    this._globeClickhandler = new ScreenSpaceEventHandler(scene.canvas);
                    this._globeClickhandler.setInputAction(
                        function(movement) {
                            var pickedObject = scene.pick(movement.position);
                            if (!(pickedObject && pickedObject.primitive)) {
                                _self.setEditMode(false);
                            }
                        }, ScreenSpaceEventType.LEFT_CLICK);

                    // set on top of the polygon
                    markers.setOnTop();
                    editMarkers.setOnTop();
                }
                this._editMode = true;
            } else {
                if (this._markers != null) {
                    this._markers.remove();
                    this._editMarkers.remove();
                    this._markers = null;
                    this._editMarkers = null;
                    this._globeClickhandler.destroy();
                }
                this._editMode = false;
            }

        }

        DrawHelper.PolylinePrimitive.prototype.setEditable = function() {

            if (this.setEditMode) {
                return;
            }

            var polyline = this;
            polyline.isPolygon = false;
            polyline.asynchronous = false;

            drawHelper.registerEditableShape(polyline);

            polyline.setEditMode = setEditMode;

            var originalWidth = this.width;

            polyline.setHighlighted = function(highlighted) {
                // disable if already in edit mode
                if (this._editMode === true) {
                    return;
                }
                if (highlighted) {
                    drawHelper.setHighlighted(this);
                    this.setWidth(originalWidth * 2);
                } else {
                    this.setWidth(originalWidth);
                }
            }

            polyline.getExtent = function() {
                return fromCartographicArray(ellipsoid.cartesianArrayToCartographicArray(this.positions));
            }

            enhanceWithListeners(polyline);

            polyline.setEditMode(false);

        }

        DrawHelper.PolygonPrimitive.prototype.setEditable = function() {

            var polygon = this;
            polygon.asynchronous = false;

            var scene = drawHelper._scene;

            drawHelper.registerEditableShape(polygon);

            polygon.setEditMode = setEditMode;

            polygon.setHighlighted = setHighlighted;

            enhanceWithListeners(polygon);

            polygon.setEditMode(false);

        }

        DrawHelper.ExtentPrimitive.prototype.setEditable = function() {

            if (this.setEditMode) {
                return;
            }

            var extent = this;
            var scene = drawHelper._scene;

            drawHelper.registerEditableShape(extent);
            extent.asynchronous = false;

            extent.setEditMode = function(editMode) {
                // if no change
                if (this._editMode == editMode) {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode) {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    // create the markers and handlers for the editing
                    if (this._markers == null) {
                        var markers = new _.BillboardGroup(drawHelper, dragBillboard);

                        function onEdited() {
                            extent.executeListeners({ name: 'onEdited', extent: extent.extent });
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function(index, position) {
                                    var corner = markers.getBillboard((index + 2) % 4).position;
                                    extent.setExtent(getExtent(ellipsoid.cartesianToCartographic(corner), ellipsoid.cartesianToCartographic(position)));
                                    markers.updateBillboardsPositions(getExtentCorners(extent.extent));
                                },
                                onDragEnd: function(index, position) {
                                    onEdited();
                                }
                            },
                            tooltip: function() {
                                return "Drag to change the corners of this extent";
                            }
                        };
                        markers.addBillboards(getExtentCorners(extent.extent), handleMarkerChanges);
                        this._markers = markers;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(
                            function(movement) {
                                var pickedObject = scene.pick(movement.position);
                                // disable edit if pickedobject is different or not an object
                                if (!(pickedObject && !pickedObject.isDestroyed() && pickedObject.primitive)) {
                                    extent.setEditMode(false);
                                }
                            }, ScreenSpaceEventType.LEFT_CLICK);

                        // set on top of the polygon
                        markers.setOnTop();
                    }
                    this._editMode = true;
                } else {
                    if (this._markers != null) {
                        this._markers.remove();
                        this._markers = null;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            }

            extent.setHighlighted = setHighlighted;

            enhanceWithListeners(extent);

            extent.setEditMode(false);

        }

        _.EllipsePrimitive.prototype.setEditable = function() {

            if (this.setEditMode) {
                return;
            }

            var ellipse = this;
            var scene = drawHelper._scene;

            ellipse.asynchronous = false;

            drawHelper.registerEditableShape(ellipse);

            ellipse.setEditMode = function(editMode) {
                // if no change
                if (this._editMode == editMode) {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode) {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    var _self = this;
                    // create the markers and handlers for the editing
                    if (this._markers == null) {
                        var markers = new _.BillboardGroup(drawHelper, dragBillboard);

                        function getMarkerPositions() {
                            return computeEllipseBoundary(ellipsoid, ellipse.getCenter(), ellipse.getSemiMajorAxis(), ellipse.getSemiMinorAxis(), ellipse.getRotation() + Math.PI / 2, Math.PI / 2.0).splice(0, 4);
                        }

                        function onEdited() {
                            ellipse.executeListeners({ name: 'onEdited', center: ellipse.getCenter(), semiMajorAxis: ellipse.getSemiMajorAxis(), semiMinorAxis: ellipse.getSemiMinorAxis(), rotation: 0 });
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function(index, position) {
                                    var distance = Cartesian3.distance(ellipse.getCenter(), position);
                                    if (index % 2 == 0) {
                                        ellipse.setSemiMajorAxis(distance);
                                    } else {
                                        ellipse.setSemiMinorAxis(distance);
                                    }
                                    markers.updateBillboardsPositions(getMarkerPositions());
                                },
                                onDragEnd: function(index, position) {
                                    onEdited();
                                }
                            },
                            tooltip: function() {
                                return "Drag to change the excentricity and radius";
                            }
                        };
                        markers.addBillboards(getMarkerPositions(), handleMarkerChanges);
                        this._markers = markers;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(
                            function(movement) {
                                var pickedObject = scene.pick(movement.position);
                                if (!(pickedObject && pickedObject.primitive)) {
                                    _self.setEditMode(false);
                                }
                            }, ScreenSpaceEventType.LEFT_CLICK);

                        // set on top of the polygon
                        markers.setOnTop();
                    }
                    this._editMode = true;
                } else {
                    if (this._markers != null) {
                        this._markers.remove();
                        this._markers = null;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            }

            ellipse.setHighlighted = setHighlighted;

            enhanceWithListeners(ellipse);

            ellipse.setEditMode(false);
        }

        _.CirclePrimitive.prototype.getCircleCartesianCoordinates = function(granularity) {
            var geometry = CircleOutlineGeometry.createGeometry(new CircleOutlineGeometry({ ellipsoid: ellipsoid, center: this.getCenter(), radius: this.getRadius(), granularity: granularity }));
            var count = 0,
                value, values = [];
            for (; count < geometry.attributes.position.values.length; count += 3) {
                value = geometry.attributes.position.values;
                values.push(new Cartesian3(value[count], value[count + 1], value[count + 2]));
            }
            return values;
        };

        _.CirclePrimitive.prototype.setEditable = function() {

            if (this.setEditMode) {
                return;
            }

            var circle = this;
            var scene = drawHelper._scene;

            circle.asynchronous = false;

            drawHelper.registerEditableShape(circle);

            circle.setEditMode = function(editMode) {
                // if no change
                if (this._editMode == editMode) {
                    return;
                }
                drawHelper.disableAllHighlights();
                // display markers
                if (editMode) {
                    // make sure all other shapes are not in edit mode before starting the editing of this shape
                    drawHelper.setEdited(this);
                    var _self = this;
                    // create the markers and handlers for the editing
                    if (this._markers == null) {
                        var markers = new _.BillboardGroup(drawHelper, dragBillboard);

                        function getMarkerPositions() {
                            return _self.getCircleCartesianCoordinates(Math.PI_OVER_TWO);
                        }

                        function onEdited() {
                            circle.executeListeners({ name: 'onEdited', center: circle.getCenter(), radius: circle.getRadius() });
                        }
                        var handleMarkerChanges = {
                            dragHandlers: {
                                onDrag: function(index, position) {
                                    circle.setRadius(Cartesian3.distance(circle.getCenter(), position));
                                    markers.updateBillboardsPositions(getMarkerPositions());
                                },
                                onDragEnd: function(index, position) {
                                    onEdited();
                                }
                            },
                            tooltip: function() {
                                return "Drag to change the radius";
                            }
                        };
                        markers.addBillboards(getMarkerPositions(), handleMarkerChanges);
                        this._markers = markers;
                        // add a handler for clicking in the globe
                        this._globeClickhandler = new ScreenSpaceEventHandler(scene.canvas);
                        this._globeClickhandler.setInputAction(
                            function(movement) {
                                var pickedObject = scene.pick(movement.position);
                                if (!(pickedObject && pickedObject.primitive)) {
                                    _self.setEditMode(false);
                                }
                            }, ScreenSpaceEventType.LEFT_CLICK);

                        // set on top of the polygon
                        markers.setOnTop();
                    }
                    this._editMode = true;
                } else {
                    if (this._markers != null) {
                        this._markers.remove();
                        this._markers = null;
                        this._globeClickhandler.destroy();
                    }
                    this._editMode = false;
                }
            }

            circle.setHighlighted = setHighlighted;

            enhanceWithListeners(circle);

            circle.setEditMode(false);
        }

    }

    _.DrawHelperWidget = (function() {

        // constructor
        function _(drawHelper, options) {

            // container must be specified
            if (!(defined(options.container))) {
                throw new DeveloperError('Container is required');
            }

            var drawOptions = {
                markerIcon: "./img/glyphicons_242_google_maps.png",
                polylineIcon: "./img/glyphicons_097_vector_path_line.png",
                polygonIcon: "./img/glyphicons_096_vector_path_polygon.png",
                circleIcon: "./img/glyphicons_095_vector_path_circle.png",
                extentIcon: "./img/glyphicons_094_vector_path_square.png",
                clearIcon: "./img/glyphicons_067_cleaning.png",
                polylineDrawingOptions: defaultPolylineOptions,
                polygonDrawingOptions: defaultPolygonOptions,
                extentDrawingOptions: defaultExtentOptions,
                circleDrawingOptions: defaultCircleOptions
            };

            fillOptions(options, drawOptions);

            var _self = this;

            var toolbar = document.createElement('DIV');
            toolbar.className = "toolbar";
            options.container.appendChild(toolbar);

            function addIcon(id, url, title, callback) {
                var div = document.createElement('DIV');
                div.className = 'button';
                div.title = title;
                toolbar.appendChild(div);
                div.onclick = callback;
                var span = document.createElement('SPAN');
                div.appendChild(span);
                var image = document.createElement('IMG');
                image.src = url;
                span.appendChild(image);
                return div;
            }

            var scene = drawHelper._scene;

            /*addIcon('marker', options.markerIcon, 'Click to start drawing a 2D marker', function () {
                drawHelper.startDrawingMarker({
                    callback: function (position) {
                        _self.executeListeners({ name: 'markerCreated', position: position });
                    }
                });
            })*/

            /*
            addIcon('polyline', options.polylineIcon, 'Click to start drawing a 2D polyline', function () {
                drawHelper.startDrawingPolyline({
                    callback: function (positions) {
                        _self.executeListeners({ name: 'polylineCreated', positions: positions });
                    }
                });
            })*/

            addIcon('polygon', options.polygonIcon, 'Click to start drawing a 2D polygon', function() {
                drawHelper.startDrawingPolygon({
                    callback: function(positions) {
                        _self.executeListeners({ name: 'polygonCreated', positions: positions });
                    }
                });
            })

            addIcon('extent', options.extentIcon, 'Click to start drawing an Extent', function() {
                drawHelper.startDrawingExtent({
                    callback: function(extent) {
                        _self.executeListeners({ name: 'extentCreated', extent: extent });
                    }
                });
            })

            addIcon('circle', options.circleIcon, 'Click to start drawing a Circle', function() {
                drawHelper.startDrawingCircle({
                    callback: function(center, radius) {
                        _self.executeListeners({ name: 'circleCreated', center: center, radius: radius });
                    }
                });
            })

            // add a clear button at the end
            // add a divider first
            /*var div = document.createElement('DIV');
            div.className = 'divider';
            toolbar.appendChild(div);
            addIcon('clear', options.clearIcon, 'Remove all primitives', function () {
                scene.primitives.removeAll();
            });*/

            enhanceWithListeners(this);

        }

        return _;

    })();

    _.prototype.addToolbar = function(container, options) {
        options = copyOptions(options, { container: container });
        return new _.DrawHelperWidget(this, options);
    }

    function getExtent(mn, mx) {
        var e = new Rectangle();

        // Re-order so west < east and south < north
        e.west = Math.min(mn.longitude, mx.longitude);
        e.east = Math.max(mn.longitude, mx.longitude);
        e.south = Math.min(mn.latitude, mx.latitude);
        e.north = Math.max(mn.latitude, mx.latitude);

        // Check for approx equal (shouldn't require abs due to re-order)
        var epsilon = Math.EPSILON7;

        if ((e.east - e.west) < epsilon) {
            e.east += epsilon * 2.0;
        }

        if ((e.north - e.south) < epsilon) {
            e.north += epsilon * 2.0;
        }

        return e;
    };

    function createTooltip(frameDiv) {

        var tooltip = function(frameDiv) {

            var div = document.createElement('DIV');
            div.className = "twipsy right";

            var arrow = document.createElement('DIV');
            arrow.className = "twipsy-arrow";
            div.appendChild(arrow);

            var title = document.createElement('DIV');
            title.className = "twipsy-inner";
            div.appendChild(title);

            this._div = div;
            this._title = title;

            // add to frame div and display coordinates
            frameDiv.appendChild(div);
        }

        tooltip.prototype.setVisible = function(visible) {
            this._div.style.display = visible ? 'block' : 'none';
        }

        tooltip.prototype.showAt = function(position, message) {
            if (position && message) {
                this.setVisible(true);
                this._title.innerHTML = message;
                this._div.style.left = position.x + 10 + "px";
                this._div.style.top = (position.y - this._div.clientHeight / 2) + "px";
            }
        }

        return new tooltip(frameDiv);
    }

    function getDisplayLatLngString(cartographic, precision) {
        return cartographic.longitude.toFixed(precision || 3) + ", " + cartographic.latitude.toFixed(precision || 3);
    }

    function clone(from, to) {
        if (from == null || typeof from != "object") return from;
        if (from.constructor != Object && from.constructor != Array) return from;
        if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
            from.constructor == String || from.constructor == Number || from.constructor == Boolean)
            return new from.constructor(from);

        to = to || new from.constructor();

        for (var name in from) {
            to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
        }

        return to;
    }

    function fillOptions(options, defaultOptions) {
        options = options || {};
        var option;
        for (option in defaultOptions) {
            if (options[option] === undefined) {
                options[option] = clone(defaultOptions[option]);
            }
        }
    }

    // shallow copy
    function copyOptions(options, defaultOptions) {
        var newOptions = clone(options),
            option;
        for (option in defaultOptions) {
            if (newOptions[option] === undefined) {
                newOptions[option] = clone(defaultOptions[option]);
            }
        }
        return newOptions;
    }

    function setListener(primitive, type, callback) {
        primitive[type] = callback;
    }

    function enhanceWithListeners(element) {

        element._listeners = {};

        element.addListener = function(name, callback) {
            this._listeners[name] = (this._listeners[name] || []);
            this._listeners[name].push(callback);
            return this._listeners[name].length;
        }

        element.executeListeners = function(event, defaultCallback) {
            if (this._listeners[event.name] && this._listeners[event.name].length > 0) {
                var index = 0;
                for (; index < this._listeners[event.name].length; index++) {
                    this._listeners[event.name][index](event);
                }
            } else {
                if (defaultCallback) {
                    defaultCallback(event);
                }
            }
        }

    }

    return _;
})();

/* ADDED */
// module.exports = {
//     DrawHelper: DrawHelper
// };
/* END ADDED */
export default DrawHelper