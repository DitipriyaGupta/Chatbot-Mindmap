const axios = require("axios");
const fs = require("fs");
const archiver = require("archiver");
const dotenv = require("dotenv");

// Determine which environment file to load based on REACT_APP_ENV
const environment = process.env.REACT_APP_ENV || "development";

// Load environment variables from the specified file
const result = dotenv.config();

if (result.error) {
  console.error(`Error loading ${environment}:`, result.error);
  process.exit(1);
} else {
	console.log(`Environment variables loaded from ${environment}`);
}

// Check if the environment variables were loaded correctly
if (!process.env.NETLIFY_ACCESS_TOKEN || !process.env.NETLIFY_SITE_ID) {
    console.error(`Error: Required environment variables are missing from ${environment}`);
    process.exit(1);
} else {
    console.log(`Environment variables loaded from ${environment}`);
}

const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;
const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID;

const BUILD_FILE_PATH = "./build";
const BUILD_FILE_ZIP_PATH = "build.zip";

// ===================================================================

async function createBuildZip() {
    const output = fs.createWriteStream(BUILD_FILE_ZIP_PATH);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
        console.log(`Successfully zipped ${archive.pointer()} total bytes.`);
        uploadBuildToNetlify();
    });

    archive.on("warning", (err) => {
        if (err.code === "ENOENT") {
            console.warn("Warning:", err);
        } else {
            throw err;
        }
    });

    archive.on("error", (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(BUILD_FILE_PATH, false);
    archive.finalize();
}

const uploadBuildToNetlify = async () => {
    try {
        const zipBuffer = fs.readFileSync(BUILD_FILE_ZIP_PATH);

        const response = await axios.post(
            `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/deploys`,
            zipBuffer,
            {
                headers: {
                    "Content-Type": "application/zip",
                    Authorization: `Bearer ${NETLIFY_ACCESS_TOKEN}`,
                },
            }
        );

        console.log("Deployment successful:", response.data);
        fs.unlinkSync(BUILD_FILE_ZIP_PATH);
        console.log(`${BUILD_FILE_ZIP_PATH} deleted successfully.`);
    } catch (error) {
        console.error("Error uploading to Netlify:", error.message);
    }
};

createBuildZip();
