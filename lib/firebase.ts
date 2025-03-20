import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { getFirestore, collection, addDoc, getDoc, setDoc, doc, getDocs, serverTimestamp, query, where } from "firebase/firestore";

//  Firebase konfigurasjon
const firebaseConfig = {
  apiKey: "AIzaSyCeRMeZS2a7o3ye1BBKKzqsvtssy2qgyDM",
  authDomain: "noteflow-5ad8f.firebaseapp.com",
  projectId: "noteflow-5ad8f",
  storageBucket: "noteflow-5ad8f.firebasestorage.app",
  messagingSenderId: "140355544847",
  appId: "1:140355544847:web:9d903a1c35d578a340c07a",
  measurementId: "G-FWC7754M8B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export { signInWithPopup, signOut };



// Hent gyldige fagkoder fra Firestore
export const getValidCourseCodes = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "courses"));
    return querySnapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error("Error fetching course codes:", error);
    return [];
  }
};


//  Lagre brukerdata i Firestore
export const saveUserToDatabase = async (user: User, role: "admin" | "student") => {
  if (!user.uid) return;

  try {
    await setDoc(doc(db, "brukere", user.uid), {
      name: user.displayName || "Ukjent",
      email: user.email || "Ingen e-post",
      role,
      lastLogin: serverTimestamp(),
    }, { merge: true });

    console.log("Brukerdata lagret i Firestore!");
  } catch (error) {
    console.error("Feil ved lagring av bruker:", error);
  }
};

//  Hent brukerens rolle fra Firestore
export const getUserRole = async (userId: string) => {
  const userDoc = await getDoc(doc(db, "brukere", userId));
  if (userDoc.exists()) {
    return userDoc.data()?.role;
  } else {
    return null; // Hvis bruker ikke har rolle lagret, returner null
  }
};

// Lagre notat i Firestore og valider emnekoder
export const saveNoteToDatabase = async (
  user: any,
  courseCode: string,
  title: string,
  notes: string,
  isPublic: boolean,
  role: "admin" | "student",
  tags: Array<String>,
) => {
  if (!user) return;

  try {
    const validCourseCodes = await getValidCourseCodes();

    // Studenter kan kun bruke eksisterende emnekoder
    if (!validCourseCodes.includes(courseCode)) { //hadde role ==="student" &&
      throw new Error(`Students can only create notes with existing course codes: ${validCourseCodes.join(", ")}`);
    }

    // Lagre notatet i en subcollection under courses/{courseCode}/notes
    const noteRef = doc(collection(db, `courses/${courseCode}/notes`));
    await setDoc(noteRef, {
      userId: user.uid,
      courseCode,
      title,
      notes,
      isPublic,
      createdAt: new Date().toISOString(),
      tags,
    });

    console.log("Note successfully saved to Firestore!");

    // // Hvis brukeren er admin, legg til emnekoden i "courses" hvis den ikke finnes
    // if (role === "admin" && !validCourseCodes.includes(courseCode)) {
    //   const courseRef = doc(db, "courses", courseCode);
    //   await setDoc(courseRef, { name: courseCode }, { merge: true });
    //   console.log(`Added course code ${courseCode} to valid list.`);
    // }

  } catch (error) {
    console.error("Error saving note:", error);
    throw error;
  }
};

export const getCourseList = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "courses"));
    return querySnapshot.docs.map((doc) => doc.id); // Henter dokument-IDene (kurstitlene)
  } catch (error) {
    console.error("Error fetching course list:", error);
    return [];
  }
};

export const createPrivateCourse = async (
  ownerEmail: string,
  groupName: string,
  courseCode: string,
  invitedEmails: string[]
) => {
  const groupRef = doc(db, "privateGroups", groupName); // Dokumentet får navn etter gruppen
  const groupData = {
    name: groupName,
    courseCode: courseCode,
    invitedUsers: invitedEmails, // Liste over inviterte brukere
    owner: ownerEmail, // Lagrer hvem som opprettet gruppen
  };

  await setDoc(groupRef, groupData);

  return { id: groupName, name: groupName, courseCode }; // ✅ Returnerer ID (navn brukes som ID)
};


// Funksjon for å hente private grupper for en bruker
export const getPrivateCourses = async (userEmail: string) => {
  const q = query(
    collection(db, "privateGroups"),
    where("invitedUsers", "array-contains", userEmail) // Finner alle grupper hvor brukeren er invitert
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name,
    courseCode: doc.data().courseCode,
  }));
};

export async function saveCourseToDatabase(courseCode: string, courseName: string, icon: string) {
  const courseRef = doc(collection(db, "courses"), courseCode); // Setter courseCode som ID
  const validCourseCodes = await getValidCourseCodes();

  if (validCourseCodes.includes(courseCode)) {
    throw new Error(`The course already exist: ${validCourseCodes}`);
  }

  await setDoc(courseRef, {
    name: courseCode, // Lagrer courseCode som en egen verdi
    courseName: courseName, // Fullt kursnavn
    icon: icon // Ikon eller bilde
  });
}

// Hent kurs fra Firestore med all data
export const getCourseCodes = async (): Promise<{ courseCode: string, courseName: string, icon: string }[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "courses"));
    return querySnapshot.docs.map((doc) => ({
      courseCode: doc.id, // ID-en blir courseCode
      courseName: doc.data().courseName || "No Name", // Håndter manglende data
      icon: doc.data().icon || "📚" // Standard ikon om ingen finnes
    }));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};