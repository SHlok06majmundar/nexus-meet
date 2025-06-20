import "@/styles/globals.css";
import { useEffect } from "react";
import { SocketProvider } from "@/context/socket";
import { ClerkProvider } from "@clerk/nextjs";
import { setViewportHeight } from "@/utils/responsiveUtils";

export default function App({ Component, pageProps }) {
  // Initialize responsive viewport height for mobile
  useEffect(() => {
    // Set the viewport height correctly for mobile
    setViewportHeight();

    // Update on resize and orientation change
    const handleResize = () => {
      setViewportHeight();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return (
    <ClerkProvider {...pageProps}>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </ClerkProvider>
  );
}
