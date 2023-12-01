import React, { useState, useEffect } from "react";
import { fabric } from "fabric";
import * as THREE from "three";
import Front from "../assets/partsNew/Front.png";
import Back from "../assets/partsNew/Back.png";
import LeftSleeve from "../assets/partsNew/Left-Sleeve.png";
import RightSleeve from "../assets/partsNew/Right-Sleeve.png";
import Collar from "../assets/partsNew/Collar.png";
import axios from 'axios'

const Edit = ({ images, setImages, setCanvasTexture, canvas, setCanvas }) => {
  const [selectedImage, setSelectedImage] = useState(Front);
  const [selectedButtonName, setSelectedButtonName] = useState("Front");
  const [text, setText] = useState("");
  // const [canvas, setCanvas] = useState(null);

  const canvasWidth = Math.ceil(310);
  const canvasHeight = Math.ceil(390);

  useEffect(() => {
    let canvasObj = localStorage.getItem("canvasObj");
    canvasObj = JSON.parse(canvasObj);

    // if (canvas && canvasObj) {
    //   canvas.loadFromJSON(canvasObj, () => {
    //     canvas.renderAll();
    //   });
    // }
    let texture = new THREE.Texture(document.getElementById("fabric-canvas"));

    // let texture = new THREE.Texture(document.getElementById("canvas"));
    // texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const materialCanvas = new THREE.MeshBasicMaterial({ map: texture });
    // setCanvasMaterial(materialCanvas)

    setCanvasTexture(materialCanvas)
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas("fabric-canvas", {
        width: canvasWidth,
        height: canvasHeight,
        // backgroundColor: "white",
        // isDrawingMode:true
      });

      setCanvas(fabricCanvas);
    }
  }, [canvas]);

  useEffect(() => {
    if (canvas) {
      canvas.on("object:modified", () => {
        // console.log("object modified");
        localStorage.setItem("canvasObj", JSON.stringify(canvas.toJSON()));
        // const texture = new THREE.CanvasTexture(canvas?.lowerCanvasEl);
        // setCanvasTexture(texture);

      });
    }
  }, [canvas]);

  useEffect(() => {
    if (canvas && selectedImage) {
      fabric.Image.fromURL(selectedImage, (bgImg) => {

        const mask = new fabric.Image(bgImg.getElement(), {
          scaleX: canvas.width / bgImg.width,
          scaleY: canvas.height / bgImg.height,
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          crossOrigin: "anonymous",

        });

        mask.globalCompositeOperation = "source-atop";
        canvas.clear();
        canvas.setBackgroundImage(bgImg, null, {
          scaleX: canvas.width / bgImg.width,
          scaleY: canvas.height / bgImg.height,
          // width:72,
          // height:73,
          left: 10,
          right: 10,
          crossOrigin: "anonymous",
        });

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

        // // Create a safezone using the image as a mask
        // const safezone = new fabric.Rect({
        //   left: 10, // Adjust based on your requirement
        //   top: 10, // Adjust based on your requirement
        //   width: canvas.width - 30, // Adjust based on your requirement
        //   height: canvas.height - 30, // Adjust based on your requirement
        //   // fill: "transparent", // Set the fill color to transparent
        //   strokeWidth: 4, // Border width
        //   stroke: "red", // Border color
        //   clipPath: mask, // Use the image as a clip path for the safezone
        //   evented: false,
        //   selectable:false
        // });

        // // Add the safezone to the canvas
        // canvas.add(safezone);
      });
    }
  }, [canvas, selectedImage]);





  useEffect(() => {
    if (canvas && images?.length > 0) {
      canvas.on("object:modified", (event) => {
        // console.log(canvas.getObjects(), "objectss");
        const modifiedObject = event.target;
        const coordinates = {
          x:
            event.e.clientX - canvas.upperCanvasEl.getBoundingClientRect().left,
          y: event.e.clientY - canvas.upperCanvasEl.getBoundingClientRect().top,
        };

        const convert2DTo3D = (fabricX, fabricY, depth = 0) => {
          const normalizedX = fabricX / canvasWidth;
          const normalizedY = fabricY / canvasHeight;

          const threeX = normalizedX * 2 - 1;
          const threeY = -(normalizedY * 2 - 1);
          const threeZ = depth;

          return { x: threeX, y: threeY, z: threeZ };
        };

        setImages((prev) => {
          let itemIndex = prev.findIndex(
            (item) => item.name === selectedButtonName
          );
          if (itemIndex !== -1) {
            let updatedItems = [...prev];
            updatedItems[itemIndex] = {
              ...updatedItems[itemIndex],
              coordinates: convert2DTo3D(
                modifiedObject.left,
                modifiedObject.top
              ),
            };
            return updatedItems;
          } else {
            console.log("Item not found");
            return prev;
          }
        });
      });
    }
  }, [canvas, images, selectedButtonName]);

  // console.log(images, "imagesssSett");

  const handleFileChange = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const blobUrl = URL.createObjectURL(file);
      const imgElement = document.createElement("img");
      imgElement.src = event.target.result;

      imgElement.onload = () => {
        // canvas.height = 1024
        // canvas.width = 1024
        const texture = new THREE.CanvasTexture(canvas?.lowerCanvasEl);
        // const texture = new THREE.CanvasTexture(
        //   document.getElementById("fabric-canvas")
        // );
        // setCanvasTexture(texture);

        const imageObject = {
          name: selectedButtonName,
          blobUrl: event.target.result,
          canvas: canvas,
          canvasUrl: canvas?.toDataURL("image/png"),
          canvasTexture: texture
        };

        setImages([...images, imageObject]);

        const fabricImage = new fabric.Image(imgElement, {
          left: canvas.width / 4,
          top: canvas.height / 4,
          scaleX: canvas.width / (imgElement.width * 2),
          scaleY: canvas.height / (imgElement.height * 2),
          evented: true,
          globalCompositeOperation: "source-atop",
          crossOrigin: "anonymous",
        });

        fabricImage.set("name", selectedButtonName);
        canvas.add(fabricImage);
        canvas.renderAll();
      };
    };

    reader.readAsDataURL(file);
  };

  const addText = () => {
    if (!canvas) return;

    const maxWidth = canvas.width;
    const maxHeight = canvas.height;

    const addedText = new fabric.IText(text, {
      left: 100,
      top: 100,
      selectable: true,
      hasControls: true,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      globalCompositeOperation: "source-atop",
      crossOrigin: "anonymous",
    });

    canvas.add(addedText);
    setText("");
  };

  const removeSelectedObject = () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);

      setImages((prev) => {
        const updatedItems = prev.filter(
          (item) => item.name !== activeObject.name
        );
        return updatedItems;
      });
    }
  };

  const styleButton = {
    padding: "6px",
    // marginRight: "5px",
  };

  console.log(selectedButtonName, "selectedButtonName");
  console.log(images, "imagesss== edit side");

  const onMouseClick = (evt) => {
    evt.preventDefault();
    console.log("under beforee clickkk");

    if (!canvas || !scene) {
      console.error('Fabric canvas or Three.js scene not initialized.');
      return;
    }

    console.log("under mouse clickkk");

    const array = getMousePosition(canvas, evt.clientX, evt.clientY);
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
      canvas.add(circle);
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


  return (
    <div style={{}}>
      <div
        style={{
          width: "1000px",
          height: "500px",
          border: "1px solid black",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: 'auto'
        }}
      >
        <div>
          <button
            style={styleButton}
            onClick={() => {
              setSelectedImage(Front);
              setSelectedButtonName("Front");
            }}
          >
            Front
          </button>
          <button
            style={styleButton}
            onClick={() => {
              setSelectedImage(Back);
              setSelectedButtonName("Back");
            }}
          >
            Back
          </button>
          <button
            style={styleButton}
            onClick={() => {
              setSelectedImage(LeftSleeve);
              setSelectedButtonName("Left Sleeve");
            }}
          >
            Left Sleeve
          </button>
          <button
            style={styleButton}
            onClick={() => {
              setSelectedImage(RightSleeve);
              setSelectedButtonName("Right Sleeve");
            }}
          >
            Right Sleeve
          </button>
          <button
            style={styleButton}
            onClick={() => {
              setSelectedImage(Collar);
              setSelectedButtonName("Collar");
            }}
          >
            Collar
          </button>

        </div>
        <div
          style={{
            padding: "5px",
            width: "100%",
            height: "100%",
            textAlign: "center",
            marginLeft: "200px",
          }}
        >
          <canvas
            id="fabric-canvas"

            onMouseDown={(e) => onMouseClick(e)}
            style={{ maxWidth: "100%", maxHeight: "75%" }}
          />

        </div>

        <div style={{ justifyContent: "center" }}>
          <input
            type="file"
            onChange={(e) => handleFileChange(e.target.files?.[0])}
            accept=".jpg, .jpeg, .png"
          />
          <span>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button style={styleButton} onClick={() => addText()}>
              Add Text
            </button>
            <button style={styleButton} onClick={() => removeSelectedObject()}>
              Remove Object
            </button>

          </span>
        </div>
      </div>
    </div>
  );
};

export default Edit;
