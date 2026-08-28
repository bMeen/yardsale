import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import UserProtectedRoute from "../layouts/UserProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";
import UserLayout from "../layouts/UserLayout";
import Loader from "@/components/Loader";

import Hero from "../pages/Home";
import Login from "../pages/auth/Login";
import Callback from "../pages/auth/Callback";
import NotFound from "../pages/NotFound";
import ActivityLayout from "../layouts/ActivityLayout";
import ErrorBoundaryLayout from "../layouts/ErrorBoundaryLayout";

const Discover = lazy(() => import("../pages/user/Discover"));
const Auctions = lazy(() => import("../pages/user/auctions/Auctions"));
const Auction = lazy(() => import("../pages/user/auctions/Auction"));
const Create = lazy(() => import("../pages/user/Create"));
const Activity = lazy(() => import("../pages/user/profile/Activity"));
/* const Edit = lazy(() => import("../pages/user/auctions/Edit")); */
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
                <UserProtectedRoute>
                  <UserLayout />
                </UserProtectedRoute>
              }
            >
              <Route path="discover" element={<Discover />} />

              <Route path="create" element={<Create />} />

              <Route path="auctions">
                <Route index element={<Auctions />} />
                <Route path=":auctionId" element={<Auction />} />
                {/* <Route path=":auctionId/edit" element={<Edit />} /> */}
              </Route>

              <Route path="activity" element={<ActivityLayout />}>
                <Route index element={<Notifications />} />
                <Route path="transactions" element={<Transactions />} />
              </Route>

              {/*  <Route path="profile" element={<Profile />} /> */}
              <Route path="profile">
                <Route index element={<Profile />} />
                <Route path="activity/:type" element={<Activity />} />
              </Route>
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
