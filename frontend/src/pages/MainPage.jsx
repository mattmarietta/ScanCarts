import React, { useState } from "react";

const MainPage = () => {
  const [image, setImage] = useState(null);  // Store the uploaded image file
  const [preview, setPreview] = useState(null);  // Store the image preview URL
  const [labels, setLabels] = useState([]);  // Store the labels returned from the backend
  const [loading, setLoading] = useState(false);  // Track loading state

  // Handle file selection
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);  // Store the selected image file
      setPreview(URL.createObjectURL(file));  // Generate a preview of the image
    }
  };

  // Submit the image to the backend (Flask server)
  const handleSubmitImage = async () => {
    if (!image) {
      return alert("Please upload an image.");
    }

    setLoading(true);  // Show loading indicator while processing
    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setLabels(result.labels);  // Set the returned labels to the state
      } else {
        alert(result.error || "Failed to analyze image");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Image submission failed.");
    } finally {
      setLoading(false);  // Hide loading indicator
    }
  };

  return (
    <div className="container">
      <h1>ScanCart: Retail Product Scanner</h1>
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
        />
      </div>
      <div>
        {preview && <img src={preview} alt="Preview" width="200px" />}
      </div>
      <button onClick={handleSubmitImage} disabled={loading}>
        {loading ? "Processing..." : "Submit Image"}
      </button>

      <div>
        <h3>Detected Labels</h3>
        {labels.length > 0 ? (
          <ul>
            {labels.map((label, index) => (
              <li key={index}>{label}</li>
            ))}
          </ul>
        ) : (
          <p>No labels detected</p>
        )}
      </div>
    </div>
  );
};

export default MainPage;
