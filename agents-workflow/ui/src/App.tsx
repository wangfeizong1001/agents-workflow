import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { SpecDetail } from "./pages/SpecDetail";
import { PlanDetail } from "./pages/PlanDetail";
import { ExecuteProgress } from "./pages/ExecuteProgress";
import { VerifyResult } from "./pages/VerifyResult";
import { Knowledge } from "./pages/Knowledge";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">仪表盘</Link> |{" "}
        <Link to="/knowledge">知识库</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/spec/:id" element={<SpecDetail />} />
        <Route path="/plan/:id" element={<PlanDetail />} />
        <Route path="/execute/:planId" element={<ExecuteProgress />} />
        <Route path="/verify/:planId" element={<VerifyResult />} />
        <Route path="/knowledge" element={<Knowledge />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
