import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "./reducers/usersReducer";
const store = configureStore({
	reducer: {
		user: usersReducer,
	},
	// middleware: (getDefaultMiddleware) =>
	// 	getDefaultMiddleware().concat(browseApi.middleware),
});
export default store;
