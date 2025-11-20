import ClientWrapper from "@/components/ClientWrapper";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center justify-center">
        <ClientWrapper />
      </main>
    </div>
  );
}
