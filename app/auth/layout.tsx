import React from "react"
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {children}
    </div>
  );
}
