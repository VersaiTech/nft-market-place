import { DEFAULT_CHAIN } from '../utils/contants';

const initialAuthState = {
  currentUser: null,
};

const initialUserData = {
  userCollection: {},
};

export const authReducer = (state = initialAuthState, action) => {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload,
      };
    case 'UPDATE_CURRENT_USER':
      return {
        ...state,
        currentUser: {
          ...action.payload,
        },
      };
    case 'UPDATE_PROFILE_PIC_URL':
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          profile_url: action.payload,
        },
      };
    case 'RESET_CURRENT_USER':
      return {
        currentUser: null,
      };
    default:
      return state;
  }
};

export const chainReducer = (state = DEFAULT_CHAIN, action) => {
  switch (action.type) {
    case 'SET_CURRENT_CHAIN':
      return {
        ...state,
        id: action.payload.id,
        name: action.payload.name,
        symbol: action.payload.symbol,
        hex: action.payload.hex,
      };
    default:
      return state;
  }
};

export const userReducer = (state = initialUserData, action) => {
  switch (action.type) {
    case 'SET_USER_COLLECTION':
      return {
        ...state,
        userCollection: action.payload,
      };

    default:
      return state;
  }
};

// const AllReducers = combineReducers({
//   authReducer,
//   userReducer,
// });

// export default AllReducers;
