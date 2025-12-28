import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuth() {
      // Get URL hash after # and parse it
      const hash = new URL(window.location.href).hash.substring(1); // remove #
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        // Set session manually
        await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        sessionStorage.setItem("supabase_session", JSON.stringify({
          access_token,
          refresh_token,
        }));
        sessionStorage.setItem("isAuthenticated", "true");

        // Redirect to profile setup
        navigate("/profile-setup-basic");
      } else {
        console.error("OAuth tokens missing in URL hash");
        navigate("/signin");
      }
    }

    handleAuth();
  }, [navigate]);

  return <div className="text-center mt-20">Completing login...</div>;
}