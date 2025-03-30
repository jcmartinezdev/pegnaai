import { auth0 } from "@/lib/auth0";
import ChatContainer from "./chat-container";
import { getUser } from "@/db/queries";

export default async function ChatPage() {
  const session = await auth0.getSession();
  const user = session && (await getUser(session.user.sub));

  return (
    <ChatContainer
      userPlan={user ? user.planName : "free"}
      isLoggedIn={session !== null}
    />
  );
}
