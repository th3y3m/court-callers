// router.js
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/user/homePage';
import { ROUTERS } from './utils/router';
import MasterLayout from './pages/user/theme/masterLayout';
import ProfilePage from './pages/user/profilePage';
import SchedulePage from 'pages/user/schedulePage';
import Login from 'pages/user/login';
import NewsPage from 'pages/user/newsPage';
import BookedPage from 'pages/user/bookedPage';
import BookByDay from 'pages/user/bookingByDay';
import PaymentDetail from 'pages/user/Payment/PaymentDetails';
import PaymentDetailFixed from 'pages/user/Payment/PaymentDetailFixed';
import PaymentFailed from 'pages/user/Payment/PaymentFailed';
import PaymentSuccessful from 'pages/user/Payment/PaymentSuccessful';
import FixedBooking from 'pages/user/bookingFixDay/Fix';
import ForgetPassword from 'pages/user/forgetPass/index';
import ResetPassword from 'pages/user/resetPass/index';
import Flexible from 'pages/user/bookingFlex/Flexible';
import FlexibleBooking from 'pages/user/bookingFlex/FlexibleBooking';

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const userRole = localStorage.getItem('userRole');

  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={ROUTERS.USER.LOGIN} />;
  }

  return <Component {...rest} />;
};

const renderUserRouter = () => {
  const userRouters = [
    { path: ROUTERS.USER.HOME, component: HomePage },
    { path: ROUTERS.USER.SCHEDULEPAGE, component: SchedulePage },
    { path: ROUTERS.USER.PROFILE, component: ProfilePage },
    { path: ROUTERS.USER.NEWS, component: NewsPage },
    { path: ROUTERS.USER.BOOKED, component: BookedPage },
    { path: ROUTERS.USER.BYDAY, component: BookByDay },
    { path: ROUTERS.USER.FIXBOOKING, component: FixedBooking },
    { path: ROUTERS.USER.FLEXIBLE, component: Flexible },
    { path: ROUTERS.USER.FLEXIBLEBOOKING, component: FlexibleBooking },
    { path: ROUTERS.USER.PAYMENTDETAIL, component: PaymentDetail },
    { path: ROUTERS.USER.PAYMENTDETAILFIX, component: PaymentDetailFixed },
    { path: ROUTERS.USER.PAYMENTFAILED, component: PaymentFailed },
    { path: ROUTERS.USER.PAYMENTSUCCESSFUL, component: PaymentSuccessful }
  ];

  return (
    <MasterLayout>
      <Routes>
        {userRouters.map((item, key) => (
          <Route
            key={key}
            path={item.path}
            element={
              <ProtectedRoute component={item.component} allowedRoles={['Customer', '']} />
            }
          />
        ))}
      </Routes>
    </MasterLayout>
  );
};

const RouterCustom = () => {
  return (
    <Routes>
      <Route path={ROUTERS.USER.LOGIN} element={<Login />} />
      <Route path="/*" element={renderUserRouter()} />
      <Route path={ROUTERS.USER.FORGETPASSWORD} element={<ForgetPassword />} />
      <Route path={ROUTERS.USER.RESETPASSWORD} element={<ResetPassword />} />
    </Routes>
  );
};

export default RouterCustom;
