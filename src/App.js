import React from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Layout from './layout/Layout';
import LandingPage from './pages/LandingPage';
import PrivateRoute from './private/PrivateRoute';
import Sidebar from './layout/Sidebar';
import Dashboard from './pages/Dashboard';
import QuizList from './pages/QuizList';
import CreateQuizPage from './pages/CreateQuizPage';
import EditQuizPage from './pages/EditQuizPage';
import QuizAI from './pages/QuizAI';
import QuizPage from './pages/QuizPage';
import Account from './pages/Account';

function App() {
  return (
      <Router>
          <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout><Outlet /></Layout>}>
                  <Route index element={<LandingPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="login" element={<LoginPage />} />
              </Route>
              
              {/* Private routes */}
               <Route path="/dashboard" element={
                  <PrivateRoute>
                      <Dashboard />
                  </PrivateRoute>
              } />
              <Route path="/quizzes" element={
                  <PrivateRoute>
                      <QuizList />
                  </PrivateRoute>
              } />
              <Route path="/create-quiz" element={
                  <PrivateRoute>
                      <CreateQuizPage />
                  </PrivateRoute>
              } />
              <Route path="/edit-quiz/:id" element={
                  <PrivateRoute>
                      <EditQuizPage />
                  </PrivateRoute>
              } />
              <Route path="/quiz/:id" element={
                  <PrivateRoute>
                      <QuizPage />
                  </PrivateRoute>
              } />
              <Route path="/quiz-ai" element={
                  <PrivateRoute>
                      <QuizAI />
                  </PrivateRoute>
              } />
              <Route path="/account" element={
                  <PrivateRoute>
                      <Account />
                  </PrivateRoute>
              } />
          </Routes>
      </Router>
  );
}

export default App;
