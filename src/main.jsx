import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <StarRating
      maxRating={5}
      size={35}
      color="orangered"
      defaultRating={3}
      messages={["Terrible", "Bad", "Okey", "Good", "Amazing"]}
    />
    <StarRating maxRating={6} size={25} color="purple" /> */}
  
    <App />
  </React.StrictMode>
);
