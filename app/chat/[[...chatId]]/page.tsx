export default function ChatPage() {
  return (
    <main className="relative flex w-full flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <div
          role="log"
          aria-label="Chat messages"
          className="mx-auto max-w-4xl p-4"
        >
          Chat here
        </div>
      </div>
      <div className="absolute bottom-0 w-full pr-2">Form</div>
    </main>
  );
}
