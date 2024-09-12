import { createContext, useContext, useEffect, useState } from "react";
import { useOrgContext } from "./OrgContext";
import { PLAN_DISABLED, PLAN_UNLIMITED } from "components/common/constants";

const PlanContext = createContext();
/**
 * Type definition for organization object
 * @typedef {{
 *   name: string,
 *   leads: number,
 *   members: number,
 *   training: number,
 *   chats: number,
 *   live_chat: number,
 * }} Plan
 */

/**
 * Hook to access chat configuration context
 * @returns {{
 *  plan: Plan,
 * }}
 */
export function usePlanContext() {
	return useContext(PlanContext);
}

export function PlanProvider({ children }) {
	// const axiosCancelSource = axios.CancelToken.source();
	const { org } = useOrgContext();
	const [plan, setPlan] = useState({
		leads: PLAN_UNLIMITED,
		members: PLAN_UNLIMITED,
		training: PLAN_UNLIMITED,
		chats: PLAN_UNLIMITED,
		live_chat: PLAN_DISABLED,
		name: "enterprise",
	});

	useEffect(() => {
		if ([1, 24].includes(parseInt(org.id))) {
			setPlan({
				chats: 200,
				members: 1,
				training: 200,
				leads: 2,
				live_chat: PLAN_DISABLED,
				name: "startup",
			});
		} else {
			setPlan({
				leads: PLAN_UNLIMITED,
				members: PLAN_UNLIMITED,
				training: PLAN_UNLIMITED,
				chats: PLAN_UNLIMITED,
				live_chat: [10, 8].includes(parseInt(org.id))
					? PLAN_UNLIMITED
					: PLAN_DISABLED,
				name: "enterprise",
			});
		}
	}, [org.id]);

	// const getPlans = async () => {
	// 	try {
	// 		const response = await Get(1, "get_org_plan");
	// 		const plan = response.data.data;
	// 		setPlan(plan);
	// 	} catch (error) {
	// 		console.error(error);
	// 	}
	// };

	return (
		<PlanContext.Provider value={{ plan }}>{children}</PlanContext.Provider>
	);
}
