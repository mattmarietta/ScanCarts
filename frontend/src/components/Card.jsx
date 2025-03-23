import React from "react";

const Card = ({ retailerInfo }) => {
  const handleMouseDown = (event) => {
    if (event.button === 1) {
      // Middle click opens in a new tab
      window.open(retailerInfo.url, "_blank");
    }
  };

  return (
    <a
      href={retailerInfo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-md border p-2 w-full bg-white block cursor-pointer"
      //Use for detecting the click on the link
      onMouseDown={handleMouseDown} 
    >
      <p className="text-blue-400">{retailerInfo.title}</p>
      <h4 className="text-green-600">${retailerInfo.price}</h4>
      <p>
        Rating: {"⭐".repeat(Math.floor(retailerInfo.rating))} ({retailerInfo.rating})
      </p>
    </a>
  );
};

export default Card;
