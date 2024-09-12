import axios from "axios";
import baseDomain from "./baseDomain";

export default async function getLinkMetaData(url) {
	return axios.get(
		baseDomain.integrationRoute + "/get_meta_data_from_url",
		{
			params: {
				url,
			},
		}
	);
}
