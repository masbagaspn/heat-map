import { useEffect } from "react";
import { useState } from "react";
import Chart from "./components/Chart";

function App() {
  const [dataset, setDataset] = useState(null);

  const getDataset = async () => {
    const response = await fetch(
      "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
    );
    const data = await response.json();
    setDataset(data);
  };

  useEffect(() => {
    getDataset();
  }, []);

  return (
    <main className="w-screen h-screen max-w-screen max-h-screen py-8 grid grid-place-content-center">
      <section className="w-full h-full flex flex-col justify-between items-center gap-4 relative">
        <div className="w-full text-center">
          <h1 id="title" className="text-3xl font-medium">
            Monthly Global Land Surface Temperature
          </h1>
          <p id="description" className="text-xl">
            1753 - 2015: Base Temperature 8.66℃
          </p>
        </div>
        <div
          id="tooltip"
          className="absolute w-auto h-auto flex flex-col gap-1 bg-neutral-950/70 backdrop-blur-sm text-white text-sm px-6 py-4 rounded-md"
        />
        {dataset ? <Chart data={dataset} /> : null}
      </section>
    </main>
  );
}

export default App;
