import { combineReducers, compose } from 'redux';
import { configureStore } from '@reduxjs/toolkit';

// Import your reducers here
import { authReducer, userReducer, chainReducer } from './reducer';

// Devtools
const enhancers = compose(
  typeof window !== 'undefined' && window.devToolsExtension
    ? window.devToolsExtension()
    : (f) => f,
);

//RootReducer
const rootReducer = combineReducers({
  // Add your reducers here
  authReducer,
  userReducer,
  chainReducer,
});

//Creating Store
const store = configureStore({
  reducer: rootReducer,
  devTools: enhancers,
});

export default store;
