import React from 'react';

export const Admin = () => {
  return (
    <div className="container mt-5 admin">
      <h1 className="text-center mb-4" style={{ color: 'black' }}>
        Admin Page
      </h1>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th className="border-0">Wallet Address</th>
                  <th className="border-0">NFT Address</th>
                  <th className="border-0">NFT Price</th>
                  <th className="border-0">NFT Token ID</th>
                  <th className="border-0">Payment Time</th>
                  <th className="border-0">Transfer</th>
                </tr>
              </thead>
              <tbody>
                {/* {tableData.map((row) => ( */}
                <tr key="row.id">
                  <td>row.column1</td>
                  <td>row.column2</td>
                  <td>row.column3</td>
                  <td>row.column4</td>
                  <td>row.column4</td>
                  <td>
                    <button className="btn btn-secondary">Transfer</button>
                  </td>
                </tr>
                <tr key="row.id">
                  <td>row.column1</td>
                  <td>row.column2</td>
                  <td>row.column3</td>
                  <td>row.column4</td>
                  <td>row.column4</td>
                  <td>
                    <button className="btn btn-secondary">Transfer</button>
                  </td>
                </tr>
                <tr key="row.id">
                  <td>row.column1</td>
                  <td>row.column2</td>
                  <td>row.column3</td>
                  <td>row.column4</td>
                  <td>row.column4</td>
                  <td>
                    <button className="btn btn-secondary">Transfer</button>
                  </td>
                </tr>
                <tr key="row.id">
                  <td>row.column1</td>
                  <td>row.column2</td>
                  <td>row.column3</td>
                  <td>row.column4</td>
                  <td>row.column4</td>
                  <td>
                    <button className="btn btn-secondary">Transfer</button>
                  </td>
                </tr>
                {/* ))} */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
