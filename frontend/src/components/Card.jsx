import React from "react";

const Card = ({ retailerInfo }) => {
  return (
    <div className="rounded-md border p-2 w-full">
      <p>Source: {retailerInfo.retailer}</p>
      <p>Product: {retailerInfo.title}</p>
      <p>${retailerInfo.price}</p>
      <p>Rating: {retailerInfo.rating}/5</p>
    </div>
  );
};

export default Card;
