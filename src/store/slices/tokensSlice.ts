import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Token } from "@/types/token";

export interface TokensState {
    items: Record<string, Token>;
    order: string[];
    selectedTokenId?: string;
    isLoading: boolean;
    error?: string;
}

const initialState: TokensState = {
    items: {},
    order: [],
    selectedTokenId: undefined,
    isLoading: false,
    error: undefined,
};

const tokensSlice = createSlice({
    name: "tokens",
    initialState,
    reducers: {
        setTokens(state, action: PayloadAction<Token[]>) {
            state.items = action.payload.reduce<Record<string, Token>>((acc, token) => {
                acc[token.id] = token;
                return acc;
            }, {});
            state.order = action.payload.map((token) => token.id);
        },
        updateToken(state, action: PayloadAction<Token>) {
            const token = action.payload;
            state.items[token.id] = token;
            if (!state.order.includes(token.id)) {
                state.order.push(token.id);
            }
        },
        selectToken(state, action: PayloadAction<string | undefined>) {
            state.selectedTokenId = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setError(state, action: PayloadAction<string | undefined>) {
            state.error = action.payload;
        },
        reset(state) {
            state.items = {};
            state.order = [];
            state.selectedTokenId = undefined;
            state.isLoading = false;
            state.error = undefined;
        },
    },
});

export const { setTokens, updateToken, selectToken, setLoading, setError, reset } =
    tokensSlice.actions;

export default tokensSlice.reducer;
