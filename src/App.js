//Matarial UI is just like bootstrap
//Material UI is a react User Interface framework
//To install Material UI we use npm install @material-ui/core
//import the dependency from material ui module
// For LineGraph we will use react-chartjs-2 
import React, { useState, useEffect } from "react";
import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import LineGraph from "./LineGraph";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import numeral from "numeral";
import Map from "./Map";
import "leaflet/dist/leaflet.css";

const App = () => {
  //In React we declare variable using useState
//React way to initialize the array const[countries,setCountries]
// const[countries,setCountries] =useState([]);

// This variable is for keep track of the country we have selected 
//and now its default value is worldwide
// const [country, setInputCountry] = useState("worldwide");
// Variable For special for a country 
// const [countryInfo,setCountryInfo]= useState({});
//Variable for tableData
// const [tableData, setTableData] = useState([]);
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [countries, setCountries] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);
//API call for the name of the company
//http://disease.sh/v3/covid-19/countries
//USEEFFECT = Runs a piece of code based on a given condition 

  useEffect(() => {
    //The function will load only one time the value in [] is loaded not again
// [] has the condition which we take in the defination of useEffect
//async -> send a request , wait for it to do something
//this done because it take server to respond 

//.then is use when reponse come do this and take the response in the form of .json object

 //async made the function wait till we get the response

    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
         // map is used for iterating on the array country here countries has a list of all countries and there info  
// countries is a object having name and sort name
 //We goes throw the data which is in .json format 
  
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          //For Table Data 
          let sortedData = sortData(data);
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        });
    };
//This is how we handle async useEffect
// this is mandetary at the last of useEffect
    getCountriesData();
  }, []);

  console.log(casesType);

  const onCountryChange = async (e) => {
   //To check which country we have clicked 
// To keep the name of the country we click on the box
    const countryCode = e.target.value;
//For collecting details with given country
//http://disease.sh/v3/covid-19/countries/[COUNTRY_CODE]
//If countryCode is world wide get request on /all else call on /countries/[COUNTRY_CODE]
// const url =
// countryCode === "worldwide"
//   ? "https://disease.sh/v3/covid-19/all"
//   : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

// //url is selected using ternary operation
// fetch(url)
// .then((response) => response.json())
// .then((data) => {
//    //For setting new value in countryCode
//    setCountry(countryCode);
//   //All of the data from the country response
//   setCountryInfo(data);

// });
// };
    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setInputCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 Tracker</h1>
          <FormControl className="app__dropdown">
             {/* //onChange is used when we click any country it let us know which country we have clicked  */}
          {/* value which goes here is the value being display on the drop dowm box for countries */}
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
             {/*For the drop down button we use Select and MenuItem in Matrial UI like this 
        Form Control is like a form in html */}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__information">
            <h3><strong>Total Cases Country Wise</strong></h3>
            <Table countries={tableData} />
            <h3><strong>Worldwide new {casesType}</strong></h3>
            <LineGraph casesType={casesType} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
