import axios from 'axios';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ScrollToTop from './components/scrolltop';

import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import HelpCenter from './pages/HelpCenter';
import { NotFound } from './pages/NotFound';
import AccommodationListing from './pages/AccommodationListing';
import FAQ from './pages/FAQ';
import PropertySearch from './pages/SearchResult';
import Accommodation from './pages/Accommodation';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import About from './pages/About';
import AccommodationEdit from './pages/AccommodationEdit';
import ForgotPasswordOTP from './pages/ForgotPasswordOTP';
import VerifyOTP from './pages/VerifyOTP';
import ResetPasswordOTP from './pages/ResetPasswordOTP';
import ApplyOnline from './pages/ApplyOnline';
import ScheduleTour from './pages/ScheduleTour';
import NegotiateRent from './pages/NegotiateRent';
import PayRent from './pages/PayRent';


import NewChat from './pages/newChat';


axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'https://mycampushome-production.up.railway.app/api/';


export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/about" element={<About />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/search" element={<PropertySearch />} />
        <Route path="/accommodation/:id" element={<Accommodation />} />
        <Route path="/apply-online" element={<ApplyOnline />} />
        <Route path="/schedule-tour" element={<ScheduleTour />} />
        <Route path="/negotiate-rent" element={<NegotiateRent />} />
        <Route path="/pay-rent" element={<PayRent />} />
        <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />

        <Route path="/*" element={<NotFound />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Profile />} />
          <Route path="/list-property" element={<AccommodationListing />} />
          <Route path="/edit-accommodation/:id" element={<AccommodationEdit />} />
          <Route path="/newchat/:userID" element={<NewChat />} />
          <Route path="/newchat/:userID/:conversationId" element={<NewChat />} />
        </Route>
        
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
}

