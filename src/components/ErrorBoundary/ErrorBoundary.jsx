import React, { lazy, Suspense } from "react";

const Error = lazy(() => import("./Error"));
const AwaitingUpdate = lazy(() => import("./AwaitingUpdates/AwaitingUpdates"));

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, isChunkLoadError: false };
	}

	static getDerivedStateFromError(error) {
		if (
			error?.message?.toLowerCase?.()?.includes?.("loading chunk") ||
			error?.message?.toLowerCase?.()?.includes?.("loading css chunk")
		) {
			return { hasError: true, isChunkLoadError: true };
		}
		return { hasError: true, isChunkLoadError: false };
	}

	componentDidCatch(error, info) {
		this.setState({ hasError: true });
		import("components/common/saveErrorLogs").then(
			({ default: saveErrorLogs }) => {
				saveErrorLogs(error, { component: this.props.component });
			}
		);
	}

	render() {
		if (this.state.hasError) {
			if (this.state.isChunkLoadError) {
				return (
					<Suspense fallback={<></>}>
						<AwaitingUpdate />
					</Suspense>
				);
			}
			return (
				<Suspense fallback={<></>}>
					<Error />
				</Suspense>
			);
		}
		return this.props.children;
	}
}

ErrorBoundary.defaultProps = {
	children: <></>,
	component: "",
};

export default ErrorBoundary;
/**
 * @template T
 * Wraps a given component with an error boundary to handle render errors and chunk loading errors.
 * @param {React.ComponentType<T>} Component - The React component to wrap, which accepts props of type T.
 * @param {string} name - The display name of the component, used for logging.
 * @returns {React.ComponentType<T>} A component wrapped in an ErrorBoundary.
 */
export function withErrorBoundary(Component, name) {
	class HOC extends React.Component {
		render() {
			const props = this.props;
			return (
				<ErrorBoundary component={name}>
					<Component {...props} />
				</ErrorBoundary>
			);
		}
	}
	HOC.displayName = `WithErrorBoundary(${
		Component.displayName || Component.name || "Component"
	})`;
	HOC.propTypes = Component.propTypes;

	return HOC;
}
