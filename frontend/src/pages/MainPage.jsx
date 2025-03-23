import React, { useState } from "react";
import Card from "../components/Card";

const MainPage = () => {
  const [image, setImage] = useState(null); // Store the uploaded image file
  const [preview, setPreview] = useState(null); // Store the image preview URL
  const [labels, setLabels] = useState([]); // Store detected object labels
  const [logos, setLogos] = useState([]); // Store detected brand logos
  const [extractedText, setExtractedText] = useState(""); // Store extracted text
  const [loading, setLoading] = useState(false); // Track loading state

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
        setLabels(result.labels || []); // Update labels
        setLogos(result.logos || []); // Update logos
        setExtractedText(result.text || ""); // Update extracted text
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
          <div>{preview && <img src={preview} alt="Preview" width="200px"/>}</div>
          {/* File Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
          />
          {/* Submit Button */}
          <button
            className={`rounded-full p-2 border ${loading ? "loading" : ""}`}
            onClick={handleSubmitImage}
            disabled={loading}
          >
            <span className="searching">{loading ? "Searching..." : "Submit Image"}</span>
            {loading && <span className="cart-icon">🛒</span>}
          </button>
          </div>
        </div>
      </div>
      

      {/* Display Results */}
      <div className="p-5 flex justify-center flex-col items-center">
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
      </div>
    </div>
  );
};

export default MainPage;
