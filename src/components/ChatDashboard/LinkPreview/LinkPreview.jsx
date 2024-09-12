import React, { useEffect, useState } from "react";
import styles from "./LinkPreview.module.css";
import classNames from "classnames";
import getLinkMetaData from "components/common/getLinkMetaData";
import saveErrorLogs from "components/common/saveErrorLogs";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { useChatConfigContext } from "components/Config/ChatConfigContext/ChatConfigContext";

const LinkPreview = ({ message, setLinkPreviewError }) => {
	const [loading, setLoading] = useState(true);
	const [metadata, setMetadata] = useState({});
  const {
		chatConfig: { avatar },
	} = useChatConfigContext();
	useEffect(() => {
		getLinkMetaData(message)
			.then((data) => {
				let url;
				try {
					url = new URL(message);

					url = url.toString().replace(/(https?:\/\/)?(www.)?/i, "");

					if (url.indexOf("/") !== -1) {
						url = url.split("/")[0];
					}
				} catch (error) {}
				setMetadata({ ...data.data, url: url });
				setLoading(false);
			})
			.catch((e) => {
				console.error(message, e);
				setLinkPreviewError(true);
				saveErrorLogs(e);
			});
	}, [message]);

	return (
		<a
			href={message}
			target="_blank"
			className={classNames(styles.container)}
			rel="noreferrer"
			data-ignore-click-preview
		>
			<div className={styles.image_container}>
				<img
					src={metadata.image_url}
					alt=""
					height={50}
					className={classNames({ [styles.skeleton]: loading })}
          onError={(e) => {
            console.error("error in logo Provided");
            e.currentTarget.onerror = null;
            e.currentTarget.src = avatar;
          }}
				/>
			</div>
			<div className={styles.text_container}>
				<p
					className={classNames(
						styles.title,
						{ [styles.clip]: metadata.description },
						{ [styles.skeleton]: loading }
					)}
				>
					{metadata.title}
				</p>
				<p
					className={classNames(
						styles.description,
						{ [styles.clip]: metadata.description },
						{ [styles.skeleton]: loading }
					)}
				>
					{metadata.description}
				</p>
				{metadata.url ? (
					<p
						className={classNames(styles.sub_description, {
							[styles.skeleton]: loading,
						})}
					>
						{metadata.url}
					</p>
				) : null}
			</div>
		</a>
	);
};

export default withErrorBoundary(LinkPreview, "LinkPreview");
