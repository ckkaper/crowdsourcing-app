import React, { useState, useEffect } from "react";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import Table from "react-bootstrap/Table";
// import Moment from "react-moment";
import moment from "moment";
import axios from "axios";
import { Line } from "react-chartjs-2";
import UsersDistribution from "./usersDistribution";
import { API_BASE_URL } from "../../Constants/apiConstants";
import { createImportSpecifier } from "typescript";

function ExportData() {

  const handleDownloadFile = (event) => {
    event.preventDefault();
    axios
        .get(
            `exportData`, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'text/csv',
                }
            }
        )
        .then(response => {
            console.log(response.headers); // does not include content-disposition
            console.log("File downloading successfully!");
        })
        .catch( (error) => {
            console.error("File could not be downloaded:", error);
        });
}
  useEffect(() => {

  })
    const [fileType, setFileType] = useState();
    const submit = (event) => {
        event.preventDefault();
        const payload = { fileType };
        axios.post(API_BASE_URL + "exportData",payload).
        then((response) => {
          console.log("response");
          console.log(response);
        }).catch((error) => {
          console.log(error);
        })
     };
 
 

  return (
    <form onSubmit>
    <label>
      Pick file Type:
      <select value={fileType} onChange={e => setFileType(e.currentTarget.value)}>
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
        <option value="xml">XML</option>        
      </select>
    </label>
    <button type="submit" className="btn btn-primary" onClick={submit} >
      Submit
    </button>
  </form>
  );
}

export default ExportData;
