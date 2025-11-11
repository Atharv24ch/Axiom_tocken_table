import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface SortState {
    columnKey: string;
    direction: "asc" | "desc";
}

export interface UISliceState {
    activeFilters: Record<string, string[]>;
    sortState: SortState[];
    isFilterPanelOpen: boolean;
}

const initialState: UISliceState = {
    activeFilters: {},
    sortState: [],
    isFilterPanelOpen: false,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        toggleFilterPanel(state, action: PayloadAction<boolean | undefined>) {
            state.isFilterPanelOpen = action.payload ?? !state.isFilterPanelOpen;
        },
        setSortState(state, action: PayloadAction<SortState[]>) {
            state.sortState = action.payload;
        },
        setFilter(state, action: PayloadAction<{ key: string; values: string[] }>) {
            const { key, values } = action.payload;
            state.activeFilters[key] = values;
        },
        clearFilter(state, action: PayloadAction<string>) {
            delete state.activeFilters[action.payload];
        },
        resetAllFilters(state) {
            state.activeFilters = {};
        },
    },
});

export const { toggleFilterPanel, setSortState, setFilter, clearFilter, resetAllFilters } =
    uiSlice.actions;

export default uiSlice.reducer;
