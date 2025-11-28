import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createCollection } from "../../services/api";

export interface Collection {
  id?: number;
  title: string;
  author: string;
  moviesCount: number;
  movies: string[];      // URLs de posters cuando las uses aquí
  isPrivate: boolean;
  createdBy: string;
  description?: string;
}

interface CollectionsState {
  list: Collection[];
  loading: boolean;
  error: string | null;
}

const initialState: CollectionsState = {
  list: [],
  loading: false,
  error: null,
};

// Payload que viene del componente CreateCollection
export interface CollectionPayload {
  title: string;
  description?: string;
  movies: number[];   // IDs de movies
  isPrivate: boolean;
}

export const createCollectionAsync = createAsyncThunk(
  "collections/createCollection",
  async (payload: CollectionPayload, thunkAPI) => {
    try {
      // Llama a la API que inserta en Supabase
      const newCollection = await createCollection(payload);
      return newCollection; // lo que devuelva tu servicio (fila de collections)
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const collectionsSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCollectionAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createCollectionAsync.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          // si quieres, mapea aquí action.payload a tu tipo Collection,
          // o simplemente recarga desde getCollections después de crear
          state.list.push(action.payload as any);
        }
      )
      .addCase(createCollectionAsync.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Error creating collection";
      });
  },
});

export default collectionsSlice.reducer;
