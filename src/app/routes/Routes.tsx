import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

//import UserProtectedRoute from "../layouts/UserProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import UserLayout from "../layouts/UserLayout";
import Loader from "@/components/Loader";

import Hero from "../pages/Home";
import Login from "../pages/auth/Login";
import Callback from "../pages/auth/Callback";
import NotFound from "../pages/NotFound";
import ActivityLayout from "../layouts/ActivityLayout";
import ErrorBoundaryLayout from "../layouts/ErrorBoundaryLayout";
import AdminLayout from "../layouts/AdminLayout";
import Overview from "../pages/admin/Overview";
import Revenue from "../pages/admin/Revenue";
import Audits from "../pages/admin/Audits";
import Users from "../pages/admin/users/Users";
import User from "../pages/admin/users/User";
import AdminAuctions from "../pages/admin/auctions/AdminAuctions";
import AdminAuction from "../pages/admin/auctions/AdminAuction";
import AdminCreate from "../pages/admin/auctions/AdminCreate";
import ProtectedRoute from "../layouts/ProtectedRoute";

const Discover = lazy(() => import("../pages/user/Discover"));
const Auctions = lazy(() => import("../pages/user/auctions/Auctions"));
const Auction = lazy(() => import("../pages/user/auctions/Auction"));
const Create = lazy(() => import("../pages/user/Create"));
const Activity = lazy(() => import("../pages/user/profile/Activity"));
const Notifications = lazy(
  () => import("../pages/user/activity/Notifications"),
);
const Profile = lazy(() => import("../pages/user/profile/Profile"));
const Transactions = lazy(() => import("../pages/user/activity/Transactions"));

function Router() {
  return (
    <BrowserRouter>
      <ErrorBoundaryLayout>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route index element={<Hero />} />
            <Route
              element={
                <ProtectedRoute role="USER">
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route path="discover" element={<Discover />} />

              <Route path="create" element={<Create />} />

              <Route path="auctions">
                <Route index element={<Auctions />} />
                <Route path=":auctionId" element={<Auction />} />
              </Route>

              <Route path="activity" element={<ActivityLayout />}>
                <Route index element={<Notifications />} />
                <Route path="transactions" element={<Transactions />} />
              </Route>

              <Route path="profile">
                <Route index element={<Profile />} />
                <Route path="activity/:type" element={<Activity />} />
              </Route>
            </Route>

            <Route
              path="admin"
              element={
                <ProtectedRoute role="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />

              <Route path="users">
                <Route index element={<Users />} />
                <Route path=":id" element={<User />} />
              </Route>

              <Route path="auctions">
                <Route index element={<AdminAuctions />} />
                <Route path="create" element={<AdminCreate />} />
                <Route path=":id" element={<AdminAuction />} />
              </Route>

              <Route path="revenue" element={<Revenue />} />
              <Route path="audits" element={<Audits />} />
            </Route>

            <Route path="auth" element={<AuthLayout />}>
              <Route index element={<Navigate replace to="login" />} />
              <Route path="login" element={<Login />} />
              <Route path="callback" element={<Callback />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundaryLayout>
    </BrowserRouter>
  );
}

export default Router;
