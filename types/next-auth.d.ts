import type { UserRole } from "@/lib/enums";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: UserRole;
    usuario: string;
    email?: string | null;
  }
  interface Session {
    user: {
      id: string;
      usuario: string;
      name: string;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    usuario: string;
  }
}
