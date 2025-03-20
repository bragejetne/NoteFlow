"use client";

import { useState } from "react";
import { createPrivateCourse } from "@/lib/firebase";
import { X } from "lucide-react";

export default function CreatePrivateGroupModal({ user, onClose, onCreate }: { 
  user: any; 
  onClose: () => void; 
  onCreate: (newCourse: { id: string; name: string; courseCode: string }) => void; 
}) {
  const [groupName, setGroupName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]); // ✅ Legger til invitedEmails state
  const [emailInput, setEmailInput] = useState("");

  // 🔹 Legger til en e-post i listen over inviterte brukere
  const handleAddEmail = () => {
    if (emailInput.trim() && !invitedEmails.includes(emailInput.trim())) {
      setInvitedEmails([...invitedEmails, emailInput.trim()]);
      setEmailInput("");
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    if (!groupName.trim() || !courseCode.trim()) return;

    try {
      const newCourse = await createPrivateCourse(user.email, groupName, courseCode, invitedEmails); // ✅ Bruker invitedEmails

      if (newCourse) { // ✅ Sjekker at newCourse eksisterer før vi bruker id-en
        onCreate(newCourse);
      }

      onClose();
    } catch (error) {
      console.error("Error creating private course:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg relative w-96">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-4">Create Private Group</h2>
        
        <input 
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        />

        <input 
          type="text"
          placeholder="Course Code"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          className="border p-2 w-full rounded mb-2"
        />

        {/* Inviter brukere */}
        <div className="mb-2">
          <input 
            type="email"
            placeholder="Invite user by email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="border p-2 w-full rounded mb-2"
          />
          <button onClick={handleAddEmail} className="bg-blue-600 text-white px-2 py-1 rounded">
            Add
          </button>
        </div>

        {/* Liste over inviterte */}
        {invitedEmails.length > 0 && (
          <div className="mb-2">
            <h3 className="text-sm font-bold">Invited Users:</h3>
            {invitedEmails.map((email, index) => (
              <p key={index} className="text-sm text-gray-700">{email}</p>
            ))}
          </div>
        )}

        <button 
          onClick={handleCreate} 
          className="bg-blue-600 text-white px-4 py-2 mt-4 rounded w-full hover:bg-blue-700 transition"
        >
          Create
        </button>
      </div>
    </div>
  );
}


