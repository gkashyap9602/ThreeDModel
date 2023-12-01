import React, { useEffect, useRef, useState } from "react";
// import ThreeDemo from "./Component/ThreeDModel";
import { Main } from "./Component/Main";
// import Edit from "./Component/Edit";
import ThreeAndFabricEditor from "./Component/Both"
// import style from "./Component/main.css"
import ThreeCanvas from "./Component/ray";
import ReactDOM from "react-dom";

const Container = ({onProgress}) => {
    const [isMounted, setIsMounted] = useState(true);
    const [loadingPercentage, setLoadingPercentage] = useState(0);

    return (
        <>
            <button onClick={() => setIsMounted((prev) => !prev)}>
                {isMounted ? "Unmount" : "Mount"}
            </button>
            {isMounted && <ThreeCanvas onProgress={setLoadingPercentage} />}
            {isMounted && loadingPercentage === 100 && <div>Scroll to zoom, drag to rotate</div>}
            {isMounted && loadingPercentage !== 100 && <div>Loading Model: {loadingPercentage}%</div>}
        </>
    );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<Container />, rootElement);
