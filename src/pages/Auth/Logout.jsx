import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout = ({ setUserRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Hapus state global
    if (setUserRole) setUserRole(null);

    // Hapus data login
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Delay kecil untuk memastikan state ter-update
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 50);
  }, [setUserRole, navigate]);

  return null;
};

export default Logout;
