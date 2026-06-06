import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Qualification from '@/pages/Qualification';
import FlightPlan from '@/pages/FlightPlan';
import Materials from '@/pages/Materials';
import Review from '@/pages/Review';
import Messages from '@/pages/Messages';
import Archive from '@/pages/Archive';
import Supervision from '@/pages/Supervision';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="qualification" element={<Qualification />} />
          <Route path="flight-plan" element={<FlightPlan />} />
          <Route path="flight-plan/:id" element={<FlightPlan />} />
          <Route path="materials" element={<Materials />} />
          <Route path="review" element={<Review />} />
          <Route path="messages" element={<Messages />} />
          <Route path="archive" element={<Archive />} />
          <Route path="supervision" element={<Supervision />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
