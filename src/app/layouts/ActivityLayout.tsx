import ActivityNavigations from "@/components/ActivityNavigations";
import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import { Outlet } from "react-router";

function ActivityLayout() {
  return (
    <PageContainer>
      <PageHeader>
        <div className="space-y-3 px-2 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <Title>Activity</Title>

            <Button
              variant="link"
              className="cursor-pointer text-xs md:text-sm"
            >
              Mark all read
            </Button>
          </div>

          <ActivityNavigations />
        </div>
      </PageHeader>

      <div className="px-2 py-4">
        <Outlet />
      </div>
    </PageContainer>
  );
}

export default ActivityLayout;
