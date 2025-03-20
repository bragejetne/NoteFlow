"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, saveCourseToDatabase, getUserRole, getValidCourseCodes } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function CourseModal() {
    const [user] = useAuthState(auth);
    const [role, setRole] = useState<"admin" | "student" | null>(null);
    const [open, setOpen] = useState(false);
    const [courseCode, setCourseCode] = useState("");
    const [courseName, setCourseName] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("📚"); // Default ikon
    const [validCourseCodes, setValidCourseCodes] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Liste med ikoner å velge mellom
    const availableIcons = ["📚", "🖥️", "⚙️", "🧪", "📊", "🎨", "💰", "🧮"];

    useEffect(() => {
        const fetchRole = async () => {
            if (user) {
                const userRole = await getUserRole(user.uid);
                setRole(userRole);
                
                const courses = await getValidCourseCodes();
                      setValidCourseCodes(courses);
            }
        };
        fetchRole();
    }, [user]);

    const handleCreateCourse = async () => {
        if (!courseCode || !courseName) {
            setErrorMessage("Please fill out all fields!");
            return;
        }

        if (!user) {
            setErrorMessage("You must be logged in to create a course.");
            return;
        }

        if (role !== "admin") {
            setErrorMessage("Only admins can create courses.");
            return;
        }
        
        if (validCourseCodes.includes(courseCode)) {
            setErrorMessage(`The course already exist: ${courseCode}`);
            return;
          }
        

        try {
            await saveCourseToDatabase(courseCode, courseName, selectedIcon);
            setCourseCode("");
            setCourseName("");
            setSelectedIcon("📚"); // Reset til standardikon
            setErrorMessage(null);
            setOpen(false);
        } catch (error: any) {
            setErrorMessage(error.message);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button
                    onClick={() => setOpen(true)}
                    className="flex justify-center items-center p-7 font-bold text-[35px]"
                >  
                    <Plus className="h-9 w-9" />
                    New Course
                </button>
            </Dialog.Trigger>

            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg dark:bg-slate-900">
                    <div className="flex justify-between items-center">

                        <Dialog.Title className="text-lg font-bold">
                            Create Course
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

                    <div className="mt-4">
                        <Label htmlFor="courseName">Course Name</Label>
                        <Input
                            id="courseName"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="E.g., Calculus 1"
                        />
                    </div>

                    <div className="mt-4">
                        <Label>Choose an Icon</Label>
                        <div className="flex flex-wrap gap-2">
                            {availableIcons.map((icon) => (
                                <button
                                    key={icon}
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`p-2 text-2xl rounded-lg ${selectedIcon === icon ? "border-2 border-blue-500" : "border border-gray-300"}`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="mt-4 w-full bg-blue-500 hover:bg-cyan-700 dark:text-white"
                        onClick={handleCreateCourse}
                    >
                        Create Course
                    </Button>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
