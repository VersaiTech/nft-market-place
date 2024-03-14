import { React } from 'react';
import { useNavigate } from 'react-router-dom';

function ExploreAccordian({ state, filter, setFilter, getSingleCollection }) {
  const navigate = useNavigate();

  const handleCategorySelection = (category) => {
    navigate(`/explore/${category}`);
  };

  const customStyles = {
    margin: '10px',
    cursor: 'pointer',
  };

  return (
    <div className="accordion" id="accordionPanelsStayOpenExample">
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseOne"
            aria-expanded="false"
            aria-controls="panelsStayOpen-collapseOne"
          >
            Collections
          </button>
        </h2>
        <div
          id="panelsStayOpen-collapseOne"
          className="accordion-collapse collapse"
        >
          <div className="accordion-body">
            <input
              className="collection-input"
              type="text"
              placeholder="Filter by Collection Address"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  //apply filter
                  getSingleCollection(filter, state.chain.id);
                }
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <button
                className="btn btn-secondary"
                onClick={() => getSingleCollection(filter, state.chain.id)}
              >
                Filter
              </button>

              <button
                style={{
                  marginTop: '10px',
                }}
                className="btn btn-outline-secondary"
                onClick={() => navigate(`/explore/all`)}
              >
                All Nfts
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseTwo"
            aria-expanded="false"
            aria-controls="panelsStayOpen-collapseTwo"
          >
            Categories
          </button>
        </h2>

        <div
          id="panelsStayOpen-collapseTwo"
          className="accordion-collapse collapse"
        >
          <div
            className="accordion-body"
            style={{ height: '21vw', overflow: 'auto' }}
          >
            <ul className="categories">
              <li>
                <input
                  style={customStyles}
                  type="radio"
                  id="1cb"
                  name="catergory-selection"
                  onChange={() => handleCategorySelection('Arts')}
                />
                <label
                  style={{ cursor: 'pointer', display: 'inline' }}
                  htmlFor="1cb"
                >
                  Arts
                </label>
              </li>

              <li>
                <input
                  style={customStyles}
                  type="radio"
                  id="2cb"
                  name="catergory-selection"
                  onChange={() => handleCategorySelection('Collectibles')}
                />
                <label
                  style={{ cursor: 'pointer', display: 'inline' }}
                  htmlFor="2cb"
                >
                  Collectibles
                </label>
              </li>

              <li>
                <input
                  style={customStyles}
                  type="radio"
                  id="3cb"
                  name="catergory-selection"
                  onChange={() => handleCategorySelection('Sports')}
                />
                <label
                  style={{ cursor: 'pointer', display: 'inline' }}
                  htmlFor="3cb"
                >
                  Sports
                </label>
              </li>

              <li>
                <input
                  style={customStyles}
                  type="radio"
                  id="4cb"
                  name="catergory-selection"
                  onChange={() => handleCategorySelection('Utility')}
                />
                <label
                  style={{ cursor: 'pointer', display: 'inline' }}
                  htmlFor="4cb"
                >
                  Utility
                </label>
              </li>

              <li>
                <input
                  style={customStyles}
                  type="radio"
                  id="5cb"
                  name="catergory-selection"
                  onChange={() => handleCategorySelection('Trading Cards')}
                />{' '}
                <label
                  style={{ cursor: 'pointer', display: 'inline' }}
                  htmlFor="5cb"
                >
                  Trading Cards
                </label>
              </li>

              <li>
                <input
                  style={customStyles}
                  type="radio"
                  id="6cb"
                  name="catergory-selection"
                  onChange={() => handleCategorySelection('Virtual World')}
                />{' '}
                <label
                  style={{ cursor: 'pointer', display: 'inline' }}
                  htmlFor="6cb"
                >
                  Virtual Worlds
                </label>
              </li>

              <li>
                <input
                  style={customStyles}
                  type="radio"
                  id="7cb"
                  name="catergory-selection"
                  onChange={() => handleCategorySelection('Domain Names')}
                />{' '}
                <label
                  style={{ cursor: 'pointer', display: 'inline' }}
                  htmlFor="7cb"
                >
                  Domain Names
                </label>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExploreAccordian;
