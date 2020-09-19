import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
// import Moment from "react-moment";
import moment from "moment";
import axios from "axios";
import { Line } from "react-chartjs-2";
import UsersDistribution from "./usersDistribution";
import { API_BASE_URL } from "../../Constants/apiConstants";
import { createImportSpecifier } from "typescript";

function AdminDashboard() {
  // const [score, setScore] = useState({ score: [] });
  // const [yearScore, setYearScore] = useState([]);
  // const [lastUplaod, setLastUpload] = useState("");
  // const [firstRecord, setFirstRecord] = useState("");
  // const [lastRecord, setLastRecord] = useState("");
  // const payload = { userid: sessionStorage.getItem("userId") };
  const [isLoading, setIsLoading] = useState(false);
  const [activityDists, setActivityDists] = useState();
  const [userDists, setUserDists] = useState();
  const [monothDists, setMonthDists] = useState();
  const [weekDayDists, setWeekDayDists] = useState();
  const [hourDists, setHourDists] = useState();
  const [yearDists, setYearDists] = useState();

  // const [dataState, setDataState] = useState({})
  // const [dataUploadedState, setDataUploadedState] = useState();

  let yearData;

  useEffect(() => {
    const fetchData = async () => {
      console.log("FETCH DATA IS CALLED");
      setIsLoading(true);

      const result = await axios.get(API_BASE_URL + "adminData");
      console.log(result);
      const activityDistributions = result.data.data[0];
      const userDistributions = result.data.data[1];
      console.log()
      const monthDistributions = result.data.data[2];
      const weekDayDistributions = result.data.data[3];
      const hourDistributions = result.data.data[4];
      const yearDistributions = result.data.data[5];
      setActivityDists(activityDistributions);
      setUserDists(userDistributions);
      setMonthDists(monthDistributions);
      setWeekDayDists(weekDayDistributions);
      setHourDists(hourDistributions);
      setYearDists(yearDistributions);
      console.log(userDists);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      {!isLoading ? (
        <>
          <h2>Activity Distribution</h2>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Activity Type</th>
                <th>Distribution </th>
              </tr>
            </thead>
            <tbody>
              {activityDists?.map((item) => (
                <tr>
                  <td>{item.activityType}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h2>User Distribution</h2>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>User</th>
                <th>Distribution </th>
              </tr>
            </thead>
            <tbody>
              {userDists?.map((item) => (               
                 <tr>
                  <td>{item.userid}</td> 
                  <td>{item.count}</td>
                </tr>                 
              ))}
            </tbody>
          </Table>
          <h2>Month Distribution</h2>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Month</th>
                <th>Distribution </th>
              </tr>
            </thead>
            <tbody>
              {monothDists?.map((item) => (
                <tr>
                  <td>{moment(moment().month(item.month)).format("MMMM")}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h2>Day Distribution</h2>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Day</th>
                <th>Distribution </th>
              </tr>
            </thead>
            <tbody>
              {weekDayDists?.map((item) => (
                <tr>
                  <td>{moment(moment().day(item.day)).format("dddd")}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div>Hour Distribution</div>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Hour</th>
                <th>Distribution </th>
              </tr>
            </thead>
            <tbody>
              {hourDists?.map((item) => (
                <tr>
                  <td>{moment(moment().hour(item.hour)).format("HH")}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <h2>Year Distribution</h2>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Month</th>
                <th>Distribution </th>
              </tr>
            </thead>
            <tbody>
              {yearDists?.map((item) => (
                <tr>
                  <td>{moment(moment().year(item.year)).format("YYYY")}</td>
                  <td>{item.count}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <h1>Waiting...</h1>
      )}
    </>
  );
}

export default AdminDashboard;
