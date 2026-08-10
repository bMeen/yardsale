import PageContainer from "@/components/PageContainer";
import PageHeader from "@/components/PageHeader";
import Title from "@/components/Title";
import ProfileActivityStats from "@/features/identity/components/ProfileActivityStats";
import ProfileInfo from "@/features/identity/components/ProfileInfo";
import ProfileMenu from "@/features/identity/components/ProfileMenu";
import ProfileWalletCard from "@/features/wallet/components/ProfileWalletCard";

function Profile() {
  return (
    <PageContainer>
      <PageHeader>
        <Title>Profile</Title>
      </PageHeader>

      <div className="space-y-4 px-2 py-4 md:p-4">
        <ProfileInfo />
        <ProfileWalletCard />
        <ProfileActivityStats />
        <ProfileMenu />
      </div>
    </PageContainer>
  );
}

export default Profile;
