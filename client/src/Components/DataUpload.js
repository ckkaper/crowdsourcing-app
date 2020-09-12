import React, { useState, useEffect } from "react";
import { MyMap } from "./Map";
import axios from "axios";

import { API_BASE_URL } from "../Constants/apiConstants";

function submitForm(contentType, data, setResponse) {
  axios({
    url: `${API_BASE_URL}upload`,
    method: "POST",
    data: data,
    headers: {
      "Content-Type": contentType,
    },
  })
    .then((response) => {
      alert("successfully saved data");
      setResponse(response.data);
    })
    .catch((error) => {
      setResponse("error");
    });
}

let restrictedLocationsO = [];
function DataUpload() {
  const [restrictedLocations, addRestrictedLocation] = useState();

  const appendLocation = (location) => {
    addRestrictedLocation(location);
    console.log(location);
    restrictedLocationsO.push(location);
  };

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");

  function uploadWithFormData() {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("locations", restrictedLocationsO);
    formData.append("userId",sessionStorage.getItem("userId"));

    submitForm("multipart/form-data", formData, (msg) => console.log(msg));
  }

  return (
    <>
      <MyMap addRestrictedLocations={appendLocation} />
      <div className="App">
        <h2>Upload Form</h2>
        <form>
          <label>
            File Title
            <input
              type="text"
              vaue={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              placeholder="Give a title to your upload"
            />
          </label>

          <label>
            File
            <input
              type="file"
              name="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <input
            type="button"
            value="Upload as Form"
            onClick={uploadWithFormData}
          />
        </form>
      </div>
    </>
  );
}

export default DataUpload;
