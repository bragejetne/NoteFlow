"use client";

import { useState, useEffect } from "react";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { getUserRole, saveUserToDatabase } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuthState } from "react-firebase-hooks/auth";

export default function AuthButton() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<"admin" | "student" | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const userRole = await getUserRole(user.uid);
        setRole(userRole); // Sørg for at rollen faktisk oppdateres
        if (!userRole) {
          setIsRoleModalOpen(true); // Hvis ingen rolle er satt, åpne valgmodal
        }
      } else {
        setRole(null);
      }
    };

    fetchRole();
  }, [user]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (!result.user) return;

      setIsRoleModalOpen(true); // Åpner rollevalget ved innlogging
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleSelectRole = async (selectedRole: "admin" | "student") => {
    if (!user) return;

    await saveUserToDatabase(user, selectedRole);
    setRole(selectedRole); // Oppdaterer frontend-tilstanden
    setIsRoleModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRole(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {user ? (
          <>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border border-gray-400 text-black hover:bg-gray-200 dark:text-white"
            >
              <LogOut className="h-5 w-5 mr-1 text-black dark:text-white" /> Logout
            </Button>
          </>
        ) : (
          <Button
            onClick={handleLogin}
            className="bg-white text-cyan-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition flex items-center"
          >
            <LogIn className="h-5 w-5 mr-2 text-cyan-700" /> Sign in with Google
          </Button>
        )}
      </div>

      {/* Rollevalg-modal */}
      <Dialog.Root open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
          <Dialog.Title className="text-lg font-bold">Choose Role</Dialog.Title>
          <p className="mt-2 text-sm text-gray-600">Choose whether you are an administrator or a student.</p>

          <div className="mt-4 flex justify-around">
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleSelectRole("admin")}>
              Administrator
            </Button>
            <Button className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleSelectRole("student")}>
              Student
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}


