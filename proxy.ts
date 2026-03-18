import { withAuth } from "next-auth/middleware";

export const config = {
  matcher: ["/admin/:path*"],
};

export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    authorized: ({ token, req }) => {
      if (req.nextUrl.pathname.startsWith("/admin/login")) {
        return true;
      }
      return Boolean(token);
    },
  },
});
