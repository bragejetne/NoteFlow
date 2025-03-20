// 'use client'
// import { Plus } from 'lucide-react';
// import React from 'react'


// const courseComponent = ({ courseCode, target }: { courseCode: string, target: string }) => {
//   return (
//     <div>
//       <p className='w-[20vw] h-[20vh] border-2 rounded-2xl border-black transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:bg-cyan-700 hover:bg-opacity-20 shadow-md shadow-black-800 flex justify-center items-center text-5xl font-mono dark:border-white dark:border-2'>
//         {courseCode}
//       </p>
//     </div>
//   )
// }

// export default courseComponent;

const CourseComponent = ({ 
  courseCode, 
  courseName, 
  icon 
}: { 
  courseCode: string, 
  courseName: string, 
  icon: string 
}) => {
  return (
    <div className="w-[20vw] h-[20vh] border-2 rounded-2xl border-black transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:bg-cyan-700 hover:bg-opacity-20 shadow-md shadow-black-800 flex flex-col justify-center items-center text-center text-2xl font-mono dark:border-white dark:border-2 p-4">
      <span className="text-6xl">{icon}</span>  {/* Viser ikonet */}
      <p className="font-bold">{courseCode}</p>  {/* Kurskode */}
      <p className="text-sm text-gray-600 dark:text-gray-300">{courseName}</p>  {/* Kursnavn */}
    </div>
  );
}

export default CourseComponent;