import React, { useRef, useState, useEffect } from 'react';
import { Canvas, render } from 'react-three-fiber';
import * as THREE from 'three';
import { fabric } from 'fabric';
import style from "./main.css"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import TshirtObj from "../assets/Tshirt.obj"
import TshirtMtl from "../assets/Tshirt.mtl"

import Front from "../assets/partsNew/Front.png";
import Back from "../assets/partsNew/Back.png";
import LeftSleeve from "../assets/partsNew/Left-Sleeve.png";
import RightSleeve from "../assets/partsNew/Right-Sleeve.png";
import Collar from "../assets/partsNew/Collar.png";


const ThreeCanvas = () => {
    const rendererRef = useRef(null);
    const canvasRef = useRef(null);
    const [fabricCanvas, setFabricCanvas] = useState(null);
    const [scene, setScene] = useState(null);
    const [model, setModel] = useState(null);
    const [canvasMaterial, setCanvasMaterial] = useState(null);
    const [newRenderer, setNewRenderer] = useState(null);
    const [meshName, setMeshName] = useState({ meshName: "FrontAndBack", value: "Material477748" });
    const [selectedImage, setSelectedImage] = useState(Front);

    const onClickPosition = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const loader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    // let meshName = {
    //     "FrontAndBack": "Material477748",
    //     "ButtonArea": "Material477752",
    //     "Collar": "Material477756",
    //     "BothSleeve": "Material477760",
    //     "Buttons": "Material477768"

    // }

    const handleButtonClick = (meshName, value, bgImage) => {
        // Your logic to handle button click
        console.log(`Button clicked for ${meshName}`);

        setMeshName({ meshName, value })
        setSelectedImage(bgImage);


    };


    const handleMaterialUpdate = (object, meshName, materialCanvas) => {

      console.log(object,"objectttt======");
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (child.material && Array.isArray(child.material)) {
                    child.material.forEach((material, index) => {
                        if (material instanceof THREE.MeshPhongMaterial) {
                            if (material.name === meshName.value) {
                                console.log(meshName, "meshnameee");
                                console.log(material.name, "material.name");
                                child.material[index] = materialCanvas;
                            } else {
                                
                                // child.material[index].dispose();
                                // child.material[index] = new THREE.MeshBasicMaterial();
                                // material.color.setHex(0x000000);
                                // material.color.setHex("0xFFBE9F");
                            }
                        }
                        material.needsUpdate = true;
                    });
                }
            }
        });
    };


    useEffect(() => {
        if (model && meshName && canvasMaterial) {

            handleMaterialUpdate(model, meshName, canvasMaterial)
        }
    }, [meshName.meshName])

    useEffect(() => {
        // Initialize Three.js and fabric.js here
        
        if(fabricCanvas){
            // fabricCanvas.clear();
        }
        // Fabricjs
        const canvas = new fabric.Canvas(canvasRef.current);
        // fabricCanvas.backgroundColor = "#FFBE9F";
        canvas.backgroundColor = "black";

        var rectangle = new fabric.Rect({
            top: 100,
            left: 100,
            fill: '#FF6E27',
            width: 100,
            height: 100,
            transparentCorners: false,
            centeredScaling: true,
            borderColor: 'black',
            cornerColor: 'black',
            corcerStrokeColor: 'black'
        });

        canvas.add(rectangle);
        // fabric.Image.fromURL(selectedImage, (bgImg) => {

        //     // const mask = new fabric.Image(bgImg.getElement(), {
        //     //   scaleX: canvas.width / bgImg.width,
        //     //   scaleY: canvas.height / bgImg.height,
        //     //   left: 0,
        //     //   top: 0,
        //     //   selectable: false,
        //     //   evented: false,
        //     //   crossOrigin: "anonymous",

        //     // });

        //     // mask.globalCompositeOperation = "source-atop";
        //     fabricCanvas.clear();
        //     fabricCanvas.setBackgroundImage(bgImg, null, {
        //         scaleX: fabricCanvas.width / bgImg.width,
        //         scaleY: fabricCanvas.height / bgImg.height,
        //         // width:72,
        //         // height:73,
        //         left: 10,
        //         right: 10,
        //         crossOrigin: "anonymous",
        //     });

        //     var rectangle = new fabric.Rect({
        //         top: 100,
        //         left: 100,
        //         fill: '#FF6E27',
        //         width: 100,
        //         height: 100,
        //         transparentCorners: false,
        //         centeredScaling: true,
        //         borderColor: 'black',
        //         cornerColor: 'black',
        //         corcerStrokeColor: 'black'
        //     });

        //     fabricCanvas.add(rectangle);

        // });



        setFabricCanvas(canvas);

        // Threejs
        const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 100);
        camera.position.set(0, -35, 40);
        // camera.position.z = 800;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x808080);
        setScene(scene);


        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(512, 512);
        setNewRenderer(renderer)

        const controls = new OrbitControls(camera, renderer.domElement); // Initialize OrbitControls
        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;

        camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
        camera.updateProjectionMatrix();

        rendererRef.current.appendChild(renderer.domElement);
        let texture = new THREE.Texture(canvasRef.current);

        // let texture = new THREE.Texture(document.getElementById("canvas"));
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        const materialCanvas = new THREE.MeshBasicMaterial({ map: texture });
        setCanvasMaterial(materialCanvas)


        mtlLoader.load(TshirtMtl, (materials) => {

            console.log(materials, "materialsss");
            materials.preload()
            loader.setMaterials(materials)
            loader.load(
                TshirtObj,
                (object) => {
                    console.log(object, "objectss")

                    handleMaterialUpdate(object, meshName, materialCanvas);
                    // object.traverse((child) => {
                    //     console.log(child, "child");
                    //     console.log(child.name, "childname");

                    //     if (child instanceof THREE.Mesh) {
                    //         if (child.material && Array.isArray(child.material)) {
                    //             child.material.forEach((material, index) => {
                    //                 if (material instanceof THREE.MeshPhongMaterial) {
                    //                     // console.log(material, "material=========");
                    //                     if (material.name == meshName.value) {
                    //                         console.log("underiffff");
                    //                         child.material[index] = materialCanvas;
                    //                         material.needsUpdate = true
                    //                     } else {
                    //                         material.color.setHex(0x000000);
                    //                     }

                    //                 }
                    //                 material.needsUpdate = true
                    //             });
                    //         }
                    //     }
                    // });
                    // // if (model) {
                    // object.traverse((child) => {
                    //     if (child instanceof THREE.Mesh) {
                    //         child.material = material;
                    //     }
                    // });
                    // }

                    const boundingBox = new THREE.Box3().setFromObject(object);
                    const dimensions = boundingBox.getSize(new THREE.Vector3());

                    console.log(
                        "Dimensions of the 3D model:",
                        dimensions.x,
                        dimensions.y,
                        dimensions.z
                    );


                    const scaleFactor = 0.20;
                    object.scale.set(scaleFactor, scaleFactor, scaleFactor);

                    scene.add(object);
                    scene.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            let targetMesh = child;
                            // console.log(targetMesh, "targetmesh");
                            targetMesh.position.set(0, -150, 0);
                        }
                    });

                    setModel(object);

                },
                (xhr) => {
                    const loadingPercentage = Math.ceil((xhr.loaded / xhr.total) * 100);
                    // onProgress(loadingPercentage);
                },
                (error) => {
                    console.error("An error happened: obj load side", error);
                }
            );

        })


        const animate = () => {
            requestAnimationFrame(animate);
            controls.update(); // Update controls
            materialCanvas.map.needsUpdate = true;

            // Render scene with updated material
            // if (model) {

            //     handleMaterialUpdate(model, meshName, materialCanvas);
            // }

            renderer.render(scene, camera);
        };

        animate();

        // Clean up
        return () => {
            // Dispose of resources, remove event listeners, etc.
        };
    }, []); // Empty dependency array ensures that this effect runs once on mount

    useEffect(() => {
        if (scene) {
            const lights = [
                new THREE.PointLight(0xffffff, 2, -4),
                new THREE.PointLight(0xffffff, 2, -4),
                new THREE.PointLight(0xffffff, 3, -4),
            ];

            lights[0].position.set(0, 2000, 0);
            lights[1].position.set(1000, 2000, 1000);
            lights[2].position.set(-1000, -2000, -1000);

            lights.forEach((light) => scene.add(light));


            scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        }


        return () => {
            // Cleanup logic for lights (if needed)
        };
    }, [scene]);

    const onMouseClick = (evt) => {
        evt.preventDefault();

        if (!fabricCanvas || !scene) {
            console.error('Fabric canvas or Three.js scene not initialized.');
            return;
        }

        const array = getMousePosition(canvasRef.current, evt.clientX, evt.clientY);
        onClickPosition.fromArray(array);

        const intersects = getIntersects(onClickPosition, [scene.children[1]]);

        if (intersects.length > 0 && intersects[0].uv) {
            const uv = intersects[0].uv;
            intersects[0].object.material.map.transformUv(uv);

            const circle = new fabric.Circle({
                radius: 3,
                left: getRealPosition("x", uv.x),
                top: getRealPosition("y", uv.y),
                fill: 'red',
            });
            fabricCanvas.add(circle);
        }
    };

    const getRealPosition = (axis, value) => {
        const CORRECTION_VALUE = axis === "x" ? 4.5 : 5.5;
        return Math.round(value * 512) - CORRECTION_VALUE;
    };

    const getMousePosition = (dom, x, y) => {
        const rect = dom.getBoundingClientRect();
        return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
    };

    const getIntersects = (point, objects) => {
        mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
        raycaster.setFromCamera(mouse, scene.camera);
        return raycaster.intersectObjects(objects);
    };


    // let meshName = {
    //     "FrontAndBack": "Material477748",
    //     "ButtonArea": "Material477752",
    //     "Collar": "Material477756",
    //     "BothSleeve": "Material477760",
    //     "Buttons": "Material477768"

    // }

    console.log(meshName, "meshnameee");
    return (
        <>
            <div id="buttons">
                <button value="" onClick={() => handleButtonClick("FrontAndBack", "Material477748", Front)}>FrontAndBack</button>
                <button onClick={() => handleButtonClick("ButtonArea", "Material477752", Back)}>ButtonArea</button>
                <button onClick={() => handleButtonClick("Collar", "Material477756", Collar)}>Collar</button>
                <button onClick={() => handleButtonClick("BothSleeve", "Material477760", LeftSleeve)}>BothSleeve</button>
                <button onClick={() => handleButtonClick("Buttons", "Material477768", RightSleeve)}>Buttons</button>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
                <div id="c-right">
                    <h3> {meshName.meshName} Canvas</h3>
                    <canvas id="canvas" width="512" height="512" ref={canvasRef} onMouseDown={onMouseClick}></canvas>
                </div>
                <div id="c-left">
                    <h3>Renderer</h3>
                    <div id="renderer" ref={rendererRef}></div>
                </div>
                <div style={{ width: "5rem" }}></div>
            </div>
        </>
    );
};

export default ThreeCanvas;
