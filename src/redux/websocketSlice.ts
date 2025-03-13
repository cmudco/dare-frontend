import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState/websocket";



const websocketSlice = createSlice({
    name: "websocket",
    initialState,
    reducers: {
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
            if (action.payload) {
                state.error = null;
            }
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const { setConnectionStatus, setError, clearError } =
    websocketSlice.actions;
export default websocketSlice.reducer;
