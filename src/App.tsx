import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import { LangProvider } from "./context/LangContext";

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyze />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;
