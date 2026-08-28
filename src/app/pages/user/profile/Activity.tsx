import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import Title from "@/components/Title";
import { Button } from "@/components/ui/button";
import ProfileActivity from "@/features/identity/components/ProfileActivity";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

function Activity() {
  const { type } = useParams();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate("/profile")}
            size="icon-lg"
            variant="ghost"
            className="cursor-pointer"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <Title>Auctions {type}</Title>
          </div>
        </div>
      </PageHeader>

      <div className="px-2 py-4 md:p-4">
        <ProfileActivity />
      </div>
    </PageContainer>
  );
}

export default Activity;
