import Topbar from "@/components/general/Topbar";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Topbar />
      {children}
    </div>
  );
};

export default AuthLayout;
