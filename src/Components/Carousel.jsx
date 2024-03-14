import React, { Component } from "react";
import Slider from "react-slick";
import "../../node_modules/slick-carousel/slick/slick.css"
import "../../node_modules/slick-carousel/slick/slick-theme.css"
import star from "../images/home page icons/star.png"
export default class AutoPlay extends Component {
  render() {
    const settings = {
      dots: false,
      infinite: true,
      slidesToShow: 5,
      slidesToScroll: 1,
      autoplay: true,
      speed: 2000,
      autoplaySpeed: 2000,
      cssEase: "linear",
      pauseOnHover: false,
      arrows: false,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 3,
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
          }
        },
      ]
    };
    return (
        <Slider style={{textAlign: "center", color: "#e8bf74", backgroundImage: `linear-gradient(#28562c, #112212)`}} {...settings}>
          <div>
            <img style={{marginInline: "auto", marginTop: "2px"}} src={star} alt="star" width="38px"/>
          </div>
          <div>
            <h4 style={{marginTop: "6px"}}>Sell Your NFT</h4>
          </div>
          <div>
            <img style={{marginInline: "auto", marginTop: "2px"}} src={star} alt="star" width="38px"/>
          </div>
          <div >
            <h4 style={{marginTop: "6px"}}>Create Your NFT</h4>
          </div>
          <div >
            <img style={{marginInline: "auto", marginTop: "2px"}} src={star} alt="star" width="38px"/>
          </div>
          <div>
            <h4 style={{marginTop: "6px"}}>Global Best NFT</h4>
          </div>
        </Slider>
    );
  }
}