import React, { useEffect } from 'react';
import './success.css';

export const Success = () => {
  useEffect(() => {
    sessionStorage.removeItem(`current-nftprice`);
    sessionStorage.removeItem(`current-user`);

    // const sid = Cookies.get("__stripe_sid");

    // const urlSearchParams = new URLSearchParams(window.location.search);

    // const paymentIntent = urlSearchParams.get("payment_intent");
    // const clientSecret = urlSearchParams.get("payment_intent_client_secret").split("_secret_")[1];

    // const url = window.location.href;
    // const sessionId = url.match(/session_id=([^/]*)/)[1];

    // console.log("session_id - " + sessionId);
    // console.log("payment_intent - " + paymentIntent);
    // console.log("client_secret - " + clientSecret);
    // console.log("sid - " + sid);

    const closePaymentWindow = setTimeout(() => {
      window.close();
    }, 120000);

    return () => {
      clearTimeout(closePaymentWindow);
    };
  }, []);

  return (
    <div className="success-container">
      <h1>Payment Successful</h1>
      <p>
        Congratulations! That was the best decision of your life! <br />
        Go to your profile to see the nft you just bought.
      </p>
    </div>
  );
};
