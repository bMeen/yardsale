import AuctionStatusCounts from "./AuctionStatusCounts";
import KpiCards from "./KpiCards";
import RecentActivitives from "./RecentActivitives";
import RevenueChart from "./RevenueChart";

function Dashboard() {
  return (
    <>
      <KpiCards />
      <AuctionStatusCounts />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <RevenueChart />
        <RecentActivitives />
      </div>
    </>
  );
}

export default Dashboard;
