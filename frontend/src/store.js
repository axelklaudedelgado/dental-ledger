import { configureStore } from '@reduxjs/toolkit';
import clientReducer from './reducers/clientSlice'


const store = configureStore({
  reducer: {
    clients: clientReducer,
  },
});

export default store;
