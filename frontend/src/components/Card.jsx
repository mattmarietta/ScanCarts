import React from "react";

const Card = ({ retailerInfo }) => {
  return (
    <div
      href={retailerInfo.url}
      target="_blank"
      className="rounded-md border p-2 w-full bg-white"
    >
      <a className="text-blue-400 cursor-pointer">{retailerInfo.title}</a>
      <h4 className="text-green-600">${retailerInfo.price}</h4>
      <p>
        Rating: {"⭐".repeat(Math.floor(retailerInfo.rating))} (
        {retailerInfo.rating})
      </p>
    </div>
  );
};

export default Card;
