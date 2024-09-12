const fs = require("fs");
const path = require("path");

// Directory of your React app's source files
const SRC_DIR = path.join(__dirname, "src");

function crawlDirectory(directory) {
	fs.readdirSync(directory).forEach((file) => {
		const fullPath = path.join(directory, file);
		if (fs.statSync(fullPath).isDirectory()) {
			crawlDirectory(fullPath);
		} else if (fullPath.endsWith(".jsx")) {
			processFile(fullPath);
		}
	});
}

function processFile(filePath) {
	const content = fs.readFileSync(filePath, "utf8");

	// Check if file already imports withErrorBoundary
	const alreadyImported = content.includes(
		'import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";'
	);

	// Find the default export
	const exportRegex = /export default (\w+);/;
	const matches = content.match(exportRegex);

	if (matches) {
		const componentName = matches[1];
		let modifiedContent = content;

		// If not already imported, add the import statement
		if (!alreadyImported) {
			modifiedContent =
				'import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";\n' +
				content;
		}

		// Replace the default export with the wrapped component
		modifiedContent = modifiedContent.replace(
			exportRegex,
			`export default withErrorBoundary(${componentName}, "${componentName}");`
		);

		// Write the modified content back to the file
		fs.writeFileSync(filePath, modifiedContent);
		console.log(`Processed ${filePath}`);
	}
}

crawlDirectory(SRC_DIR);
