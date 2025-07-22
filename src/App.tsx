import { ChartNobodyCanPredict } from "./components/ChartNobodyCanPredict"
import { Header } from "./components/Header/Header";
import { useUser } from "./hooks/useUser"

function App() {
  const { user } = useUser();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}
    >
      <Header user={user} />
      <div className="chart-container">
        <ChartNobodyCanPredict
          width={window.innerWidth}
          height={600}
          backgroundColor="#222222"
        />
      </div>
    </div>
  )
}

export default App
