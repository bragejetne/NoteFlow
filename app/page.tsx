"use client";

import { auth, getCourseCodes, getUserRole } from "@/lib/firebase";
import CourseComponent from "@/components/courseComponent";
import Navbar from "@/components/ui/Navbar"; // Import the Navbar
import { useEffect, useState } from "react";
import { getValidCourseCodes } from "@/lib/firebase";

import NotesFormCo from "@/components/NotesFormCo";
import CourseModal from "@/components/CourseModal";
import { useAuthState } from "react-firebase-hooks/auth";
import { onSnapshot, doc } from "firebase/firestore";

import { db } from "@/lib/firebase"; // Import Firestore instansen
export default function Home() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<"admin" | "student" | null>(null);
  const [courses, setCourses] = useState<{ courseCode: string; icon: string, courseName: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchCourses = async () => {
  //     const courseCodes = await getValidCourseCodes();
  //     const formattedCourses = courseCodes.map((code) => ({
  //       courseCode: code,
  //       icon: "", // Add the 'icon' property
  //       courseName: "", // Add the 'courseName' property
  //     }));
  //     setCourses(formattedCourses);
  //   };
  //   fetchCourses();
  // }, []);

  useEffect(() => {
    const fetchOtherCourses = async () => {
      const courseList = await getCourseCodes(); // Nå henter vi hele objektet
      const formattedCourses = courseList.map((course) => ({
        courseCode: course.courseCode,
        courseName: course.courseName,
        icon: course.icon,
        target: "/notes1",
      }));
      setCourses(formattedCourses);
    };
    fetchOtherCourses();
  }, []);


  // useEffect(() => {
  //   if (user) {
  //     const fetchRole = async () => {
  //       const userRole = await getUserRole(user.uid);
  //       setRole(userRole); // Sørg for at rollen faktisk oppdateres
  //       console.log("UserRole:" + userRole)
  //     };
  //     fetchRole();
  //   }
  // }, [user]);

  useEffect(() => {
    if (!user) {
      setRole(null);
      return;
    }
    const userDocRef = doc(db, "brukere", user.uid); // Firestore referanse
    // 🔥 Lytt på endringer i Firestore og oppdater rollen i sanntid
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setRole(userData.role); // Oppdaterer rollen uten refresh
        console.log("UserRole updated:", userData.role);
      }
    });
    return () => unsubscribe(); // Rydder opp når komponent unmountes
  }, [user]); // Kjør bare når `user` endres


  return (
    <main>
      {/* Nå rendres NavBar kun her (hovedsiden), med de nødvendige props */}
      <Navbar
        setSelectedCourse={setSelectedCourse}
        setSelectedNote={setSelectedNote}
      />

      {selectedCourse ? (
        <div>
          <NotesFormCo courseCode={selectedCourse} noteId={selectedNote} />
        </div>
      ) : (
        <div className="flex justify-center items-center pt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16">
            {/* <button className="w-[20vw] h-[20vh] border-2 text-blue-500 rounded-2xl border-black shadow-lg transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:bg-cyan-700 hover:bg-opacity-20 flex justify-center items-center text-5xl font-mono dark:border-white dark:border-2 margin-left-10">
              <Plus className="h-10 w-10"/>
              new Course
            </button> */}
            {user && role === "admin" && (
              <div className="w-[20vw] h-[20vh] border-2 text-blue-500 rounded-2xl border-black shadow-lg transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:bg-cyan-700 hover:bg-opacity-20 flex justify-center items-center text-5xl font-mono dark:border-white dark:border-2 margin-left-10">
                <CourseModal />
              </div>
            )}
            {courses.map((course, index) => (
              <div
                key={index}
                onClick={() => setSelectedCourse(course.courseCode)}
              >
                <CourseComponent
                  courseCode={course.courseCode}
                  courseName={course.courseName}
                  icon={course.icon}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

