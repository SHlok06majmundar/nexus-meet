import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] w-full items-center justify-center py-12">
      <SignUp />
    </main>
  );
}
