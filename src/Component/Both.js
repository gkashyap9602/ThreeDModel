import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { fabric } from "fabric";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import TshirtObj from "../../src/assets/Tshirt.obj";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const ThreeDemo = () => {

  const [currentView, setCurrentView] = useState("front");
  // const [newCamera, setCamera] = useState(null);
  const [model, setModel] = useState(null);
  const [scene, setScene] = useState(null);
  const [container, setContainer] = useState(null);
  const [newCamera, setCamera] = useState(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100));



  useEffect(() => {
    var canvas = new fabric.Canvas("canvas");
    canvas.backgroundColor = "#FFBE9F";
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = "red";
    canvas.isDrawingMode = true;

    var rectangle = new fabric.Rect({
      top: 100,
      left: 100,
      fill: "#FF6E27",
      width: 100,
      height: 100,
      transparentCorners: false,
      centeredScaling: true,
    });

    canvas.add(rectangle);

    var containerHeight = "512";
    var containerWidth = "512";
    var camera, renderer, container, scene, texture, material, geometry, cube;

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var onClickPosition = new THREE.Vector2();
    // var container; // Move the declaration here

    init();
    animate();

    function init() {
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.01,
        100
      );

      setCamera(camera);
      camera.position.set(0, 3, 3.5);
      // camera.position.z = 500;

      container = document.getElementById("renderer");
      setContainer(container)
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setClearColor(new THREE.Color(0xffffff));
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(containerWidth, containerHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      container.appendChild(renderer.domElement);

      // Add OrbitControls to the scene
      // var controls = new OrbitControls(camera, renderer.domElement);
      scene = new THREE.Scene();
      setScene(scene)
      // scene.background = new THREE.Color(0x000000);

      // Load T-shirt OBJ model
      var loader = new OBJLoader();
      loader.load(TshirtObj, function (object) {

        console.log(object, "objectcc");
        object.scale.set(0.03, 0.03, 0.03);
        object.position.set(0, 0, 0);
        // Replace the cube with the T-shirt model
        // scene.remove(cube);
        // cube = object;
        texture = new THREE.Texture(canvas.lowerCanvasEl);
        // texture = new THREE.CanvasTexture(canvas.lowerCanvasEl);
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        // setTexture(texture)
        material = new THREE.MeshBasicMaterial({ map: texture });
        // Apply the material to your loaded object
        // scene.add(object);

        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            // child.material.map = texture
            child.material = material;
            child.material.needsUpdate = true
          }
        });
        scene.add(object);

        setModel(object);
        // // Add OrbitControls to the scene
        // controls = new OrbitControls(camera, renderer.domElement);
        // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        // controls.dampingFactor = 0.25;
        // controls.screenSpacePanning = false;
        // controls.maxPolarAngle = Math.PI / 2;

      });
      // Set initial camera position and lookAt
      newCamera.position.set(0, 0, 500);
      newCamera.lookAt(new THREE.Vector3(0, 0, 0));
      // Texture and material
      // texture = new THREE.Texture(canvas.lowerCanvasEl);
      // texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      // material = new THREE.MeshBasicMaterial({ map: texture });

      // Cube model
      // geometry = new THREE.BoxGeometry(1, 1, 1);
      // cube = new THREE.Mesh(geometry, material);
      // cube.rotation.x = 0.5;
      // cube.rotation.y = 0.3;
      // scene.add(cube);
    }


    function animate() {
      requestAnimationFrame(animate);
      // controls.update();
      // cube.rotation.x += 0.0;
      // cube.rotation.y += 0.0;
      // texture.needsUpdate = true;

      renderer.render(scene, camera);
    }

    fabric.Canvas.prototype.getPointer = function (e, ignoreZoom) {
      if (this._absolutePointer && !ignoreZoom) {
        return this._absolutePointer;
      }
      if (this._pointer && ignoreZoom) {
        return this._pointer;
      }
      var pointer = fabric.util.getPointer(e),
        upperCanvasEl = this.upperCanvasEl,
        bounds = upperCanvasEl.getBoundingClientRect(),
        boundsWidth = bounds.width || 0,
        boundsHeight = bounds.height || 0,
        cssScale;

      if (!boundsWidth || !boundsHeight) {
        if ("top" in bounds && "bottom" in bounds) {
          boundsHeight = Math.abs(bounds.top - bounds.bottom);
        }
        if ("right" in bounds && "left" in bounds) {
          boundsWidth = Math.abs(bounds.right - bounds.left);
        }
      }
      this.calcOffset();
      pointer.x = pointer.x - this._offset.left;
      pointer.y = pointer.y - this._offset.top;
      if (e.target !== this.upperCanvasEl) {
        var positionOnScene = getPositionOnScene(container, e);
        pointer.x = positionOnScene.x;
        pointer.y = positionOnScene.y;
      }
      if (!ignoreZoom) {
        pointer = this.restorePointerVpt(pointer);
      }

      if (boundsWidth === 0 || boundsHeight === 0) {
        cssScale = { width: 1, height: 1 };
      } else {
        cssScale = {
          width: upperCanvasEl.width / boundsWidth,
          height: upperCanvasEl.height / boundsHeight,
        };
      }
      
      return {
        x: pointer.x * cssScale.width,
        y: pointer.y * cssScale.height,
      };
    };

    fabric.Object.prototype._drawControl = function (
      control,
      ctx,
      methodName,
      left,
      top,
      styleOverride
    ) {
      styleOverride = styleOverride || {};
      if (!this.isControlVisible(control)) {
        return;
      }
      var size = this.cornerSize,
        stroke = !this.transparentCorners && this.cornerStrokeColor;
      switch (styleOverride.cornerStyle || this.cornerStyle) {
        case "rect":
          if (control == this.__corner) {
            ctx.save();
            ctx.strokeStyle = ctx.fillStyle = "red";
          } else {
            ctx.strokeStyle = ctx.fillStyle = "black";
          }
          ctx.beginPath();
          ctx.arc(
            left + size / 2,
            top + size / 2,
            size / 2,
            0,
            2 * Math.PI,
            false
          );
          ctx[methodName]();
          if (stroke) {
            ctx.stroke();
          }
          if (control == this.__corner) {
            ctx.restore();
          }
          break;
        default:
          this.transparentCorners || ctx.clearRect(left, top, size, size);
          ctx[methodName + "Rect"](left, top, size, size);
          if (stroke) {
            ctx.strokeRect(left, top, size, size);
          }
      }
    };

    container.addEventListener("mousedown", onMouseEvt, false);
    // canvas.on("mouse:down", addCircle, false);

    function onMouseEvt(evt) {
      evt.preventDefault();
      canvas.isDrawingMode = true;
      const positionOnScene = getPositionOnScene(container, evt);
      if (positionOnScene) {
        const canvasRect = canvas._offset;
        const simEvt = new MouseEvent(evt.type, {
          clientX: canvasRect.left + positionOnScene.x,
          clientY: canvasRect.top + positionOnScene.y,
        });
        canvas.upperCanvasEl.dispatchEvent(simEvt);
        // Update texture when drawing on fabric.js canvas
        material.map.needsUpdate = true;
      }
    }

    // function addCircle(evt) {
    //   if (evt.target) {
    //     return;
    //   }
    //   var circle = new fabric.Circle({
    //     radius: 3,
    //     originX: "center",
    //     originY: "center",
    //     left: evt.pointer.x,
    //     top: evt.pointer.y,
    //     fill: "red",
    //   });
    //   canvas.add(circle);
    // }


    function getPositionOnScene(sceneContainer, evt) {
      var array = getMousePosition(container, evt.clientX, evt.clientY);
      onClickPosition.fromArray(array);
      var intersects = getIntersects(onClickPosition, scene.children);
      if (intersects.length > 0 && intersects[0].uv) {
        var uv = intersects[0].uv;
        intersects[0].object.material.map.transformUv(uv);
        return {
          x: getRealPosition("x", uv.x),
          y: getRealPosition("y", uv.y),
        };
      }
      return null;
    }

    function getRealPosition(axis, value) {
      let CORRECTION_VALUE = axis === "x" ? 4.5 : 5.5;

      return Math.round(value * 512) - CORRECTION_VALUE;
    }

    var getMousePosition = function (dom, x, y) {
      var rect = dom.getBoundingClientRect();
      return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
    };

    var getIntersects = function (point, objects) {
      mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
      raycaster.setFromCamera(mouse, camera);
      return raycaster.intersectObjects(objects);
    };
  }, []); // Empty dependency array for componentDidMount behavior

  
  const handleViewChange = (view) => {
    setCurrentView(view);

    if (model) {
      const scaleFactor = 1; // Adjust this scale factor as needed

      if (view === "front") {
        newCamera.position.set(0, 6.5 * scaleFactor, 6.5 * scaleFactor);
        newCamera.lookAt(model.position);
      } else if (view === "back") {
        newCamera.position.set(0, 6.5 * scaleFactor, -6.5 * scaleFactor);
        newCamera.lookAt(model.position);
      } else if (view === "right") {
        newCamera.position.set(5.8 * scaleFactor, 6 * scaleFactor, 0);
        newCamera.lookAt(model.position);
      } else if (view === "left") {
        newCamera.position.set(-5.8 * scaleFactor, 6 * scaleFactor, 0);
        newCamera.lookAt(model.position);
      }

      newCamera.aspect = container.clientWidth / container.clientHeight;
      newCamera.updateProjectionMatrix();
    }
  };

  useEffect(() => {
    if (scene) {
      const lights = [
        new THREE.PointLight(0xffffff, 1, 0),
        new THREE.PointLight(0xffffff, 1, 0),
        new THREE.PointLight(0xffffff, 1, 0)
      ];

      lights[0].position.set(0, 2000, 0);
      lights[1].position.set(1000, 2000, 1000);
      lights[2].position.set(-1000, -2000, -1000);

      lights.forEach(light => scene.add(light));
    }

    return () => {
      // Cleanup logic for lights (if needed)
    };
  }, [scene]);


  return (
    <div >
      <canvas id="canvas" width={300} height={300}></canvas>
      <div id="renderer" style={{ height: 512, width: 512 }}>

        {/* Add buttons for changing views */}
        <button onClick={() => handleViewChange("front")}>Front View</button>
        <button onClick={() => handleViewChange("back")}>Back View</button>
        <button onClick={() => handleViewChange("right")}>Right View</button>
        <button onClick={() => handleViewChange("left")}>Left View</button>
      </div>
    </div>
  );
};

export default ThreeDemo;
