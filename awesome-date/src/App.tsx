import * as React from "react";
import AwesomeDatePicker from "./components/AwesomeDatePicker";
import "./App.css";

function App() {
  const [date, setDate] = React.useState<Date | null>(new Date());
  return (
    <>
      <div className="App">
        <p>Current Picked Date</p>
        <p>{date?.toString()}</p>
        <AwesomeDatePicker onChange={setDate} />
      </div>
    </>
  );
}

export default App;
