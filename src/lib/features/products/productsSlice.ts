import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* ---------- TYPES ---------- */

export type Difficulty = {
  name: string;
  code: string;
};

export type ControllerType = {
  name: string;
};

/* ---------- STATE ---------- */

interface ProductsState {
  difficultySelection: Difficulty | null;
  controllerSelection: ControllerType | null;
}

/* ---------- INITIAL STATE ---------- */

const initialState: ProductsState = {
  difficultySelection: null,
  controllerSelection: null,
};

/* ---------- SLICE ---------- */

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setDifficultySelection: (
      state,
      action: PayloadAction<Difficulty>
    ) => {
      state.difficultySelection = action.payload;
    },

    setControllerSelection: (
      state,
      action: PayloadAction<ControllerType>
    ) => {
      state.controllerSelection = action.payload;
    },

    clearProductFilters: (state) => {
      state.difficultySelection = null;
      state.controllerSelection = null;
    },
  },
});

/* ---------- EXPORTS ---------- */

export const {
  setDifficultySelection,
  setControllerSelection,
  clearProductFilters,
} = productsSlice.actions;

export default productsSlice.reducer;
