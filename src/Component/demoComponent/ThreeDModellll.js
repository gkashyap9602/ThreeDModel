import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import TshirtObj from "../../src/assets/Tshirt.obj";
import TshirtMtl from "../../src/assets/Tshirt.mtl";
import imggg from "../../src/assets/line.jpeg";

const ThreeDemo = ({ images, setImages, canvasTexture }) => {

  let meshName = {
    Material477748: "Front",
    Material477752: "Back",
    Material477756: "Left Sleeve",
    Material477760: "Right Sleeve",
    Material477768: "Collar",

  }

  console.log(canvasTexture, "canvsTexture");
  console.log(images, "images on model side");
  const mount = useRef(null);
  const [scene, setScene] = useState(null);
  // const [images, setImages] = useState([]);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [model, setModel] = useState(null);
  const [currentView, setCurrentView] = useState("front");
  const [texture, setTexture] = useState(null);
  const requestID = useRef(null);

  const handleTextureUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const textureImage = e.target.result;
      const newTexture = new TextureLoader().load(textureImage);
      setTexture(newTexture);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const width = mount.current.clientWidth;
    const height = mount.current.clientHeight;

    const newScene = new THREE.Scene();
    const newCamera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    newCamera.position.z = 500;

    const newRenderer = new THREE.WebGLRenderer({ alpha: false, antialias: false, preserveDrawingBuffer: true });
    newRenderer.setSize(width, height);
    newRenderer.setClearColor(new THREE.Color(0xffffff));
    mount.current.appendChild(newRenderer.domElement);

    setScene(newScene);
    setCamera(newCamera);
    setRenderer(newRenderer);

    return () => {
      // Cleanup logic for model (if needed)
    };
  }, []);

  useEffect(() => {
    if (!scene) return;

    const loader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    mtlLoader.load(
      TshirtMtl,
      (materials) => {
        // console.log(materials, "materialass============");
        materials.preload();
        loader.setMaterials(materials);

        loader.load(
          TshirtObj,
          (object) => {
            console.log(object, "objectss");
            // Access the geometry and UV mapping here
            const geometry = object.children[0].geometry;
            console.log(geometry, "geometry");

            // Access the UV mapping coordinates
            const uvAttribute = geometry.getAttribute('uv');
            const uvArray = uvAttribute.array;

            // Log the UV coordinates to the console
            console.log(uvArray, "uvArray");

            const boundingBox = new THREE.Box3().setFromObject(object);
            const dimensions = boundingBox.getSize(new THREE.Vector3());

            console.log(
              "Dimensions of the 3D model:",
              dimensions.x,
              dimensions.y,
              dimensions.z
            );

            const scaleFactor = 4.5;
            object.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Set default color to black for all materials in the array
            // object.traverse((child) => {
            //   if (child instanceof THREE.Mesh) {
            //     if (Array.isArray(child.material)) {
            //       child.material.forEach((material) => {
            //         if (material instanceof THREE.MeshPhongMaterial) {
            //           material.color.setHex(0x000000);
            //         }
            //       });
            //     } else if (child.material instanceof THREE.MeshPhongMaterial) {
            //       // If it's not an array, handle it as a single material
            //       child.material.color.setHex(0x000000);
            //     }
            //   }
            // });

            scene.add(object);

            scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                let targetMesh = child;
                console.log(targetMesh, "targetmesh");
                targetMesh.position.set(0, -150, 0);
              }
            });
            // Create a material
            // var textureLoader = new THREE.TextureLoader();
            // var map = textureLoader.load(imggg);
            // var material = new THREE.MeshPhongMaterial({ map: map });

            // object.traverse(function (node) {
            //     if (node.isMesh) {
            //         node.material = texture
            //         // node.geometry.uvsNeedUpdate = true;
            //         //object = node;
            //     }
            // });

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
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error, "material load error");
      }
    );

    return () => {
      // Cleanup logic for model (if needed)
    };
  }, [scene]);

  const updateObjectTexture = () => {
    console.log("updateTextureCall");

    const colors = [
      0xff0000, //red
      0x0000ff, //yellow
      0x00ff00, //blue
      0xffff00, //green,
    ];

    let colorIndex = 0;

    console.log(canvasTexture, "canvasTextureree");
    if (model && images.length > 0) {
      console.log("under model if");
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.material && Array.isArray(child.material)) {
            child.material.forEach((material) => {
              if (material instanceof THREE.MeshPhongMaterial) {
                console.log(child, "childdd=========");

                // Check if the mesh name matches with any image object name
                const matchedImage = images.find((image) => image.name === meshName[material.name]);

                if (matchedImage) {
                  console.log("Matched mesh name:", meshName[material.name]);

                  const canvas = matchedImage.canvas;
                  const canvasUrl = matchedImage.canvasUrl;

                  if (canvas && canvasTexture && canvasUrl) {
                    // let texture = new THREE.Texture(canvasUrl)
                      // Set the UV coordinates of the geometry to match the canvas size
                  // const uvAttribute = child.geometry.getAttribute('uv');
                  // const uvArray = uvAttribute.array;

                  // for (let i = 0; i < uvArray.length; i += 2) {
                  //   uvArray[i] *= canvas.width / canvas.width;
                  //   uvArray[i + 1] *= canvas.height / canvas.height;
                  // }

                  // uvAttribute.needsUpdate = true;
                  
                    material.map = canvasTexture;
                    material.map.repeat.set(1, 1);
                    // material.map.offset.set(0, 5 - canvas.height / model.height);

                    material.map.wrapS = THREE.RepeatWrapping;
                    material.map.wrapT = THREE.RepeatWrapping;
                    material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                    material.map.magFilter = THREE.NearestFilter;
                    material.map.minFilter = THREE.LinearFilter;
                    material.color = new THREE.Color(0xffffff); // Adjust color
                    material.metalness = 0; // Adjust metalness
                    material.roughness = 0.7; // Adjust roughness

                    canvas.on("after:render", function () {
                      material.map.needsUpdate = true;
                    });
                  }
                  material.needsUpdate = true;
                } else {
                  console.log("No matching image found for mesh name:", meshName[material.name]);
                  // Apply color if no matching image found
                  // material.color.setHex(colors[colorIndex % colors.length]);
                  colorIndex++;
                }
              }
            });
          }
        }
      });
    }
  };

  // const updateObjectTexture = () => {
  //   console.log("updateTextureCall");

  //   const colors = [
  //     0xff0000, //red
  //     0x0000ff, //yellow
  //     0x00ff00, //blue
  //     0xffff00, //green,
  //   ];

  //   let colorIndex = 0;

  //   console.log(canvasTexture, "canvasTextureree");
  //   if (model && images.length > 0) {
  //     console.log("under model if");
  //     model.traverse((child) => {
  //       if (child instanceof THREE.Mesh) {
  //         if (child.material && Array.isArray(child.material)) {
  //           child.material.forEach((material) => {
  //             if (material instanceof THREE.MeshPhongMaterial) {


  //               console.log(child, "childdd");
  //               if (colorIndex === 0 && images.length > 0) {
  //                 console.log("index iff");

  //                 const canvas = images && images.length > 0 ? images[0].canvas : null;

  //                 if (canvas && canvasTexture) {
  //                   material.map = canvasTexture
  //                   material.map.repeat.set(1, 1);

  //                   material.map.wrapS = THREE.RepeatWrapping;
  //                   material.map.wrapT = THREE.RepeatWrapping;

  //                   material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();

  //                   material.map.magFilter = THREE.NearestFilter;
  //                   material.map.minFilter = THREE.LinearFilter;

  //                   material.color = new THREE.Color(0xffffff); // Adjust color
  //                   material.metalness = 4.0; // Adjust metalness
  //                   material.roughness = 0.1; // Adjust roughness

  //                   // material.transparent = true;

  //                   canvas.on("after:render", function () {
  //                     material.map.needsUpdate = true;
  //                   });
  //                 }
  //                 material.needsUpdate = true;
  //               } else {
  //                 console.log("color else");

  //                 material.color.setHex(colors[colorIndex % colors.length]);
  //               }

  //               colorIndex++;
  //             }
  //           });
  //         }
  //       }
  //     });
  //   }
  // };

  useEffect(() => {
    updateObjectTexture();
  }, [model, texture, images, canvasTexture]);

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


      // scene.add(new THREE.AmbientLight(0xffffff, 0.5));
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

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
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

  console.log(images, "images from three js demo");

  return (
    // <div style={style}>
    <div>
      {" "}
      {/* Apply styles to enable scrolling */}
      <div style={{ height: 500, overflow: 'auto' }} ref={mount} />
      <div>
        <button onClick={() => handleViewChange("front")}>Front View</button>
        <button onClick={() => handleViewChange("back")}>Back View</button>
        <button onClick={() => handleViewChange("right")}>Right View</button>
        <button onClick={() => handleViewChange("left")}>Left View</button>
        <input
          type="file"
          onChange={handleTextureUpload}
          accept=".jpg, .jpeg, .png"
        />
      </div>
    </div>
    // </div>
  );
};

export default ThreeDemo;
