import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

import { API_BASE_URL } from "../../Constants/apiConstants";
import { createImportSpecifier } from "typescript";

function Dashboard() {
  const [score, setScore] = useState({ score: [] });
  const [yearScore, setYearScore] = useState([]);
  const [lastUplaod, setLastUpload] = useState("");
  const [firstRecord, setFirstRecord] = useState("");
  const [lastRecord, setLastRecord] = useState("");
  const payload = { userid: sessionStorage.getItem("userId") };
  const [isLoading, setIsLoading] = useState(false);
  const [dataState, setDataState] = useState({})
  const [dataUploadedState, setDataUploadedState] = useState();


  let yearData;

  useEffect(() => {
    const fetchData = async () => {
      console.log("FETCH DATA IS CALLED");
      setIsLoading(true);

      const result = await axios.post(API_BASE_URL + "userData", payload);    
 

  
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      {!isLoading ? (
        <>
          <h3>User Score: {score.score[0] * 100}</h3>

          <Line data={dataState}></Line>
          <h3>User Last Upload: {lastUplaod}</h3>
          <h3>Last Record {firstRecord}</h3>
          <h3>Last Record {lastRecord}</h3>
        </>
      ) : (
        <h1>Waiting...</h1>
      )}
    </>
  );
}

export default Dashboard;
