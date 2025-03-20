import { collection, query, getDocs, doc, getDoc, where, deleteDoc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Updates a note inside a specific course
 * @param courseCode - The course where the note is stored (e.g., "TDT4100")
 * @param noteId - The ID of the note to update
 * @param updatedData - The updated data for the note
 */
export async function updateNote(
  courseCode: string,
  noteId: string,
  updatedData: any
) {
  const noteRef = doc(db, "courses", courseCode, "notes", noteId);
  return updateDoc(noteRef, updatedData);
}

/**
 * Deletes a note from a specific course
 * @param courseCode - The course where the note is stored
 * @param noteId - The ID of the note to delete
 */
export async function deleteNote(courseCode: string, noteId: string) {
  try {
    await deleteDoc(doc(db, "courses", courseCode, "notes", noteId));
    console.log("Note deleted successfully");
  } catch (error) {
    console.log("Error deleting note", error);
  }
}

/**
 * Fetches notes from a specific course, sorted by oldest first.
 * @param courseCode - The course code to fetch notes from (e.g., "TDT4100").
 */
export async function getNotes(courseCode: string, isLoggedIn: boolean) {
  if (!courseCode) {
    throw new Error("Course code is required to fetch notes.");
  }

  // Query the notes subcollection and order by createdAt (oldest first)
  const notesCollectionRef = collection(db, "courses", courseCode, "notes");

  let notesQuery;

  if (isLoggedIn) {
    console.log("Henter ALLE notater...");
    notesQuery = query(notesCollectionRef, orderBy("createdAt", "asc"));
    console.log("Test")
  } else {
    console.log("Henter KUN offentlige notater...");
    notesQuery = query(
      notesCollectionRef,
      where("isPublic", "==", true)
    )
  }

  console.log("isLoffedIn" + isLoggedIn)
  const notesSnapshot = await getDocs(notesQuery);
  console.log("isLoffedIn" + isLoggedIn)

  if (isLoggedIn) {
    console.log("Kommet inn hvis true")
    const notesWithUserNames = await Promise.all(
      notesSnapshot.docs.map(async (noteDoc) => {
        const noteData = noteDoc.data();
        const userId = noteData.userId;
        const createdAt = noteData.createdAt || null; // Ensure createdAt is handled properly
        const ratings = noteData.ratings;
        const ratingCount = noteData.ratingCount;
        const averageRating = noteData.averageRating;

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
          ratings,
          ratingCount,
          averageRating, 
          ...noteData, // Spread remaining note data
        };
      })
    );

    return notesWithUserNames;
  } else {
    console.log("Kommet inn hvis false")
    const notesWithUserNames = await Promise.all(
      notesSnapshot.docs.map(async (noteDoc) => {
        const noteData = noteDoc.data();
        const createdAt = noteData.createdAt || null; // Ensure createdAt is handled properly
        const ratings = noteData.ratings;
        const ratingCount = noteData.ratingCount;
        const averageRating = noteData.averageRating;

        let userName = "Unknown User";

        return {
          id: noteDoc.id,
          userName,
          createdAt, // Include createdAt in the returned object
          ratings,
          ratingCount,
          averageRating, 
          ...noteData, // Spread remaining note data
        };
      })
    );

    return notesWithUserNames;
  }
}
