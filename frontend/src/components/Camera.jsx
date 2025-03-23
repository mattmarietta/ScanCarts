import React, { useEffect, useRef } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 300,
  facingMode: "environment",
};

const Camera = ({ capturePhoto, onUserMedia, url, setUrl, webcamRef }) => {
  return (
    <div className="flex flex-col items-center">
      {!url ? (
        <>
          <Webcam
            ref={webcamRef}
            audio={true}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={onUserMedia}
          />
          <div className="flex">
            <button onClick={capturePhoto}>Capture</button>
          </div>
        </>
      ) : (
        <div>
          <img src={url} alt="Screenshot" />
        </div>
      )}
    </div>
  );
};

export default Camera;
