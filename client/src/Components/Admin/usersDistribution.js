import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

import { API_BASE_URL } from "../../Constants/apiConstants";
import { createImportSpecifier } from "typescript";

function UsersDistribution(props) {
  // const [score, setScore] = useState({ score: [] });
  // const [yearScore, setYearScore] = useState([]);
  // const [lastUplaod, setLastUpload] = useState("");
  // const [firstRecord, setFirstRecord] = useState("");
  // const [lastRecord, setLastRecord] = useState("");
  // const payload = { userid: sessionStorage.getItem("userId") };
  const [isLoading, setIsLoading] = useState(false);

  // const [dataState, setDataState] = useState({})
  // const [dataUploadedState, setDataUploadedState] = useState();

  let yearData;

  useEffect(() => {
    const fetchData = async () => {
      console.log("FETCH DATA IS CALLED");

      const result = await axios.get(API_BASE_URL + "adminData/users");
      console.log("result admin/users");
      console.log(result);
    };

    fetchData();
  }, []);

  return <>{!isLoading ? <></> : <h1>Waiting...</h1>}</>;
}

export default UsersDistribution;
