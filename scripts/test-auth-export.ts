import { auth, authConfig } from "@/lib/auth";

console.log("authConfig type:", typeof authConfig);
console.log("auth type:", typeof auth);
console.log("auth:", auth);

if (typeof auth === "function") {
  console.log("✓ auth is a function");
} else {
  console.log("✗ auth is NOT a function, it's:", typeof auth);
}
