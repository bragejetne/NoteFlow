"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  auth,
  saveNoteToDatabase,
  getValidCourseCodes,
  getUserRole,
} from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function NoteModal() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<"admin" | "student" | null>(null);
  const [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [validCourseCodes, setValidCourseCodes] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const userRole = await getUserRole(user.uid);
      setRole(userRole);

      const courses = await getValidCourseCodes();
      setValidCourseCodes(courses);
    };

    fetchData();
  }, [user]);

  const handleCreateNote = async () => {
    if (!courseCode || !title || !notes) {
      setErrorMessage("Please fill out all fields!");
      return;
    }

    if (!user) {
      setErrorMessage("You must be logged in to create a note.");
      return;
    }

    // Sjekk om studenten prøver å bruke en emnekode som ikke finnes
    if (role === "student" && !validCourseCodes.includes(courseCode)) {
      setErrorMessage(
        `Students can only create notes with existing course codes: ${validCourseCodes.join(
          ", "
        )}`
      );
      return;
    }

    try {
      await saveNoteToDatabase(
        user,
        courseCode,
        title,
        notes,
        isPublic,
        role!,
        tags
      );

      setCourseCode("");
      setTitle("");
      setNotes("");
      setIsPublic(false);
      setErrorMessage(null);
      setOpen(false);
      setTags([]);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
    console.log("note sucsessfully made");
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-6 w-6" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg dark:bg-slate-900">
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg font-bold">
              Create Note
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-500 hover:text-black"
                onClick={() => setOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {errorMessage && <p className="mt-2 text-red-600">{errorMessage}</p>}

          <div className="mt-4">
            <Label htmlFor="courseCode">Course Code</Label>
            <Input
              id="courseCode"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="E.g., TMA4100"
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Label htmlFor="isPublic">Make Public?</Label>
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={() => setIsPublic(!isPublic)}
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes here..."
            />
          </div>

          <div className="mt-4">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              placeholder="Enter tags separated by commas"
              onChange={(e) =>
                setTags(e.target.value.split(",").map((tag) => tag.trim()))
              }
            />
          </div>

          <Button
            className="mt-4 w-full bg-blue-500 hover:bg-cyan-700 dark:text-white"
            onClick={handleCreateNote}
          >
            Create
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
