import "@/lib/ensure-nextauth-url";
import { withAuth } from "next-auth/middleware";

export default withAuth(
  function _middleware() {},
  {
    pages: { signIn: "/login" },
    callbacks: { authorized: ({ token }) => !!token },
  }
);

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/clientes/:path*",
    "/prestamos/:path*",
    "/recibo",
    "/recibo/:path*",
    "/usuarios",
    "/usuarios/:path*",
  ],
};
