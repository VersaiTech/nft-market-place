import React from "react";
import card from "../images/card.png";
import browse from "../images/browse.png";

const Card = (props) => {
  const {} = props;

  return (
    <div className="asset-card">
      <div className="card">
        <img
          src={props.src === "browse" ? browse : card}
          className="card-img-top"
          alt="..."
        ></img>
        <div className="card-body" style={{ padding: "12px" }}>
          <p style={{ fontWeight: "bold", marginBottom: "2px" }}>Arts</p>
          <p
            style={{
              color: "#11111175",
              fontSize: "small",
              marginBottom: "2px",
            }}
          >
            Buy and sell artworks of your favorite artists and support them
          </p>
          <strong>0 Eth</strong>
        </div>
      </div>
    </div>
  );
};

export default Card;
