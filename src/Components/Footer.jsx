import React from "react";
import logo from "../images/logo.png";

const Footer = () => {
  return (
    <footer className="text-center text-lg-start">
      <div className="container text-center text-md-start mt-5">
        <div className="row mt-3">
          <div
            className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4"
            style={{ textAlign: "center" }}
          >
            <div className="mb-4">
              <img style={{ width: "100px" }} src={logo} alt="logo" />
            </div>
            <p className="par" style={{ color: "#ffffffab" }}>
              E-Commerce for digital assessts in an easy, fun, secure and
              practical way
            </p>
          </div>

          <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 className="mb-4">Legal</h6>
            <p className="par">
              <a
                href="#!"
                style={{ textDecoration: "none" }}
                className="text-reset"
              >
                Privacy Policy
              </a>
            </p>
            <p className="par">
              <a
                href="#!"
                style={{ textDecoration: "none" }}
                className="text-reset"
              >
                Cookie Policy
              </a>
            </p>
            <p className="par">
              <a
                href="#!"
                style={{ textDecoration: "none" }}
                className="text-reset"
              >
                Refund Policy
              </a>
            </p>
            <p className="par">
              <a
                href="#!"
                style={{ textDecoration: "none" }}
                className="text-reset"
              >
                Terms of Service
              </a>
            </p>
          </div>

          <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
            <h6 className="mb-4">Help</h6>
            <p className="par">
              <a
                href="#!"
                style={{ textDecoration: "none" }}
                className="text-reset"
              >
                About Us
              </a>
            </p>
            <p className="par">
              <a
                href="#!"
                style={{ textDecoration: "none" }}
                className="text-reset"
              >
                MUNDUM Support
              </a>
            </p>
          </div>

          <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-md-0 mb-4">
            <h6 className="mb-4">Services</h6>
            <p className="par">
              <a
                href="#!"
                style={{ textDecoration: "none" }}
                className="text-reset"
              >
                Earn
              </a>
            </p>
            <p className="par">
              <a
                href="#!"
                style={{ textDecoration: "none" }}
                className="text-reset"
              >
                Payments
              </a>
            </p>
          </div>

          <div className="col-lg-2">
            <h6 className="mb-4"> Get in Touch</h6>
            <span>
            <a href="https://www.linkedin.com/company/mundum-ag-page/"><i className="footer-icons fab btn-outline-dark fa-linkedin fa-2x"></i></a>
            </span>
            <span>
            <a href="https://instagram.com/mundum.official"><i className="footer-icons fab btn-outline-dark fa-instagram fa-2x"></i></a>
            </span>
            <span>
            <a href="https://twitter.com/mundum_official"><i className="footer-icons fab btn-outline-dark fa-twitter fa-2x"></i></a>
            </span>
            <span>
              <a href="https://t.me/mundum_official"><i className="footer-icons fab btn-outline-dark fa-telegram fa-2x"></i></a>
            </span>
            <span>
              <a href="https://discord.gg/TSX7BtAZ"><i className="footer-icons fab btn-outline-dark fa-discord fa-2x"></i> </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
