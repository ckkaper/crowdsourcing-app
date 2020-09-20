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

function DeleteData() {
    const submit = (event) => {
        event.preventDefault();
        confirmAlert({
          title: 'Confirm to delete Data from Database',
          message: 'Are you sure you want to delete all the data',
          buttons: [
            {
              label: 'Yes',
              onClick: () => {
                axios
                  .post(API_BASE_URL + "deleteData")
                  .then((response) => {
                    if (response.status === 200) {
                      alert("data deleted successfully");
                    } else {
                      alert("Error occured");
                    }

                  })
                  
              } 
            },
            {
              label: 'No',
              onClick: () => alert('Click No')
            }
          ]
        });
      };
 
 

  return (
    <form>
     <button
          type="submit"
          className="btn btn-primary"
          onClick={submit}
          >
          Delete Data
          </button>
 </form>
       
  );
}

export default DeleteData;
