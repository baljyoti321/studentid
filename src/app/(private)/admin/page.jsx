"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

const Page = () => {
  const [selectedSection, setSelectedSection] = useState("ODD");
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const response = await fetch("/api/admin/getAllStudents");

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();
        console.log("🚀 ~ All Students ~ data:", data);
        setAllStudents(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllStudents();
  }, []);

  const downloadExcel = async (jsonData) => {
    const XLSX = await import("xlsx");

    const cleanedData = jsonData.map(
      ({
        name,
        rollNo,
        section,
        class: studentClass,
        contact,
        fatherName,
        motherName,
        house: houseColor,
        photoLink,
        address,
      }) => ({
        Name: name,
        "Roll No": rollNo,
        Section: section,
        Class: studentClass,
        Contact: contact,
        Address: address,
        FatherName: fatherName,
        MotherName: motherName,
        House: houseColor,
        "Photo URL": { f: `HYPERLINK("${photoLink}", "View Photo")` },
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "DataSheet.xlsx");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h2 className="text-md sm:text-2xl text-black/70">All Students</h2>
        <div>
          <button
            onClick={() => downloadExcel(allStudents.data)}
            className="cursor-pointer px-6 py-2 text-sm font-semibold bg-green-400 text-white rounded-lg hover:bg-green-800 transition-all"
          >
            Export as Excel
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {allStudents.data && allStudents.data.length > 0 ? (
            allStudents.data.map((student, index) => (
              <div
                key={index}
                className="border p-4 gap-5 flex rounded shadow"
              >
                <div>
                  <Image
                    src={student.photoLink || "/placeholder-student.jpg"}
                    width={200}
                    height={200}
                    alt={`Photo of ${student.name}`}
                  />
                </div>

                <div className="text-black font-sans">
                  <h3 className="font-bold">Name: {student.name}</h3>
                  <p>
                    <span className="text-black/40">Class:</span>{" "}
                    {student.class}
                  </p>
                  <p>
                    <span className="text-black/40">Section:</span>{" "}
                    {student.section}
                  </p>
                  <p>
                    <span className="text-black/40">Roll No:</span>{" "}
                    {student.rollNo}
                  </p>
                  
                  <p>
                    <span className="text-black/40">Contact:</span>{" "}
                    {student.contact}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">
              No students found in this section.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
