//import type { SSOUser, IdirIdentityProvider } from "@bcgov/citz-imb-sso-js-core";
import type { submitFormData } from "../../schemas";

const reformatFormData = (inForm: string) => {
	// define the mapping from ID to file type
	const fileTypeMap = new Map<number, string>();
	fileTypeMap.set(1, "excel");
	fileTypeMap.set(2, "json");

	// parse the string to a submitFormData object
	const formObject: submitFormData = JSON.parse(inForm);
	formObject.outputFormat = fileTypeMap.get(formObject.outputFormat);
};

/**
 * Takes information from File List form and packages into the correct format to be sent to backend.
 *
 * @param win - the main process window.
 * @returns A string[] if a directory is selected or undefined if the dialog is closed with no selection.
 */
export const submitFileList = (formData, metadata, user): object => {
	// process form data into
	console.log("Form data: ", formData);
	console.log("MetaData: ", metadata);
	console.log("User: ", user);

	return { success: true, data: "yay" };
};
