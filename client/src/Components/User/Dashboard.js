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
  const [dataState, setDataState] = useState({});
  const [dataUploadedState, setDataUploadedState] = useState();

  let yearData;

  useEffect(() => {
    const fetchData = async () => {
      console.log("FETCH DATA IS CALLED");
      setIsLoading(true);

      const result = await axios.post(API_BASE_URL + "userData", payload);
      const [lastUplaod, lastRecord, firstRecord] = result.data.score.slice(
        14,
        16
      );
      setLastUpload(lastUplaod);
      setFirstRecord(firstRecord);
      setLastRecord(lastRecord);
      console.log(lastUplaod);
      console.log(lastRecord);
      console.log(firstRecord);

      const yearData = result.data.score
        .slice(1, 13)
        .map((element) => (element === null ? 0 : element));
      console.log(yearData);
      setScore(result.data);
      setDataState({
        labels: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "June",
          "June",
          "June",
        ],
        datasets: [
          {
            label: "My First dataset",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: yearData,
          },
        ],
      });
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
