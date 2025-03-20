"use client";

import { useState, useEffect } from "react";
import { getPrivateCourses } from "@/lib/firebase";
import { Plus } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import CreatePrivateGroupModal from "@/components/ui/CreatePrivateGroupModal";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { ThemeProvider } from "@/components/themeProvider";
import DarkModeToggle from "@/components/darkButton";

export default function PrivateCourses() {
  const [user, setUser] = useState<any>(null);
  const [privateCourses, setPrivateCourses] = useState<
    { id: string; name: string; courseCode: string }[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser?.email) {
        fetchPrivateCourses(firebaseUser.email);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPrivateCourses = async (email: string | null) => {
    if (!email) {
      console.error("User email is null");
      return;
    }
    const courses = await getPrivateCourses(email);
    setPrivateCourses(
      courses.map((course) => ({
        id: course.id,
        name: course.name || "Unnamed Group",
        courseCode: course.courseCode || "Unknown Code",
      }))
    );
  };

  // Oppdaterer state umiddelbart når en ny gruppe opprettes
  const handleCreatePrivateCourse = (newCourse: {
    id: string;
    name: string;
    courseCode: string;
  }) => {
    setPrivateCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 via-cyan-50 to-white">
      {/* Felles NavBar – med publicTarget="/" for at Public-knappen skal gå til hovedsiden */}
      <Navbar
        setSelectedCourse={() => {}}
        setSelectedNote={() => {}}
        publicTarget="/"
      />

      {/* Sticky header med glass-effekt */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/60 shadow-lg py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-cyan-800">Private Groups</h1>
          <p className="mt-2 text-lg text-cyan-700">
            Administrer dine private grupper og opprett nye med stil.
          </p>
        </div>
      </header>

      {/* Hovedinnhold */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex justify-end mb-8">
          <button
            className="flex items-center space-x-2 bg-cyan-700 hover:bg-cyan-800 transition-all duration-200 text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Create Private Group</span>
          </button>
        </div>

        {privateCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {privateCourses.map((course) => (
              <div
                key={course.id}
                className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-1"
              >
                <h2 className="text-2xl font-bold text-cyan-800 mb-2">{course.name}</h2>
                <p className="text-gray-600 mb-4">{course.courseCode}</p>
                {/* Mulighet for ekstra detaljer kan legges her */}
                <button
                  className="mt-auto inline-block bg-cyan-700 hover:bg-cyan-800 text-white px-4 py-2 rounded transition-colors duration-200"
                  onClick={() => {
                    // Du kan implementere navigasjon eller redigering av gruppen her
                    alert(`Du trykket på gruppen ${course.name}`);
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-12 text-xl">
            No private groups yet. Create one to get started!
          </p>
        )}
      </main>

      {showModal && (
        <CreatePrivateGroupModal
          user={user}
          onClose={() => setShowModal(false)}
          onCreate={handleCreatePrivateCourse}
        />
      )}
    </div>
  );
}
