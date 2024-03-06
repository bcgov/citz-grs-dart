import React, { useEffect } from "react";
import axios from "axios";

const GetAuthentication: React.FC = () => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/auth");
        console.log(response.data);
        const { token } = response.data;
        console.log(token);
        localStorage.setItem("token", token);
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    fetchData();
  }, []);

  return (
    // Render something while fetching the API
    <div>Autorisation...Connect to PathFinder SSO</div>
  );
};

export default GetAuthentication;
