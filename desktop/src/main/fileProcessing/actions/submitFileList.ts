import type { SSOUser, IdirIdentityProvider } from "@bcgov/citz-imb-sso-js-core";

type Props = {
	submitFormData: object;
	metadata: object;
	user: SSOUser<IdirIdentityProvider> | undefined;
};
/**
 * Takes information from File List form and packages into the correct format to be sent to backend.
 *
 * @param win - the main process window.
 * @returns A string[] if a directory is selected or undefined if the dialog is closed with no selection.
 */
export const submitFileList = ({ submitFormData, metadata, user }: Props): object => {
	console.log("Form data: ", submitFormData);
	console.log("MetaData: ", metadata);
	console.log("User: ", user);

	return { success: true, data: "yay" };
};
