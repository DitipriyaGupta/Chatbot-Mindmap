import axios from "axios";
import { DialogLoader } from "components/common/NewLoader";
import { useApiCall } from "components/common/appHooks.js";
import compareObj from "components/common/compareObj";
import {
	FEATURE_DISABLED_MESSAGE,
	REQUEST_CANCELED_MESSAGE,
} from "components/common/constants";
import { useOrgContext } from "context/OrgContext";
import { useUserContext } from "context/UserContext";
import { useCallback } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import orgConfig from "staticData/orgConfig.json";

const ChatConfigContext = createContext();
/**
 * Hook to access chat configuration context
 * @returns {{
 *   chatConfig: {
 *     open: boolean,
 *     title: string,
 *     themeBackground: string,
 *     themeColor: string,
 *     chatColor: string,
 *     chatBackground: string,
 *     avatar: string,
 *     fontDifference: number,
 *     positionLeft: number,
 *     positionBottom: number,
 *     positionRight: number,
 *     suggestedQuestions: Array<{ question: string, id: number, answer: string, action_id:number }>,
 *     askEmail: boolean,
 *     welcomeText: Array<string>,
 *     loader: boolean,
 *     ga_id: string,
 *     instant_emailers: boolean,
 *     idle_user_emailers: boolean,
 *     redirect_url: string,
 * 	   message_limit: {
 *	     action_id: number,
 *	     daily_messages_limit: number,
 *	     limit_message:string,
 *	     enable: number,
 *	}
 *   },
 *   setChatConfig: (newConfig: {
 *     open: boolean,
 *     title: string,
 *     themeBackground: string,
 *     themeColor: string,
 *     chatColor: string,
 *     chatBackground: string,
 *     avatar: string,
 *     fontDifference: number,
 *     positionLeft: number,
 *     positionBottom: number,
 *     positionRight: number,
 *     suggestedQuestions: Array<{ question: string, id: number, answer: string, action_id:number }>,
 *     askEmail: boolean,
 *     welcomeText: Array<string>,
 *     loader: boolean,
 *     ga_id: string,
 *     instant_emailers: boolean,
 *     idle_user_emailers: boolean,
 *     redirect_url: string,
 * 	   message_limit: {
 *	    action_id: number,
 *	    daily_messages_limit: number,
 *	    limit_message:string,
 *	    enable: number,
 *	  }
 *   }) => void
 *   submitChatConfig: () => void,
 *   handleChatConfigReset: () => void,
 *   isModified: boolean,
 *   businessActions: Array<{name:string, type:number, id:number, detail:{link:string}}>,
 *   setBusinessAction: () => void,
 * }}
 */
export function useChatConfigContext() {
	return useContext(ChatConfigContext);
}

export function ChatConfigProvider({ children }) {
	const { Post, Get } = useApiCall();
	const axiosCancelSource = axios.CancelToken.source();
	const history = useHistory();
	const {
		org: { host_url },
		isDemo,
	} = useOrgContext();
	const {
		user: { is_god },
	} = useUserContext();

	const [loading, setLoading] = useState(false);
	const [businessActions, setBusinessAction] = useState([]);

	const [initialState, setInitialState] = useState({
		open: true,
		title: "BeyondChats AI Support",
		themeBackground: "#2872FA",
		themeColor: "white",
		chatColor: "black",
		chatBackground: "white",
		avatar: null,
		fontDifference: 0,
		positionLeft: "auto",
		positionBottom: 25,
		positionRight: 25,
		suggestedQuestions: [
			{ question: "What is BeyondChats?" },
			{ question: "What services do you offer?" },
			{ question: "How to contact you?" },
			{ question: "What are the pricing plans of BeyondChats?" },
			{ question: "How do I get started?" },
		],
		askEmail: true,
		welcomeText: [
			"Hi there! Welcome to BeyondChats",
			"What brings you here today?",
			"Ask me anything about BeyondChats",
		],
		message_limit: {
			action_id: null,
			daily_messages_limit: 100,
			limit_message: "Your Daily Limit Reached!",
			enable: 0,
		},
		loader: null,
		ga_id: null,
		redirect_url: "https://beyondchats.com",
	});

	const [chatConfig, setChatConfig] = useState(() => initialState);
	const [isModified, setIsModified] = useState(false);
	 useEffect(() => {
	// 	setLoading(true);
	// 	Get(1, "get_org_config", {
	// 		host_url: decodeURIComponent(host_url),
	// 		send_suggested_question_answer: true,
	// 	})
	// 		.then((res) => {
				
	// 		})
	// 		.finally(() => setLoading(false));
	// 	return () => axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
	
	let data = orgConfig;
	setInitialState((prev) => ({ ...prev, ...data }));
	updateChatConfig(data);
}, [host_url]);
const updateChatConfig = useCallback((props) => {
	setChatConfig((prev) => ({ ...prev, ...props }));
}, []);
	

	useEffect(() => {
		window.postMessage(
			{ type: "beyondChatConfigData", payload: chatConfig },
			window.location.origin
		);
	}, [chatConfig]);

	function objectToFormData(obj, formData = new FormData(), parentKey = "") {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const value = obj[key];
				const formKey = parentKey ? `${parentKey}[${key}]` : key;
				if (value instanceof File || value === null) {
					// If the value is a File object, simply append it to FormData
					formData.append(formKey, value);
				} else if (typeof value === "object" && !Array.isArray(value)) {
					// If the value is an object (excluding arrays), recursively process it
					objectToFormData(value, formData, formKey);
				} else if (Array.isArray(value)) {
					// If the value is an array, loop through its items and append each one
					for (let i = 0; i < value.length; i++) {
						const arrayFormKey = `${formKey}[${i}]`;
						if (value[i] instanceof File) {
							formData.append(arrayFormKey, value[i]);
						} else if (typeof value[i] === "object") {
							// If the array element is an object, recursively process it
							objectToFormData(value[i], formData, arrayFormKey);
						} else {
							formData.append(arrayFormKey, value[i]);
						}
					}
				} else {
					// For all other types (e.g., strings, numbers), append them as-is
					formData.append(formKey, value);
				}
			}
		}
		return formData;
	}

	useEffect(() => {
		const newObj = compareObj(initialState, chatConfig);
		setIsModified(!!Object.keys(newObj).length);
	}, [chatConfig, initialState]);

	useEffect(() => {
		// TODO: enable after not using Local storage in Get Post
		// const unblock = history.block((location) => {
		//   if (isModified) {
		//     return 'You have unsaved changes. Are you sure you want to leave this page?';
		//   }
		// });

		const onBeforeUnload = (e) => {
			if (isModified) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", onBeforeUnload);
		return () => {
			// unblock();
			window.removeEventListener("beforeunload", onBeforeUnload);
		};
	}, [history, isModified]);

	const submitChatConfig = async () => {
		if (isDemo && !is_god) {
			toast.info(FEATURE_DISABLED_MESSAGE);
			return;
		}
		try {
			const res = await Post(
				1,
				"setup_org_config",
				objectToFormData(compareObj(initialState, chatConfig))
			);
			if (res.data.status_code === 200) {
				toast.success("Changes saved successfully");
				setInitialState(chatConfig);
			} else {
				toast.error("something went wrong");
			}
		} catch (error) {
			toast.error("something went wrong");
			console.error(error);
		}
	};

	async function handleChatConfigReset() {
		updateChatConfig(initialState);
	}

	return (
		<ChatConfigContext.Provider
			value={{
				chatConfig,
				setChatConfig: updateChatConfig,
				submitChatConfig,
				handleChatConfigReset,
				isModified,
				businessActions,
				setBusinessAction,
			}}
		>
			{loading ? <DialogLoader /> : children}
		</ChatConfigContext.Provider>
	);
}
