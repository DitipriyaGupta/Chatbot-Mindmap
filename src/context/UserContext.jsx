import Loader from "components/common/NewLoader";
import { checkAuth } from "components/common/common";
import { createContext, useContext, useLayoutEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const UserContext = createContext();
/**
 * Hook to access chat configuration context
 * @returns {{
 *  user:{
 *    email: string,
 *    is_god: boolean,
 *    name: string,
 *    access_token: string,
 *  },
 * setUser: (user: {
 *    email: string,
 *    is_god: boolean,
 *    name: string,
 *    access_token: string,
 *  }) => void,
 * }}
 */
export function useUserContext() {
	return useContext(UserContext);
}

export function UserProvider({ children }) {
	const [user, setUser] = useState({
		email: "beyondchat@gmail.com",
		is_god: false,
		name: "BeyondChat",
		access_token: "localStorage.getItem(refresh_token)",
		browser: "Chrome",
		city: "Lucknow",
		country:{id: 103, name: 'India', code: 'IN', phone_code: '91'},
		created_at:"2024-08-15T05:34:23.000000Z",
		device:"desktop",
		email_verified_at:null,
		id:3929,
		os: "Windows",
		password_updated: 0,
		phone: "6392832171",
		updated_at: "2024-08-22T08:17:41.000000Z"
	});
	const [loading, setLoading] = useState(true);
	const history = useHistory();
	// useLayoutEffect(() => {
	// 	const fetchAuthStatus = async () => {
	// 		try {
    //     if (
	// 				["/login", "/email-verification", "/forgot-password"].includes(
	// 					history.location.pathname
	// 				)
	// 			) {
	// 				return;
	// 			}
	// 			if (!user.access_token) {
	// 				throw new Error("Not Logged In");
	// 			}
	// 			const data ={}
	// 			const res = await checkAuth();
	// 			console.log(res);
				
	// 			setUser((prev) => ({ ...prev, ...res.data.data }));
	// 		} catch (error) {
	// 			console.error(error);
	// 			// setUser({});
	// 			// history.push("/login", { from: history.location });
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};
	// 	fetchAuthStatus();
	// }, []);

	// if (loading) {
	// 	return <Loader firstPage={true} name="routes" />;
	// }

	return (
		<UserContext.Provider
			value={{
				user,
				setUser,
			}}
		>
			{children}
		</UserContext.Provider>
	);
}
