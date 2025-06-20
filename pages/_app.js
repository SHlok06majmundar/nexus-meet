import "@/styles/globals.css";

import { SocketProvider } from "@/context/socket";
import { ClerkProvider } from "@clerk/nextjs";

export default function App({ Component, pageProps }) {
  return (
    <ClerkProvider {...pageProps}>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </ClerkProvider>
  );
}
