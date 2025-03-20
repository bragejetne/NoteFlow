"use client";

import { useState, useEffect } from "react";
import AuthButton from "@/components/AuthButton";
import Image from "next/image";
import { Search } from "lucide-react";
import { getCourseList } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import DarkModeToggle from "@/components/darkButton";
import { getNotes } from "@/lib/notesFromAllCourses";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

interface NavbarProps {
  setSelectedCourse: (course: string | null) => void;
  setSelectedNote: (note: string | null) => void;
  publicTarget?: string;
}

export default function Navbar({
  setSelectedCourse,
  setSelectedNote,
  publicTarget = "/public",
}: NavbarProps) {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<string[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notes, setNotes] = useState<
    { id: string; title: string; tags: string; courseCode: string }[]
  >([]);
  const [filteredNotes, setFilteredNotes] = useState<
    { id: string; title: string; tags: string; courseCode: string }[]
  >([]);

  const router = useRouter();
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await getCourseList();
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const fetchedNotes = await getNotes();
        setNotes(
          fetchedNotes.map((note) => ({
            id: note.id,
            title: note.title,
            tags: Array.isArray(note.tags) ? note.tags.join(", ") : "",
            courseCode: note.courseCode,
          }))
        );
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };
    fetchNotes();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredCourses([]);
      setFilteredNotes([]);
      setShowDropdown(false);
    } else {
      const filteredC = courses.filter((course) =>
        course.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredCourses(filteredC.length > 0 ? filteredC : []);

      const filteredN = notes.filter((note) =>
        note.tags.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredNotes(filteredN);

      setShowDropdown(filteredC.length > 0 || filteredN.length > 0);
    }
  }, [search, courses, notes]);

  return (
    <nav className="flex justify-between items-center p-4 bg-blue-500 text-white">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            setSelectedCourse(null);
            setSearch("");
            router.push("/");
          }}
        >
          <Image
            src="/2logo_noteflow.svg"
            alt="NoteFlowlogo"
            width={140}
            height={140}
            priority
          />
        </button>
      </div>

      {/* Søkelinje med dropdown */}
      <div className="relative w-[35%]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Browse courses"
          className="w-full py-2 pl-10 pr-4 text-black rounded-full focus:outline-none focus:ring-2 focus:ring-white dark:text-white dark:bg-slate-900"
        />

        {showDropdown && (
          <ul className="absolute w-full bg-white text-black border border-gray-300 rounded-lg mt-1 shadow-lg max-h-48 overflow-auto z-10 dark:bg-gray-600 dark:text-white">
            {filteredCourses.map((course) => (
              <li
                key={course}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setSearch("");
                  setSelectedCourse(course);
                  setShowDropdown(false);
                }}
              >
                {course}
              </li>
            ))}

            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setSearch("");
                  setSelectedCourse(note.courseCode);
                  setSelectedNote(note.id);
                  setShowDropdown(false);
                }}
              >
                {note.title + " (" + note.tags + ")"}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Public & Private knapper */}
      <div className="flex space-x-4">
        <button
          className="px-4 py-2 bg-blue-400 hover:bg-blue-600 text-white rounded"
          onClick={() => router.push(publicTarget)}
        >
          Public
        </button>
        <button
          className="px-4 py-2 bg-slate-700 hover:bg-gray-600 text-white rounded"
          onClick={() => router.push("/private")}
        >
          Private
        </button>
      </div>

      {/* Profilbilde, brukernavn, AuthButton og DarkModeToggle */}
      <div className="flex items-center space-x-4">
        {user && (
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center space-x-2 hover:underline"
          >
            <Image
              src={user.photoURL || "/default-profile.png"}
              alt="Profilbilde"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span>{user.displayName}</span>
          </button>
        )}

        <AuthButton />
        <DarkModeToggle />
      </div>
    </nav>
  );
}
