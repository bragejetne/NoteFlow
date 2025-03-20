"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import Navbar from "@/components/ui/Navbar";

// 1. Definer union-type for gyldige studielinjer
type StudyLineKey = "MTDT" | "MTIØT" | "BIT" | "MTING";

// 2. Definer en type for kursene
type Course = {
  code: string;
  name: string;
};

// 3. Opprett et objekt som map'er studielinjer til kurs
const studyLines: Record<StudyLineKey, Course[]> = {
  MTDT: [
    { code: "TDT4100", name: "Objektorientert programmering" },
    { code: "TDT4180", name: "Menneske–maskin-interaksjon" },
    { code: "TMA4115", name: "Matematikk 3" },
    { code: "TTT4203", name: "Innføring i analog og digital elektronikk" },
    { code: "EXPH0300", name: "Examen philosophicum for naturvitenskap og teknologi" },
    { code: "HMS0002", name: "HMS-kurs for 1. årsstudenter" },
    { code: "TDT4109", name: "Informasjonsteknologi, grunnkurs" },
    { code: "TMA4100", name: "Matematikk 1" },
    { code: "TMA4140", name: "Diskret matematikk" },
  ],
  "MTIØT": [
    { code: "TTM4100", name: "Kommunikasjon - Tjenester og nett" },
    { code: "TDT4100", name: "Objektorientert programmering" },
    { code: "TMA4115", name: "Matematikk 3" },
    { code: "EXPH0300", name: "Examen philosophicum for naturvitenskap og teknologi" },
    { code: "HMS0002", name: "HMS-kurs for 1. årsstudenter" },
    { code: "TDT4109", name: "Informasjonsteknologi, grunnkurs" },
    { code: "TMA4100", name: "Matematikk 1" },
    { code: "TMA4140", name: "Diskret matematikk" },
    { code: "TIØ4101", name: "Organisasjonsteori og selskapsrett" },
  ],
  BIT: [
    { code: "EXPH0300", name: "Examen philosophicum for naturvitenskap og teknologi" },
    { code: "HMS0002", name: "HMS-kurs for 1. årsstudenter" },
    { code: "IT2805", name: "Webteknologi" },
    { code: "MA0001", name: "Brukerkurs i matematikk A" },
    { code: "TDT4109", name: "Informasjonsteknologi, grunnkurs" },
    { code: "MA0301", name: "Elementær diskret matematikk" },
    { code: "TDT4100", name: "Objektorientert programmering" },
    { code: "TDT4180", name: "Menneske–maskin-interaksjon" },
    { code: "TTM4100", name: "Kommunikasjon - Tjenester og nett" },
  ],
  MTING: [
    { code: "TDT4109", name: "Informasjonsteknologi, grunnkurs" },
    { code: "TMA4100", name: "Matematikk 1" },
    { code: "TMA4140", name: "Diskret matematikk" },
    { code: "TMR4325", name: "Ingeniørvitenskap og IKT, introduksjon" },
    { code: "TDT4100", name: "Objektorientert programmering" },
    { code: "TKT4116", name: "Mekanikk 1" },
    { code: "TMA4105", name: "Matematikk 2" },
    { code: "TMA4245", name: "Statistikk" },
  ],
};

export default function ProfilePage() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  // State for studielinjen som brukeren skriver inn
  const [studyLine, setStudyLine] = useState("");
  // State for kursene som hører til den studielinjen
  const [courses, setCourses] = useState<Course[]>([]);

  // State for valgte kurs (dersom valgt via NavBar)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  // Redirect hvis ikke innlogget
  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Oppdater kurslisten når studyLine endres
  useEffect(() => {
    const lineKey = studyLine.toUpperCase() as StudyLineKey;
    if (lineKey in studyLines) {
      setCourses(studyLines[lineKey]);
    } else {
      setCourses([]);
    }
  }, [studyLine]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* NavBar – med publicTarget="/" slik at Public-knappen går til hovedsiden */}
      <Navbar
        setSelectedCourse={setSelectedCourse}
        setSelectedNote={setSelectedNote}
        publicTarget="/"
      />

      {/* Profilheader med glass-effekt */}
      <header className="relative bg-cyan-700 bg-opacity-80 backdrop-blur-md py-8 shadow-lg">
        <div className="max-w-2xl mx-auto text-center">
          <Image
            src={user.photoURL || "/default-profile.png"}
            alt="Profilbilde"
            width={120}
            height={120}
            className="mx-auto rounded-full shadow-xl border-4 border-white"
          />
          <h1 className="mt-4 text-3xl font-extrabold text-white">{user.displayName}</h1>
          <p className="mt-2 text-lg text-cyan-200">{user.email}</p>
        </div>
      </header>

      {/* Studielinjesøk og kursvisning */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-cyan-800 mb-4 text-center">
            Skriv inn studielinjen din
          </h2>
          <p className="text-center text-gray-600 mb-6">
            For eksempel: MTDT, MTIØT, BIT, MTING
          </p>
          <input
            type="text"
            value={studyLine}
            onChange={(e) => setStudyLine(e.target.value)}
            placeholder="Skriv inn studielinje"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />

          {studyLine && (
            <div className="mt-6">
              {courses.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold text-cyan-700 mb-4">
                    Mulige fag for {studyLine.toUpperCase()}:
                  </h3>
                  <ul className="space-y-3">
                    {courses.map((course) => (
                      <li
                        key={course.code}
                        className="p-3 bg-cyan-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <span className="font-bold text-cyan-800">{course.code}</span>: {course.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                studyLine.trim() !== "" && (
                  <p className="mt-4 text-center text-red-500 font-semibold">
                    Ingen kurs funnet for linjen "{studyLine}". Sjekk stavemåten.
                  </p>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
