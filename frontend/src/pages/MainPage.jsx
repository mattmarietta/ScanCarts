import React, { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
// Components
import Webcam from "react-webcam";
import Camera from "../components/Camera.jsx";
import AllCameras from "../components/AllCamera.jsx";
import Card from "../components/Card";

const MainPage = () => {
  const [image, setImage] = useState(null); // Store the uploaded image file
  const [preview, setPreview] = useState(null); // Store the image preview URL
  const [labels, setLabels] = useState([]); // Store detected object labels
  const [logos, setLogos] = useState([]); // Store detected brand logos
  const [extractedText, setExtractedText] = useState(""); // Store extracted text
  const [searchResults, setSearchResults] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toggleMode, setToggleMode] = useState(false);
  const [loading, setLoading] = useState(false); // Track loading state
  const webcamRef = useRef(null);
  const [url, setUrl] = useState(null);

  const capturePhoto = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setUrl(imageSrc);
    const blob = await fetch(imageSrc).then((res) => res.blob());
    setImage(blob);
  }, [webcamRef]);

  const onUserMedia = (e) => {
    console.log(e);
  };

  if (searchResults) {
    console.log(searchResults);
  }
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
      return alert("Please upload an image.");
    }

    setLoading(true); // Show loading indicator while processing
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setSearchQuery(result.search_query || "");
        setLabels(result.labels || []); // Update labels
        setLogos(result.logos || []); // Update logos
        setExtractedText(result.text || ""); // Update extracted text
        setSearchResults(result.results);
        console.log(result.retailer);
      } else {
        alert(result.error || "Failed to analyze image");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Image submission failed.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div className="w-full flex flex-col items-center ">
      <div className="logo-container">
        <div className="left">
          <h1 className="logo-symbol">🛒</h1>
        </div>
        <div className="right">
          <h1 className="logo">ScanCart</h1>
          <h2 className="sublogo">Retail Product Scanner</h2>
        </div>
      </div>
      <div className="main-container">
        <div className="row">
          <div className="box-1">
            {/* Image Preview */}
            <div>
              {preview && <img src={preview} alt="Preview" width="200px" />}
            </div>
            <div>
              <button
                onClick={() =>
                  !toggleMode ? setToggleMode(true) : setToggleMode(false)
                }
              >
                Toggle mode
              </button>
              {/* File Upload */}
              {!toggleMode ? (
                <>
                  <input type="file" accept="image/*" onChange={handleUpload} />
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
            </div>
          </div>
        </div>
      </div>

      {/* Display Results */}
      <div className="p-5 flex justify-center flex-col items-center">
        {searchQuery && <h3>Searched for "{searchQuery}"</h3>}
        <h3>-------Detected Labels-------</h3>
        {labels.length > 0 ? (
          <ul>
            {labels.map((label, index) => (
              <li key={index} className="">
                {label}
              </li>
            ))}
          </ul>
        ) : (
          <p>No labels detected</p>
        )}

        <h3>-------Detected Logos-------</h3>
        {logos.length > 0 ? (
          <ul>
            {logos.map((logo, index) => (
              <li key={index}>{logo}</li>
            ))}
          </ul>
        ) : (
          <p>No logos detected</p>
        )}

        <h3>-------Extracted Text-------</h3>
        {extractedText ? <p>{extractedText}</p> : <p>No text detected</p>}

        <h3>-------Search Results-------</h3>
        {searchResults
          ? searchResults.map((retailer, index) => (
              <Card key={`retailer-${index}`} retailerInfo={retailer}></Card>
            ))
          : null}
      </div>
    </div>
  );
};

export default MainPage;
