import axios from "axios";

const API_URL = "http://localhost:5000/api/"; // Replace with your API endpoint URL

export default class UploadService {
  public async upload66xFile(formData: any): Promise<any> {
    return await axios
      .post(`${API_URL}uploadfileARIS66x`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async get66xFileTransferInfos(formData: any): Promise<any> {
    return await axios
      .post(`${API_URL}get66xFileTransferInfos`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }

  public async upload617File(formData: any): Promise<any> {
    return await axios
      .post(`${API_URL}uploadfileARIS617`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.error(error);
        return error;
      });
  }
  public async checkFolderAccessibility(folderPath: string): Promise<boolean> {
    try {
      // Make an API call or any other method to check folder accessibility
      const response = await axios.get(
        `/api/check-accessibility?folder=${folderPath}`
      );

      // Assuming the API responds with a boolean indicating accessibility
      return response.data.accessible;
    } catch (error) {
      console.error("Error checking folder accessibility:", error);
      return false; // Handle error as needed
    }
  }
}
