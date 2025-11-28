// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import collectionsReducer from "./slices/collectionsSlice";

export const store = configureStore({
  reducer: {
    collections: collectionsReducer,
  },
});

// Tipos automáticos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
