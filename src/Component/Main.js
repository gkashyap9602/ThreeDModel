import React, { useEffect, useRef, useState } from "react";
import ThreeDemo from './ThreeDModel'
import Edit from "./Edit";
import style from "../Component/main.css"

export const Main = () => {
    const [images, setImages] = useState([]);
    const [mode, setMode] = useState("edit");
    const [canvasTexture, setCanvasTexture] = useState(null);
    const [canvas, setCanvas] = useState(null);

    const handleModeChange = (newMode) => {
        setMode(newMode);
    };


    
    return (
        <div>
            <div>
                <button onClick={() => handleModeChange("edit")}>Edit</button>
                <button onClick={() => handleModeChange("preview")}>Preview</button>
            </div>

            <div className="both">
                <Edit setImages={setImages} images={images} setCanvasTexture={setCanvasTexture} setCanvas={setCanvas} canvas={canvas} />
                <ThreeDemo images={images} canvasTexture={canvasTexture} fabricCanvas={canvas} />

            </div>
            {/* {mode === "preview" ? <ThreeDemo images={images} canvasTexture={canvasTexture} /> :

                <Edit setImages={setImages} images={images} setCanvasTexture={setCanvasTexture} />

            } */}
            {/* You can add other components or UI elements for the preview mode here */}
        </div>
    )
}
