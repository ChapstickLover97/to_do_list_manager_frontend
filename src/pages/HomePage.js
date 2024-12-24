import React from "react";
import { useOktaAuth } from "@okta/okta-react";

const HomePage = () => {
  const { oktaAuth, authState } = useOktaAuth();

  if (!authState) {
    // Auth state is still loading
    return <div>Loading...</div>;
  }

  const handleLogin = async () => {
    try {
      await oktaAuth.signInWithRedirect();
    } catch (error) {
      console.error("Login failed: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await oktaAuth.signOut();
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };

  return (
    <div>
      <h1>Welcome to the To-Do Manager</h1>
      {!authState.isAuthenticated ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
};

export default HomePage;
