import React from "react"
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-background to-secondary min-h-screen">
      {children}
    </div>
  );
}
