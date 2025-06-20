import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { SocketProvider } from "@/context/socket";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Nexus Meet - Modern Video Conferencing</title>
        <meta name="description" content="Virtual meetings made simple and beautiful" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SocketProvider>
        <Component {...pageProps} />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
          }}
        />
      </SocketProvider>
    </ClerkProvider>
  );
}
