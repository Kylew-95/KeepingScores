import axios from "axios";

let headersList = {
 "Accept": "*/*",
 "User-Agent": "Thunder Client (https://www.thunderclient.com)" 
}

let reqOptions = {
  url: "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=51.50853%2C-0.12574&radius=10000&keyword=park&key=AIzaSyBOGdOyuw2M85OMlkrTTDC1j3pYrR6XGfc",
  method: "GET",
  headers: headersList,
}

let response = await axios.request(reqOptions);
console.log(response.data);
