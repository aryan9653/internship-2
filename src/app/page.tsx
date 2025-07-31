import ChatInterface from '@/components/chat-interface';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center w-screen h-screen bg-background">
      <div className="w-full max-w-lg h-full sm:h-[95vh] sm:max-h-[800px] flex flex-col rounded-none sm:rounded-2xl bg-card shadow-xl border overflow-hidden">
        <header className="p-4 border-b bg-muted/50">
          <h1 className="text-xl font-bold text-center text-foreground font-headline">
            DriveWhizz
          </h1>
          <p className="text-sm text-center text-muted-foreground">
            Your WhatsApp-Powered Google Drive Assistant
          </p>
        </header>
        <ChatInterface />
      </div>
    </main>
  );
}
