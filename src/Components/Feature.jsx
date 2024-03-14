import React from "react";

const Feature = (props) => {

    return (
        <div className="col-lg-3">
            <img src={props.icon} alt="" />
            <h5 style={{padding: "10px"}} className="pew" >{props.name}</h5>
            <p className="par" style={{maxWidth: "300px", marginInline: "auto"}}>{props.description}</p>
        </div>
    )
}

export default Feature;