import { BrowserRouter, Route, Routes } from "react-router";

import Hero from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import UserLayout from "./layouts/UserLayout";
import Discover from "./pages/user/Discover";
import Auctions from "./pages/user/auctions/Auctions";
import Auction from "./pages/user/auctions/Auction";
import Create from "./pages/user/auctions/Create";
import Edit from "./pages/user/auctions/Edit";
import Notifications from "./pages/user/activity/Notifications";
import Watchlists from "./pages/user/activity/Watchlists";
import Profile from "./pages/user/profile/Profile";
import Transactions from "./pages/user/profile/Transactions";

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Hero />} />

        <Route element={<UserLayout />}>
          <Route path="discover" element={<Discover />} />

          <Route path="auctions">
            <Route index element={<Auctions />} />
            <Route path=":auctionId" element={<Auction />} />
            <Route path="create" element={<Create />} />
            <Route path=":auctionId/edit" element={<Edit />} />
          </Route>

          <Route path="activity">
            <Route index element={<Notifications />} />
            <Route path="watchlists" element={<Watchlists />} />
          </Route>

          <Route path="profile">
            <Route index element={<Profile />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>
        </Route>

        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
