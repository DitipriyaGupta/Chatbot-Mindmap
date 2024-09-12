import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

const usersReducer = createSlice({
	name: "users",
	initialState,
	reducers: {
		addUser(state, { payload }) {
			state[payload.id] = window.structuredClone(payload);
		},
	},
});

export const { addUser } = usersReducer.actions;

export default usersReducer.reducer;
