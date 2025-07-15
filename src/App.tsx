import { ChartNobodyCanPredict } from "./components/ChartNobodyCanPredict"

function App() {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}
    >
      <ChartNobodyCanPredict
        width={1280}
        height={600}
        backgroundColor="#222222"
      />
    </div>
  )
}

export default App
