// "use client";

// import { useEffect, useState } from "react";
// import { ThemeProvider as NextThemesProvider } from "next-themes";

// export default function ThemeProvider({ children }: { children: React.ReactNode }) {
//   return (
//     <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
//       {children}
//     </NextThemesProvider>
//   );
// }

"use client"
 
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
 
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}