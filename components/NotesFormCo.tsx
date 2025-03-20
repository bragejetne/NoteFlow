"use client";
import { useState, useEffect, Key } from "react";
import { getNotes, deleteNote, updateNote } from "@/lib/notesFromCourses";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, getUserRole } from "@/lib/firebase";
import { query, orderBy, getDocs } from "firebase/firestore";

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  increment,
  collection,
  addDoc,
} from "firebase/firestore";
import { Tag } from "lucide-react";
export default function NotesPage({
  courseCode,
  noteId,
}: {
  courseCode: string;
  noteId: string | null;
}) {
  const [user] = useAuthState(auth);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [noteComments, setNoteComments] = useState<
    { id: string; comment: string; user: string }[]
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState({
    title: "",
    notes: "",
    tags: "",
    lastEdited: new Date(),
  });
  const [role, setRole] = useState<"admin" | "student" | null>(null);
  const [selectedNoteId, setSelectedNoteID] = useState<any | null>(null);
  const [comment, setComment] = useState<string>("");
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Handle favorite toggle
  const handleFavorite = async (noteId: string) => {
    if (!user) return;

    const userRef = doc(db, "brukere", user.uid);
    console.log("bruker" + user.uid)

    // Check if the note is already a favorite
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const isFavorite = userData?.favorites?.includes(noteId);

    // Add or remove from favorites
    await updateDoc(userRef, {
      favorites: isFavorite ? arrayRemove(noteId) : arrayUnion(noteId),
    });

    // Save the favorite status in localStorage
    if (isFavorite) {
      localStorage.removeItem(`favorite_${noteId}`);
    } else {
      localStorage.setItem(`favorite_${noteId}`, "true");
    }

    // Update the notes list (this is optional, depends on how you want to update UI)
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, isFavorite: !isFavorite } : note
      )
    );
  };

  // Fetch notes and check localStorage for favorites

  const updateViewsOnNote = async (noteID: string, courseCode: string) => {
    if (!noteID) {
      return;
    }
    try {
      const noteRef = doc(db, "courses", courseCode, "notes", noteID);
      await updateDoc(noteRef, { views: increment(1) });
    } catch (error) {
      console.log("Feil i oppdatering av views", error);
    }
  };

  useEffect(() => {
    if (!noteId) {
      return;
    } else {
      setSelectedNoteID(noteId);
    }
  }, [noteId]);

  useEffect(() => {
    if (user || courseCode) {
      const fetchNotes = async () => {
        try {
          console.log("Henter notater...");
          const isLoggedIn = user !== null; // Sjekker om bruker er innlogget
          console.log("isLoggedIn: " + isLoggedIn);

          const notesCollection = await getNotes(courseCode, isLoggedIn);

          // const notesWithFavorites = notesCollection;
          // console.log(notesWithFavorites)
          // Hent brukerens favoritter fra Firestore

          let userFavorites = [];
          if (user) {
            const userRef = doc(db, "brukere", user.uid);
            const userDoc = await getDoc(userRef);
            userFavorites = userDoc.data()?.favorites || [];
          }


          // Legg til isFavorite-egenskapen
          const notesWithFavorites = notesCollection.map((note) => ({
            ...note,
            isFavorite: userFavorites.includes(note.id),
            ratings: note.ratings || {},
            ratingCount: note.ratingCount || 0,
            averageRating: note.averageRating || 0,
          }));

          // Sorter notater
          notesWithFavorites.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return b.createdAt - a.createdAt;
          });

          setNotes(notesWithFavorites);

          if (notesWithFavorites.length > 0) {
            setSelectedNote(notesWithFavorites[0]);
            // Set user's current rating if they've rated this note
            if (
              user?.uid &&
              notesWithFavorites[0].ratings &&
              notesWithFavorites[0].ratings[user.uid]
            ) {
              setUserRating(notesWithFavorites[0].ratings[user.uid]);
            } else {
              setUserRating(0);
            }
          }
        } catch (error) {
          console.error("Feil ved henting av notater:", error);
        }
      };
      fetchNotes();
    }

    if (user) {
      const fetchRole = async () => {
        const userRole = await getUserRole(user.uid);
        setRole(userRole); // Sørg for at rollen faktisk oppdateres
      };
      fetchRole();
    }
  }, [user, courseCode, role]);

  // Update user rating when selected note changes
  useEffect(() => {
    if (selectedNote && user) {
      if (selectedNote.ratings && selectedNote.ratings[user.uid]) {
        setUserRating(selectedNote.ratings[user.uid]);
      } else {
        setUserRating(0);
      }
    }
  }, [selectedNote, user]);

  //finner course etter id
  useEffect(() => {
    const findCourseById = async (id: string) => {
      try {
        const isLoggedIn = user !== null; // Sjekker om bruker er innlogget
        const notesCollection = await getNotes(courseCode, isLoggedIn);
        const course = notesCollection.find((note) => note.id === id);
        if (course) {
          setSelectedNote(course); // Store the selected note in state
        }
      } catch (error) {
        console.error("Error fetching note:", error);
      }
    };

    if (selectedNoteId) {
      findCourseById(selectedNoteId);
    }
  }, [selectedNoteId, courseCode]);
  // Handle note deletion
  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(courseCode, noteId);
      const updatedNotes = notes.filter((note) => note.id !== noteId);
      setNotes(updatedNotes);
      // If the deleted note was selected, select the next available one
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Handle edit selection
  const handleEdit = (note: any) => {
    setSelectedNote(note);
    setEditContent({
      title: note.title,
      notes: note.notes,
      tags: note.tags,
      lastEdited: new Date(),
    });
    setIsEditing(true);
  };
  //funksjoner for kommmentarer
  const handleCommentClick = () => {
    console.log(noteComments);
    handleComment();
    setComment("");

    console.log(noteComments);
  };

  const handleComment = async () => {
    try {
      const courseRef = doc(
        db,
        "courses",
        courseCode,
        "notes",
        selectedNote?.id
      );

      const commentsRef = collection(courseRef, "comments");

      await addDoc(commentsRef, {
        user: user?.displayName,
        comment: comment,
        date: new Date(),
      });
    } catch (error) {
      console.error("Feil under publisering av kommentar", error);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const noteRef = doc(
          db,
          "courses",
          courseCode,
          "notes",
          selectedNote?.id
        );
        const commentsCollection = collection(noteRef, "comments");
        const commentsQuery = query(commentsCollection, orderBy("date", "asc"));
        const querySnapshot = await getDocs(commentsQuery);

        const comments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          comment: doc.data().comment,
          user: doc.data().user,
        }));

        setNoteComments(comments);
      } catch (error) {
        console.error("Feil under henting av kommentarer", error);
      }
    };

    if (courseCode && selectedNote?.id) {
      fetchComments();
    }
  }, [courseCode, selectedNote?.id]);

  // Handle note update
  const handleSave = async () => {
    if (
      selectedNote &&
      (user?.uid === selectedNote.userId || role === "admin")
    ) {
      try {
        // Sørg for at tags alltid er en streng før vi kaller .trim()
        const tagsString =
          typeof editContent.tags === "string" ? editContent.tags : "";

        const tagsArray =
          tagsString.trim().length > 0 // Sjekk om det er noen tags
            ? tagsString
              .split(",")
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0) // Splitt og rens
            : [];

        await updateNote(courseCode, selectedNote.id, {
          ...editContent,
          tags: tagsArray,
        });
        const updatedNotes = notes.map((n) =>
          n.id === selectedNote.id
            ? { ...n, ...editContent, tags: tagsArray }
            : n
        );
        setNotes(updatedNotes);

        const updatedNote = updatedNotes.find((n) => n.id === selectedNote.id);
        if (updatedNote) {
          setSelectedNote(updatedNote);
        }

        setIsEditing(false);
      } catch (error) {
        console.error("Error updating note:", error);
      }
    }
  };

  // Handle rating change
  const handleRating = async (rating: number) => {
    if (!user || !selectedNote) return;

    try {
      const noteRef = doc(db, "courses", courseCode, "notes", selectedNote.id);
      const noteDoc = await getDoc(noteRef);

      if (noteDoc.exists()) {
        const noteData = noteDoc.data();
        const ratings = noteData.ratings || {};
        const oldRating = ratings[user.uid] || 0;

        // Update ratings object with user's new rating
        ratings[user.uid] = rating;

        // Calculate new rating stats
        const ratingValues = Object.values(ratings) as number[];
        const ratingCount = ratingValues.length;
        const ratingSum = ratingValues.reduce((sum, val) => sum + val, 0);
        const averageRating = ratingCount > 0 ? ratingSum / ratingCount : 0;

        // Update the note with new rating data
        await updateDoc(noteRef, {
          ratings: ratings,
          ratingCount: ratingCount,
          averageRating: averageRating,
        });

        // Update local state
        setUserRating(rating);

        // Update selected note and notes list
        const updatedSelectedNote = {
          ...selectedNote,
          ratings: ratings,
          ratingCount: ratingCount,
          averageRating: averageRating,
        };

        setSelectedNote(updatedSelectedNote);

        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === selectedNote.id ? updatedSelectedNote : note
          )
        );
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  // Render star rating component
  const renderStars = (interactive = true) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`cursor-pointer text-2xl ${interactive
              ? star <= hoveredRating
                ? "text-yellow-400"
                : star <= userRating
                  ? "text-yellow-400"
                  : "text-gray-300"
              : star <= (selectedNote?.averageRating || 0)
                ? "text-yellow-400"
                : "text-gray-300"
              }`}
            onClick={() => interactive && handleRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
          >
            ★
          </span>
        ))}

        {interactive ? (
          <span className="ml-2 text-sm text-gray-500 ">
            {userRating > 0
              ? `Din vurdering: ${userRating}/5`
              : "Gi din vurdering"}
          </span>
        ) : (
          <span className="ml-2 text-sm text-gray-500">
            {selectedNote?.ratingCount
              ? `${selectedNote.averageRating.toFixed(1)}/5 (${selectedNote.ratingCount
              } vurdering${selectedNote.ratingCount !== 1 ? "er" : ""})`
              : "Ingen vurderinger enda"}
          </span>
        )}
      </div>
    );
  };
  return (
    <div className="flex h-screen">
      {/* Sidebar with Notes List */}
      {/* <div className="w-1/4 bg-gray-100  border-r overflow-auto dark:bg-gray-900 dark:text-white p-4"> */}
      <div className="w-1/4 bg-gray-100 border-r overflow-auto dark:bg-gray-900 dark:text-white p-4 h-full">
        <h2 className="text-lg font-bold mb-4">Notes: {courseCode}</h2>
        <ul>
          {notes.map((note) => (
            <li
              key={note.id}
              className={`cursor-pointer p-2 hover:bg-gray-200 flex justify-between items-center border-b dark:hover:bg-gray-600 ${selectedNote?.id === note.id
                ? "bg-gray-300 dark:bg-gray-700"
                : ""
                }`}
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex flex-col">
                {/* <p className="text-gray-600 dark:text-gray-300">
                  {note.courseCode}
                </p> */}
                {note.title}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="text-sm">{note.userName}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Tags:{" "}
                  {Array.isArray(note.tags) ? note.tags.join(", ") : "No tags"}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Created: {new Date(note.createdAt).toLocaleDateString()}
                </p>
                {note.ratingCount > 0 && (
                  <div className="flex items-center text-sm mt-1">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span>{note.averageRating.toFixed(1)}</span>
                    <span className="text-gray-400 ml-1">
                      ({note.ratingCount})
                    </span>
                  </div>
                )}
              </div>
              {user && (user.uid === note.userId || role === "admin") && (
                <div className="flex gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(note);
                    }}
                    className="text-blue-500 hover:text-white bg-transparent hover:bg-blue-500 px-2 py-2 rounded transition-all duration-200"
                  >
                    ✏️
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note.id);
                    }}
                    className="text-red-500 hover:text-white bg-transparent hover:bg-red-500 px-2 py-2 rounded transition-all duration-200"
                  >
                    🗑️
                  </button>
                </div>
              )}
              {/* Favorite Button */}
              {user && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavorite(note.id);
                  }}
                  className={`bg-transparent hover:bg-yellow-200 px-2 py-2 rounded transition-all duration-200${note.isFavorite
                    ? "text-yellow-400 bg-yellow-500"
                    : "text-gray-500"
                    } mr-2`}
                >
                  {note.isFavorite ? "⭐" : "⭐"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Note Content Section */}
      <div className="flex-1 p-6">
        {selectedNote ? (
          isEditing ? (
            // Edit Form
            <div>
              <h1 className="text-2xl font-bold mb-4">Edit Note</h1>
              <input
                type="text"
                value={editContent.title}
                onChange={(e) =>
                  setEditContent({ ...editContent, title: e.target.value })
                }
                className="w-full p-2 border mb-2"
              />
              <textarea
                value={editContent.notes}
                onChange={(e) =>
                  setEditContent({ ...editContent, notes: e.target.value })
                }
                className="w-full p-2 border"
                rows={5}
              />
              <input
                type="text"
                value={editContent.tags}
                onChange={(e) =>
                  setEditContent({ ...editContent, tags: e.target.value })
                }
                className="w-full p-2 border mb-2"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2 ">
                <div>
                  <h1 className="text-2xl font-bold">{selectedNote.title}</h1>
                  <h2 className="text-sm font-bold text-gray-300 mb-4">
                    Created at:
                    {new Date(selectedNote.createdAt).toLocaleDateString()}, Last
                    edited:
                    {new Date(selectedNote.lastEdited).toLocaleDateString()},
                    Views: {selectedNote.views}, Tags:
                    {Array.isArray(selectedNote.tags)
                      ? selectedNote.tags.join(", ")
                      : "No tags"}, Comments: {noteComments.length}
                  </h2>
                </div>
                {user && (
                  <div className="flex flex-col items-end bg-gray-100 p-4 rounded-lg dark:bg-slate-800">
                    {/* User interaction stars */}
                    {renderStars(true)}
                    {/* Average rating display */}
                    {renderStars(false)}
                  </div>
                )}
              </div>
              <p className="pt-8">
                {selectedNote.notes.split("\n").map((line: string, index: Key | null) => (
                  <span key={index}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              {user && (
                <div className="mt-10 border-t-2 pt-10">
                  <div className="flex gap-2 mb-2">
                    <input
                      className=" bg-white placeholder:text-slate-400 text-black
                     text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                      placeholder="Type here..."
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></input>
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-full"
                      onClick={handleCommentClick}
                    >
                      Comment
                    </button>
                  </div>
                  {noteComments.map((comment) => (
                    <li key={comment.id} className="list-none  mb-2">
                      <div className="border-2 bg-gray-200 dark:bg-gray-600 rounded-lg inline-block justify-between pl-2 pr-2">
                        <p className="font-bold">{comment.user}</p>
                        <p>{comment.comment}</p>
                      </div>
                    </li>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          <p className="text-gray-500">Select a note to view its content</p>
        )}
      </div>
    </div >
  );
}
