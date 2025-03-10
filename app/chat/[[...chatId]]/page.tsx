export default function ChatPage() {
  return (
    <main className="relative flex w-full flex-1 flex-col p-4">
      <div className="flex-1 overflow-y-auto">
        <div
          role="log"
          aria-label="Chat messages"
          className="mx-auto max-w-4xl"
        >
          Chat here
        </div>
      </div>
      <div className="absolute bottom-0 w-full pr-2">Form</div>
    </main>
  );
}
