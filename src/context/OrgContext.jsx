import { useApiCall } from "components/common/appHooks.js";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { matchPath, useHistory, useLocation } from "react-router-dom";
import { useUserContext } from "./UserContext";
import { DEMO_ORG_ID } from "components/common/constants";

const OrgContext = createContext();
/**
 * Type definition for organization object
 * @typedef {{
 *    id: number,
 *    name: string,
 *    slug: string,
 *    host_url: string,
 *    data_link: string,
 * }} Organization
 */

/**
 * Hook to access chat configuration context
 * @returns {{
 *  org: Organization,
 *  setOrg: (org: Organization) => void,
 *  getOrgs: () => void,
 *  orgs: Array<Organization>,
 *  isDemo: boolean,
 * }}
 */
export function useOrgContext() {
	return useContext(OrgContext);
}

export function OrgProvider({ children }) {
	const { Get } = useApiCall();
	const {
		user: { access_token },
	} = useUserContext();

	const location = useLocation();
	const history = useHistory();
	const match = matchPath(location.pathname, {
		path: "/:org/",
		exact: false,
		strict: false,
	});
	const [org, setOrg] = useState({
		host_url: match?.params?.org
			? decodeURIComponent(match?.params?.org)
			: localStorage.getItem("host_url"),
		id: localStorage.getItem("org_id"),
		name: localStorage.getItem("org_name"),
		data_link: localStorage.getItem("org_data_link"),
	});
	const isDemo = useMemo(
		() => [DEMO_ORG_ID].includes(parseInt(org.id)),
		[org.id]
	);
	const [orgs, setOrgs] = useState([{
		"status": "success",
		"status_code": 200,
		"message": "Organizations fetched successfully!",
		"data": [
			{
				id: 10,
				name: "BeyondChats",
				slug: "beyondchats-a2e44",
				host_url: "beyondchats",
				role_ids: [
					1
				]
			}
		]
	}]);

	function isNotOrg() {
		return [
			"/organization",
			"/email-verification",
			"/forgot-password",
		].includes(history.location.pathname);
	}
	const updateOrg = useCallback((org) => {
		localStorage.setItem("host_url", org.host_url);
		localStorage.setItem("org_id", org.id);
		localStorage.setItem("org_name", org.name);
		localStorage.setItem("org_data_link", org.data_link);
		setOrg((prev) => ({ ...prev, ...org }));
	}, []);

	const getOrgs = async () => {
		try {
			// const response = await Get(1, "get_user_orgs");
			// const orgs = response.data.data;
			// console.log(orgs);
			
			if (true) {
				if (
					(!isNotOrg() && !orgs.some((obj) => obj.host_url === org.host_url)) ||
					orgs.length === 1
				) {
					history.replace(`/${encodeURIComponent(orgs[0].host_url)}/`);
					return updateOrg(orgs[0]);
				}
			   updateOrg(org);
			}
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		if (access_token && !orgs.length) {
			getOrgs();
		}
	}, [access_token]);

	return (
		<OrgContext.Provider
			value={{
				org,
				setOrg: updateOrg,
				orgs,
				getOrgs,
				isDemo,
			}}
		>
			{children}
		</OrgContext.Provider>
	);
}
