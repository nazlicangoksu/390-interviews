import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import Topics from './pages/Topics';
import Concepts from './pages/Concepts';
import Summary from './pages/Summary';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/concepts" element={<Concepts />} />
          <Route path="/summary/:id" element={<Summary />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
