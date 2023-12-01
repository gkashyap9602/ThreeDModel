import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import TshirtObj from "../../src/assets/Tshirt.obj";
import TshirtMtl from "../../src/assets/Tshirt.mtl";
import imggg from "../../src/assets/line.jpeg";

const ThreeDemo = ({ images, setImages, canvasTexture, fabricCanvas }) => {

  // console.log(fabricCanvas,"fabricCanvasModel");

  let meshName = {
    Material477748: "Front",
    Material477752: "Back",
    Material477756: "Left Sleeve",
    Material477760: "Right Sleeve",
    Material477768: "Collar",

  }

  const mount = useRef(null);
  const [scene, setScene] = useState(null);
  // const [images, setImages] = useState([]);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [model, setModel] = useState(null);
  const [currentView, setCurrentView] = useState("front");
  const [texture, setTexture] = useState(null);
  const [canvasMaterial, setCanvasMaterial] = useState(null);
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
    if (!fabricCanvas) return
    if(!canvasTexture) return 

    const loader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    let texture = new THREE.Texture(fabricCanvas);

    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    console.log(texture, "texture modellll");
    const materialCanvas = new THREE.MeshBasicMaterial({ map: texture });
    setCanvasMaterial(materialCanvas)
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
            handleMaterialUpdate(object, "Material477748", canvasTexture)

            const scaleFactor = 4.5;
            object.scale.set(scaleFactor, scaleFactor, scaleFactor);


            scene.add(object);

            scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                let targetMesh = child;
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
      },
      (xhr) => {
        // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        console.log(error, "material load error");
      }
    );

    return () => {
      // Cleanup logic for model (if needed)
    };
  }, [scene]);

  const handleMaterialUpdate = (object, meshName, materialCanvas) => {
    console.log("under marterial update");
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material && Array.isArray(child.material)) {
          child.material.forEach((material, index) => {
            if (material instanceof THREE.MeshPhongMaterial) {
              console.log(material.name, "nameeee");
              console.log(meshName, "meshName");
              if (material.name == meshName) {
                console.log(meshName, "meshnameee");
                child.material[index] = materialCanvas;
                child.material.needsUpdate = true;

              } else {
                // child.material[index] = new THREE.MeshBasicMaterial();
                material.color.setHex(0x000000);
              }
            }
            material.needsUpdate = true;
          });
        }
      }
    });
  };

  // useEffect(() => {
  //   if (model && images.length > 0 && canvasMaterial) {

  //     // let texture = new THREE.Texture(fabricCanvas);

  //     // texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  //     // const materialCanvas = new THREE.MeshBasicMaterial({ map: texture });
  //     // console.log("under useef");
  //     handleMaterialUpdate(model, meshName, canvasMaterial)
  //   }
  // }, [images])

  // const updateObjectTexture = () => {
  //   console.log("updateTextureCall");
  //   console.log(canvasTexture, "canvasTextureree");

  //   if (model && images.length > 0) {
  //     console.log("under model if");
  //     model.traverse((child) => {
  //       if (child instanceof THREE.Mesh) {
  //         if (child.material && Array.isArray(child.material)) {
  //           child.material.forEach((material, index) => {
  //             if (material instanceof THREE.MeshPhongMaterial) {
  //               // Check if the mesh name matches with any image object name
  //               const matchedImage = images.find((image) => image.name === meshName[material.name]);

  //               if (matchedImage) {
  //                 console.log("Matched mesh name:", meshName[material.name]);
  //                 const canvas = matchedImage.canvas;
  //                 if (canvas) {
  //                   let texture = new THREE.Texture(canvas);
  //                   texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  //                   const materialCanvas = new THREE.MeshBasicMaterial({ map: texture });
  //                   child.material[index] = materialCanvas;
  //                   material.needsUpdate = true;
  //                 }
  //               } else {
  //                 console.log("No matching image found for mesh name:", meshName[material.name]);
  //                 material.color.setHex(0x000000);
  //                 material.needsUpdate = true;

  //               }
  //               material.needsUpdate = true;

  //             }
  //           });
  //         }
  //       }
  //     });
  //   }
  // };


  // useEffect(() => {
  //   updateObjectTexture();
  // }, [model, texture, images, canvasTexture]);

  useEffect(() => {
    if (scene) {
      const lights = [
        new THREE.PointLight(0xffffff, 1, 0),
        new THREE.PointLight(0xffffff, 1, 0),
        new THREE.PointLight(0xffffff, 1, 0),
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
