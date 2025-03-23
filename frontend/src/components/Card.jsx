import React from "react";

const Card = ({ retailerInfo }) => {
  return (
    <div className="rounded-md border p-2 w-full bg-white">
      <p>{retailerInfo.title}</p>
      <h4 className="text-green-600">${retailerInfo.price}</h4>
      <p>
        Rating: {"⭐".repeat(Math.floor(retailerInfo.rating))} (
        {retailerInfo.rating})
      </p>
    </div>
  );
};

export default Card;
