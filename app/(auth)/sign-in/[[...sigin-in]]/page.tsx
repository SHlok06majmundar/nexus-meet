import { SignIn } from '@clerk/nextjs';

export default function SiginInPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] w-full items-center justify-center py-12">
      <SignIn />
    </main>
  );
}
