import Footer from "./footer";
import NavBar from "./navbar";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
