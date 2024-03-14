import React from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../Navbar';
import Carousel from '../Carousel';
import Feature from '../Feature';
import Footer from '../Footer';
import homepageImg from '../../images/homepageImg.jpg';
import noTrasFees from '../../images/home page icons/noTrasFees.png';
import star from '../../images/home page icons/star.png';
import fast from '../../images/home page icons/fast.png';
import sell from '../../images/home page icons/sell.png';
import boy from '../../images/home page icons/boy.png';

//NFTCard Images
import exploremore from '../../images/exploremore.png';
import { CATEGORY } from '../../utils/category';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import Card from '../Card';
import Login from '../Modals/login';

const NFTCard = (props) => {
  const navigate = useNavigate();
  return (
    <div
      style={{ marginTop: '25px' }}
      className="prc-col homepage-cards col-lg-3 col-md-4 col-sm-6"
    >
      <div
        className="card"
        style={{ boxShadow: '0px 0px 10px -8px #000000c7' }}
      >
        <img
          src={props.src}
          style={{ padding: '12px' }}
          className="card-img-top"
          alt="..."
        />
        <div className="card-body">
          <p style={{ fontWeight: 'bold' }}>{props.title}</p>
          <p style={{ color: '#11111175', fontSize: 'small' }}>
            Buy and sell artworks of your favorite artists and support them
          </p>
          <button
            style={{
              borderRadius: '30px',
              padding: '0 15px 2px',
              minWidth: '7rem',
            }}
            className="btn btn-large btn-block btn-outline-dark"
            type="button"
            onClick={() => navigate(`/explore/${props.path}`)}
          >
            {props.title === 'CoolGIRL_part1...'
              ? 'Buy NFT'
              : 'Browse artworks'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Hompage = ({ trendingNft }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.authReducer.currentUser);
  const [loginModal, setLoginModal] = useState(false);

  return (
    <React.Fragment>
      <div className="title-section">
        <div className="container">
          <Navbar />
          <section className="home-section">
            <div className="container row">
              <div className="col-lg-6">
                <h1 className="main-title">
                  The Next <img src={star} alt="" width="55" />
                  <br /> Digital <span style={{ color: '#24722e' }}>
                    NFTs
                  </span>{' '}
                  Artwork
                </h1>
                <p style={{ marginTop: '2rem' }} className="main-para">
                  Create and Trade Digital Assets.
                </p>
                <p className="main-para">
                  Create NFTs, make personalized eco-system share, list and sell
                  Digital Assets
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/explore/all')}
                  className="btn explore-btn"
                >
                  Explore
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) setLoginModal(true);
                    user && navigate('/create');
                  }}
                  className="btn create-btn"
                >
                  Create NFT
                </button>
              </div>

              <div className="col-lg-6">
                <img className="title-img" src={homepageImg} alt="title-img" />
              </div>
            </div>
          </section>
          <Login loginModal={loginModal} setLoginModal={setLoginModal} />
        </div>
      </div>
      <div>
        <Carousel />
      </div>
      <section className="features container">
        <h1>NFT Minting Made Easy</h1>
        <div className="row">
          <Feature
            name="Sell Your NFT"
            icon={sell}
            description="At CoinWiz Marketplace, we understand that selling your NFTs should be a seamless and straightforward process. That's why we've designed our platform to ensure that you can showcase and sell your digital creations effortlessly"
          />
          <Feature
            name="Super Fast"
            icon={fast}
            description="We believe in the power of speed and efficiency when it comes to selling your NFTs. We've built a platform that ensures your NFTs reach the market quickly and seamlessly."
          />
          <Feature
            name="No Transaction Fees"
            icon={noTrasFees}
            description="At CoinWiz Marketplace, we believe in providing a fair and transparent platform for selling your NFTs. That's why we've eliminated transaction fees, allowing you to keep more of your earnings(except the gas fees of blockchain transaction)."
          />
          <Feature
            name="E Commerce Experience"
            icon={fast}
            description="we strive to provide you with a seamless and intuitive e-commerce experience. We've designed our platform to offer the convenience and features you expect from a top-notch online marketplace. ."
          />
        </div>
      </section>

      <section className="container features" style={{ paddingBottom: '1rem' }}>
        <h1>Browse by Categories</h1>
        <div className="row">
          {CATEGORY.map((nft, index) => (
            <NFTCard
              src={nft.image}
              title={nft.name}
              path={nft.value}
              key={index}
            />
          ))}
          <NFTCard src={exploremore} title={'Explore More'} path={'all'} />

          {/* {
    name: "Explore More",
    value: "all",
    image: exploremore,
  }, */}
        </div>
      </section>

      <section
        style={{ position: 'relative', width: '100%' }}
        className="NFT-section"
        id="about"
      >
        <h1 className="home-page-create-nft-heading">
          Create and sell your NFTs
        </h1>
        <div className="home-page-create-nft-boy">
          <img src={boy} alt="" width="400px" />
        </div>
        <div className="home-page-create-nft">
          <div>
            <img src={star} alt="" width="30px" />
            <h5>&nbsp; Step - 01</h5>
            <h5
              style={{ color: 'white', marginTop: '5px', marginLeft: '25px' }}
            >
              Create account and setup your wallet
            </h5>
            <p>
              Create your own proprietary wallet to manage both buyers and
              sellers. Use card and other tokens to pay from the wallet.
            </p>
          </div>
          <div>
            <img src={star} alt="" width="30px" />
            <h5>&nbsp; Step - 02</h5>
            <h5
              style={{ color: 'white', marginTop: '5px', marginLeft: '25px' }}
            >
              Create your collection
            </h5>
            <p>
              Compete with the most iconic wallets in the market by using our
              platform. Use cards and other tokens to pay from the wallet.
            </p>
          </div>
          <div>
            <img src={star} alt="" width="30px" />
            <h5>&nbsp; Step - 03</h5>
            <h5
              style={{ color: 'white', marginTop: '5px', marginLeft: '25px' }}
            >
              Add your NFTs
            </h5>
            <p>
              Our platform integrates to any Enterprise - level ecosystem
              seamlessly. Use card and other tokens to pay from wallet.
            </p>
          </div>
        </div>
        <div className="home-page-create-nft2" style={{ textAlign: 'left' }}>
          <img src={star} alt="" width="30px" />
          <h5>&nbsp; Step - 04</h5>
          <h5 style={{ color: 'white', marginTop: '5px', marginLeft: '25px' }}>
            Sell your NFTs
          </h5>
          <p>Personalize your eco-system. List and sell Digital Assets.</p>
        </div>
        <button
          className="NFT-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (!user) setLoginModal(true);
            user && navigate('/create');
          }}
        >
          Create NFT now
        </button>
      </section>

      <section className="container features" style={{ paddingBottom: '1rem' }}>
        <h1>Trending NFTs</h1>
        <div className="row">
          {trendingNft.map((nft, index) => (
            <Card item={nft} key={index} />
          ))}
        </div>
      </section>

      <section className="footer">
        <Footer />
      </section>
    </React.Fragment>
  );
};
