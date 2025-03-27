import { auth0 } from "@/lib/auth0";
import ChatContainer from "./chat-container";

export default async function ChatPage() {
  const session = await auth0.getSession();

  return <ChatContainer isLoggedIn={session !== null} />;
}
