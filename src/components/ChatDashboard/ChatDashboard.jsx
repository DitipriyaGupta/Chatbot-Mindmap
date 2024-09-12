import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { Suspense, lazy, useState } from "react";
import { Link, useParams } from "react-router-dom";
import classNames from "classnames";

import UserChatLeftPane from "./UserChatLeftPane";
import UserInnerChat from "./UserInnerChat";

import styles from "./ChatDashboard.module.css";
// import addBeyondChat from "../common/addBeyondChat";
import { Button } from "@mui/material";
import { ChatConfigProvider } from "components/Config/ChatConfigContext/ChatConfigContext";
import { useOrgContext } from "context/OrgContext";

const AnswerReferencePane = lazy(
	() => import("./SidePane/AnswerReferencePane")
);

const UserDetailsPane = lazy(() => import("./SidePane/UserDetailsPane"));

const ChatDashboard = () => {
	const { chatId } = useParams();
	const {
		org: { host_url },
	} = useOrgContext();
	// TODO: Move this to a context in future
	const [currUser, setCurrUser] = useState({});
	return (
		<>
			<ChatConfigProvider>
				<div className={styles.chat_page_grid}>
					<UserChatLeftPane />
					<div
						className={classNames(
							styles.chat_container,
							{ no_chats: !chatId },
							{ [styles.chat_active]: chatId }
						)}
					>
						<div
							className={classNames(styles.chat_container_outer, {
								[styles.hidden]: chatId,
							})}
							id={styles.chat_container_outer}
						>
							<div className={styles.justifyCenter}>
								<>
									Looks like your website visitors have not yet started chatting{" "}
									<br />
									In the meantime you can <br /> <br />
									<div
										style={{
											display: "flex",
											gap: 10,
											justifyContent: "center",
										}}
									>
										<Button component={Link} to={`/${host_url}/config`}>
											Customize Chatbot
										</Button>
										<Button
											color="secondary"
											component={Link}
											to={`/${host_url}/mind-map`}
										>
											Train Chatbot
										</Button>
									</div>
								</>
							</div>
						</div>
						<div
							className={classNames(styles.chat_container_outer, {
								[styles.hidden]: !chatId,
							})}
						>
							<UserInnerChat currUser={currUser} setCurrUser={setCurrUser} />
						</div>
					</div>
					{/* Reference section */}
					<Suspense>
						<AnswerReferencePane />
					</Suspense>
					<Suspense>
						<UserDetailsPane currUser={currUser} />
					</Suspense>
				</div>
			</ChatConfigProvider>
			{/* <Footer /> */}
		</>
	);
};

export default withErrorBoundary(ChatDashboard, "ChatDashboard");
