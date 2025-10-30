import { Navbar } from "./Navbar";

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-gray-900 min-h-screen h-full flex flex-col ">
      <Navbar />
      <main className="px-4">{children}</main>
    </div>
  );
};
