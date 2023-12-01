import React, { useEffect, useRef, useState } from "react";
import * as THREE from 'three';
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import TshirtObj from "../../src/assets/Tshirt.obj"
import TshirtMtl from "../../src/assets/Tshirt.mtl"
import textureImage from '../../src/assets/line.jpeg';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

const style = {
    height: 500
};

const ThreeDemo = ({ onProgress }) => {
    const mount = useRef(null);
    const [scene, setScene] = useState(null);
    const [camera, setCamera] = useState(null);
    const [controls, setControls] = useState(null);
    const [renderer, setRenderer] = useState(null);
    const [model, setModel] = useState(null);
    const [currentView, setCurrentView] = useState("front");
    const [texture, setTexture] = useState(null);
    const requestID = useRef(null);


    const handleTextureUpload = (event) => {
        // Dispose of the previous texture to avoid memory leaks
        // if (texture) {
        //     texture.dispose();
        // }
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const textureImage = e.target.result;
            const newTexture = new TextureLoader().load(textureImage);
            setTexture(newTexture);
        };

        //remove previous model if existed because texture dependency load new model after texture load
        // if (model) {
        //     scene.remove(model);
        // }


        if (file) {
            reader.readAsDataURL(file);
        }
    };
    useEffect(() => {
        const width = mount.current.clientWidth;
        const height = mount.current.clientHeight;

        const newScene = new THREE.Scene();
        const newCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        newCamera.position.z = 500;

        //create camera orbit contols 
        // const newControls = new OrbitControls(newCamera, mount.current);

        const newRenderer = new THREE.WebGLRenderer();
        newRenderer.setSize(width, height);
        newRenderer.setClearColor(new THREE.Color(0xffffff));
        mount.current.appendChild(newRenderer.domElement);

        setScene(newScene);
        setCamera(newCamera);
        // setControls(newControls); //orbit controls for camera view 
        setRenderer(newRenderer);

        return () => {
            // newControls.dispose();  //dispose camera controls
        };
    }, []);

    useEffect(() => {
        if (!scene) return;

        const loader = new OBJLoader();
        // const textureLoader = new TextureLoader();
        const mtlLoader = new MTLLoader();

        // material laod start here
        // mtlLoader.load(
        //     TshirtMtl,
        //     (materials) => {

        //         // console.log(materials, "materialass");
        //         materials.preload();
        //         loader.setMaterials(materials);
        loader.load(
            TshirtObj,
            (object) => {
                console.log(object, "objectss");
                const scaleFactor = 4.5;
                object.scale.set(scaleFactor, scaleFactor, scaleFactor);
                scene.add(object);

                // const colors = [
                //     0xff0000,
                //     0x0000ff,
                //     0x00ff00,
                //     0xffff00,
                //     0xffc0cb,
                // ];

                // // const texture = textureLoader.load(textureImage);
                // console.log(texture, "texture--");
                // let colorIndex = 0;

                // object.traverse((child) => {
                //     // console.log(child.name, "childnameee");
                //     if (child instanceof THREE.Mesh) {
                //         if (child.material && Array.isArray(child.material)) {
                //             child.material.forEach((material) => {
                //                 // console.log(material, "materiallS");
                //                 if (material instanceof THREE.MeshPhongMaterial) {
                //                     if (colorIndex === 0 && texture) {
                //                         console.log(texture, "under texx");
                //                         material.map = texture;
                //                         material.needsUpdate = true; // Ensure texture update
                //                     } else {
                //                         material.color.setHex(colors[colorIndex % colors.length]);
                //                     }
                //                     colorIndex++;
                //                 }
                //             });
                //         }
                //     }
                // });

                const el = scene.getObjectByName("tshirt");
                if (el) {
                    el.position.set(0, -150, 0);
                } else {
                    console.error('tshirt not found in the loaded model.');
                }

                setModel(object);
            },
            (xhr) => {
                const loadingPercentage = Math.ceil((xhr.loaded / xhr.total) * 100);
                onProgress(loadingPercentage);
            },
            (error) => {
                console.error('An error happened: obj load side', error);
            }
        );
        //     },
        //     (xhr) => {
        //         console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        //     },
        //     (error) => {
        //         console.log(error, "material load error");
        //     }
        // );
        //material load ends here

        return () => {
            // Cleanup logic for model (if needed)
        };
    }, [scene]);
    //load object when dynamic texture upload 


    //mesh or material  update function
    const updateObjectTexture = () => {
        console.log("updateTextureCall");

        const colors = [
            0xff0000,
            0x0000ff,
            0x00ff00,
            0xffff00,
            0xffc0cb,
        ];

        // const texture = textureLoader.load(textureImage);
        console.log(texture, "texture--");
        let colorIndex = 0;
        if (model) {
            model.traverse((child) => {
                // console.log(child.name, "childnameee");
                if (child instanceof THREE.Mesh) {
                    if (child.material && Array.isArray(child.material)) {
                        child.material.forEach((material) => {
                            // console.log(material, "materiallS");
                            if (material instanceof THREE.MeshPhongMaterial) {
                                if (colorIndex === 0 && texture) {
                                    console.log(texture, "under texx");
                                    material.map = texture;
                                    material.color.setHex(0xffffff); // Set material color to white
                                    material.transparent = true; // Enable transparency
                                    material.needsUpdate = true; // Ensure texture update
                                } else {
                                    material.color.setHex(colors[colorIndex % colors.length]);
                                }
                                colorIndex++;
                            }
                        });
                    }
                }
            });
        }


    };

    useEffect(() => {
        updateObjectTexture()
    }, [model, texture])

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

    useEffect(() => {
        const startAnimationLoop = () => {
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }

            requestID.current = window.requestAnimationFrame(startAnimationLoop);
        };

        startAnimationLoop();

        return () => {
            window.cancelAnimationFrame(requestID.current);
        };
    }, [renderer, scene, camera]);

    useEffect(() => {
        const handleWindowResize = () => {
            if (renderer && camera) {
                const width = mount.current.clientWidth;
                const height = mount.current.clientHeight;

                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
            }
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [renderer, camera]);

    const handleViewChange = (view) => {
        setCurrentView(view);

        if (view === "front") {
            camera.position.set(0, 0, 500);
            camera.lookAt(model.position);
        } else if (view === "back") {
            camera.position.set(0, 0, -500);
            camera.lookAt(model.position);
        } else if (view === "right") {
            camera.position.set(500, 0, 0);
            camera.lookAt(model.position);
        } else if (view === "left") {
            camera.position.set(-500, 0, 0);
            camera.lookAt(model.position);
        }
    };

    return (
        <div>
            <div style={style} ref={mount} />
            <div>
                <button onClick={() => handleViewChange("front")}>Front View</button>
                <button onClick={() => handleViewChange("back")}>Back View</button>
                <button onClick={() => handleViewChange("right")}>Right View</button>
                <button onClick={() => handleViewChange("left")}>Left View</button>
                <input type="file" onChange={handleTextureUpload} accept=".jpg, .jpeg, .png" />
            </div>
        </div>
    );
};

export default ThreeDemo