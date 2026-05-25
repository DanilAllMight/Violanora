import { ProfileCard } from "@/widgets/ProfileCard";
import { useParams } from "react-router-dom";

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const cleanIdString = userId ? userId.replace(":", "") : "";

  const numericId = Number(cleanIdString);

  return <ProfileCard userId={numericId}></ProfileCard>;
};
