import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type UserAvatar =
  { url: string; fallback?: string } | { url?: string; fallback: string };

function UserAvatar({ url, fallback }: UserAvatar) {
  return (
    <Avatar>
      <AvatarImage src={url} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
