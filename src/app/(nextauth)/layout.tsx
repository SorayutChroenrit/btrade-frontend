import { ThemeProvider } from "@/components/providers/Theme-Provider";
import { requireAuth } from "@/lib/auth-utils";
import { AuthProvider } from "@/providers/auth-provider";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
