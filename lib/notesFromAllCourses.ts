import { collection, query, getDocs, doc, getDoc, orderBy } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetches notes from all courses, sorted by oldest first.
 */
export async function getNotes() {
  try {
    // Query all courses in the 'courses' collection
    const coursesCollectionRef = collection(db, "courses");
    const coursesSnapshot = await getDocs(coursesCollectionRef);
    
    // Fetch notes from all courses
    const allNotes = await Promise.all(
      coursesSnapshot.docs.map(async (courseDoc) => {
        const courseCode = courseDoc.id;
        const notesCollectionRef = collection(db, "courses", courseCode, "notes");
        const notesQuery = query(notesCollectionRef, orderBy("createdAt", "asc"));
        const notesSnapshot = await getDocs(notesQuery);
        
        // Fetch note details including user name
        const notesWithUserNames = await Promise.all(
          notesSnapshot.docs.map(async (noteDoc) => {
            const noteData = noteDoc.data();
            const userId = noteData.userId;
            const createdAt = noteData.createdAt || null; // Ensure createdAt is handled properly
            const title = noteData.title;
            const tags = noteData.tags;

            let userName = "Unknown User";
            if (userId) {
              const userDocRef = doc(db, "brukere", userId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                userName = userDocSnap.data().name;
              }
            }

            return {
              id: noteDoc.id,
              userName,
              createdAt, // Include createdAt in the returned object
              courseCode,
              title,
              tags, // Include courseCode in the returned object to identify the course
              ...noteData, // Spread remaining note data
            };
          })
        );
        
        return notesWithUserNames;
      })
    );

    // Flatten the nested array of notes and return all notes from all courses
    return allNotes.flat(); // Flattening the array of arrays into a single array
  } catch (error) {
    console.error("Error fetching notes from all courses:", error);
    throw error; // Re-throw the error after logging it
  }
}
