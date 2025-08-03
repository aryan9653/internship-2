
import ChatInterface from '@/components/chat-interface';

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex h-screen w-full max-w-lg flex-col overflow-hidden border bg-card shadow-xl sm:h-[calc(100%-4rem)] sm:max-h-[800px] sm:rounded-2xl">
        <header className="border-b bg-muted/50 p-4">
          <h1 className="text-center text-xl font-bold text-foreground">
            DriveWhizz
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            Your Google Drive Assistant
          </p>
        </header>
        <ChatInterface />
      </div>
    </main>
  );
}
