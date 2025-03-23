import React, { useState, useRef, useCallback, useEffect } from "react";
import html2canvas from "html2canvas";
// Components
import Camera from "../components/Camera.jsx";
import Card from "../components/Card";

const MainPage = () => {
  const [image, setImage] = useState(null); // Store the uploaded image file
  const [preview, setPreview] = useState(null); // Store the image preview URL
  const [json, setJson] = useState();
  const [toggleMode, setToggleMode] = useState(false);
  const [expand, toggleExpand] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state
  const webcamRef = useRef(null);
  const [url, setUrl] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);


  useEffect(() => {
    if (json) {
      console.log(json.results);
      console.log(json.ai_description);
    }
  }, [json]);

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setUrl(imageSrc);
    const blob = await fetch(imageSrc).then((res) => res.blob());
    setImage(blob);
  }, [webcamRef]);

  const onUserMedia = (e) => {
    console.log(e);
  };

  // Handle file selection
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Store the selected image file
      setPreview(URL.createObjectURL(file)); // Generate a preview of the image
    }
  };

  // Submit the image to the backend (Flask server)
  const handleSubmitImage = async () => {
    if (!image) {
      alert("Please upload an image.");
      return;
    }
  
    setLoading(true);
    const formData = new FormData();
    
    // Check if the image is a Blob or File
    if (image instanceof Blob) {
      //Use the explicit filename for this to work
      formData.append("image", image, "capture.jpg"); 
    } else {
      formData.append("image", image);
    }
  
    console.log("FormData:", formData);
  
    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
      if (response.ok) {
        setJson(result);
        setSuccessMessage("✅ Image submitted successfully!");
      } else {
        alert(result.error || "Failed to analyze image");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Image submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full flex items-center fancy flex-col`}>
      <div className="logo-container">
        <div className="left">
          <h1 className="logo-symbol">🛒</h1>
        </div>
        <div className="right">
          <h1 className="logo">ScanCart</h1>
          <h2 className="sublogo">Retail Product Scanner</h2>
        </div>
      </div>
      <div
        className={`transition flex place-items-center ${
          json ? "flex-row gap-2 justify-center" : "flex-col"
        }`}
      >
        <div
          className={`main-container p-2 place-self-start ${
            image ? "border rounded-md bg-white" : null
          }`}
        >
          <div className="row">
            <div>
              <button
                className="mb-2"
                onClick={() =>
                  !toggleMode ? setToggleMode(true) : setToggleMode(false)
                }
              >
                Toggle mode
              </button>
              {/* File Upload */}
              {!toggleMode ? (
                <>
                  <input
                    type="file"
                    className="border file:text file:p-2  file:border-r"
                    accept="image/*"
                    onChange={handleUpload}
                  />
                </>
              ) : (
                <Camera
                  capturePhoto={capturePhoto}
                  onUserMedia={onUserMedia}
                  url={url}
                  setUrl={setUrl}
                  webcamRef={webcamRef}
                ></Camera>
              )}
              {/* Image Preview */}
              <div>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    width="200px"
                    className="border rounded-full place-self-center"
                  />
                )}
              </div>
              <button
                className={`rounded-full p-2 border ${
                  loading ? "loading" : ""
                }`}
                onClick={handleSubmitImage}
                disabled={loading}
              >
                {/* Submit Button */}
                <span className="searching">
                  {loading ? "Searching..." : "Submit Image"}
                </span>
                {loading && <span className="cart-icon">🛒</span>}
              </button>
              {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
            </div>
          </div>
        </div>

        {/* Display Results */}
        {json && (
          <div className="p-5 flex justify-center flex-col items-center gap-2 w-1/2 border rounded-md bg-white">
            {json.search_query && <h1>Searched for "{json.search_query}"</h1>}

            <div className="w-full bg-white border rounded-md p-2">
              <h3 className="text-center text-gray-400">
                AI-Generated Description
              </h3>
              {json.ai_description ? <p>{json.ai_description}</p> : null}
            </div>
            <p
              className="w-full text-start text-gray-500 cursor-pointer italic"
              onClick={() =>
                expand ? toggleExpand(false) : toggleExpand(true)
              }
            >
              {expand ? "v Collapse" : "> View image search results"}
            </p>
            {expand ? (
              <div className="flex flex-col gap-2">
                <div className="w-full bg-white border rounded-md p-2">
                  <h3 className="text-center text-gray-400">Detected Labels</h3>
                  {json.labels ? (
                    <ul className="flex gap-2">
                      {[...new Set(json.labels)].map((label, index) => (
                        <li key={index} className="rounded-full border p-2">
                          {label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No labels detected</p>
                  )}
                </div>

                <div className="w-full bg-white border rounded-md p-2">
                  <h3 className="text-center text-gray-400">Detected Logos</h3>
                  {json.logos ? (
                    <ul className="flex gap-2">
                      {[...new Set(json.logos)].map((logo, index) => (
                        <li key={index} className="rounded-full border p-2">
                          {logo}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No logos detected</p>
                  )}
                </div>

                <div className="w-full bg-white border rounded-md p-2">
                  <h3 className="text-center text-gray-400">Extracted Text</h3>
                  {json.text ? <p>{json.text}</p> : <p>No text detected</p>}
                </div>
              </div>
            ) : null}

            <div className="w-full bg-white border rounded-md p-2">
              <h3 className="text-center text-gray-400">Search Results</h3>
              <div className="flex flex-col gap-2">
                {json.results
                  ? json.results.map((retailer, index) => (
                      <Card
                        key={`retailer-${index}`}
                        retailerInfo={retailer}
                      ></Card>
                    ))
                  : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
