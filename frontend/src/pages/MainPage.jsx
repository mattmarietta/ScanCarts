import React, { useState } from "react";
import Card from "../components/Card";

const MainPage = () => {
  const [image, setImage] = useState(null); // Store the uploaded image file
  const [preview, setPreview] = useState(null); // Store the image preview URL
  const [labels, setLabels] = useState([]); // Store detected object labels
  const [logos, setLogos] = useState([]); // Store detected brand logos
  const [extractedText, setExtractedText] = useState(""); // Store extracted text
  const [searchResults, setSearchResults] = useState(""); // Store extracted text
  const [aiDesc, setAiDesc] = useState(""); // Store extracted text
  const [retailerResults, setRetailerResults] = useState([]);
  const [loading, setLoading] = useState(false); // Track loading state
  if (searchResults) {
    console.log(searchResults);
  }
  if (aiDesc) {
    console.log(aiDesc);
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
        setLabels(result.labels || []); // Update labels
        setLogos(result.logos || []); // Update logos
        setExtractedText(result.text || ""); // Update extracted text
        setSearchResults(result.results);
        setAiDesc(result.ai_description);
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
      <h1 className="">ScanCart: Retail Product Scanner</h1>

      {/* File Upload */}

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="bg-gray-200"
      />

      {/* Image Preview */}
      <div>{preview && <img src={preview} alt="Preview" width="200px" />}</div>

      {/* Submit Button */}
      <button
        className="rounded-full p-2 border"
        onClick={handleSubmitImage}
        disabled={loading}
      >
        {loading ? "Processing..." : "Submit Image"}
      </button>

      {/* Display Results */}
      <div className="p-5 flex justify-center flex-col items-center">
      <h3>-------AI Description-------</h3>
        {aiDesc ? <p>{aiDesc}</p> : null }
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
