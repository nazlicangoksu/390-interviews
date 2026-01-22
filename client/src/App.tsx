import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import Notes from './pages/Notes';
import InvestmentCheck from './pages/InvestmentCheck';
import Topics from './pages/Topics';
import Barriers from './pages/Barriers';
import Concepts from './pages/Concepts';
import BarrierConcepts from './pages/BarrierConcepts';
import Summary from './pages/Summary';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/investment-check" element={<InvestmentCheck />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/barriers" element={<Barriers />} />
          <Route path="/concepts" element={<Concepts />} />
          <Route path="/barrier-concepts" element={<BarrierConcepts />} />
          <Route path="/summary/:id" element={<Summary />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
