import React from "react";

// material-ui icons
import BallotIcon from "@mui/icons-material/Ballot";
import DescriptionIcon from "@mui/icons-material/Description";

function Accordion(props) {
  const { desc, contractAddress, tokenId, chain, creatorEarnings } = props;

  return (
    <div className="accordion" id="accordionPanelsStayOpenExample">
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseOne"
            aria-expanded="true"
            aria-controls="panelsStayOpen-collapseOne"
          >
            <DescriptionIcon />
            &emsp;<strong>Description</strong>
          </button>
        </h2>
        <div
          id="panelsStayOpen-collapseOne"
          className="accordion-collapse collapse show"
        >
          <div className="accordion-body">{desc}</div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseThree"
            aria-expanded="false"
            aria-controls="panelsStayOpen-collapseThree"
          >
            <BallotIcon />
            &emsp;<strong>Details</strong>
          </button>
        </h2>
        <div
          id="panelsStayOpen-collapseThree"
          className="accordion-collapse collapse"
        >
          <div className="accordion-body">
            <table style={{ width: "100%" }}>
              <tr>
                <td>Contract Address</td>
                <td align="right">
                  <b>{contractAddress}</b>
                </td>
              </tr>
              <tr>
                <td>Token ID</td>
                <td align="right">
                  <b>{tokenId}</b>
                </td>
              </tr>
              <tr>
                <td>Token Standard</td>
                <td align="right">
                  <b>ERC-721</b>
                </td>
              </tr>
              <tr>
                <td>Chain ID</td>
                <td align="right">
                  <b>{chain}</b>
                </td>
              </tr>
              <tr>
                <td>Creator Earnings</td>
                <td align="right">
                  <b>{creatorEarnings} %</b>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Accordion;
