"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "@/app/helpers/cookieHelper";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { useForm } from "react-hook-form";

const Page = () => {
  // State for student data
  const router = useRouter();
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for form handling
  const [addStudentForm, setAddStudentForm] = useState(false);
  const [addingStudentState, setAddingStudentState] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  
  // State for delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);


    const [teacherInfo, setTeacherInfo] = useState(null);
    const [selectedSection, setSelectedSection] = useState("ODD");
    const [students, setStudents] = useState([]);
    const [editingStudent, setEditingStudent] = useState(null);
  




  // Form handling
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();

  
  useEffect(() => {
    const cookie = getCookie("token");

    if (!cookie) {
      // If no token exists, redirect to login
      router.push("/auth/teacher");
      return;
    }
  }, [])

  // Fetch all students
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

  // Toggle add student form
  // const toggleAddStudents = () => {
  //   setAddStudentForm(!addStudentForm);
  //   if (!addStudentForm) {
  //     setIsEditMode(false);
  //     reset();
  //   }
  // };

  const toggleAddStudents = () => {
    setAddStudentForm((prev) => !prev);
    setAddingStudentState(false);
    setIsEditMode(false);
    setEditingStudent(null);
    reset();
  };


  // Handle edit student
  const handleEditStudent = (student) => {
    setStudentToEdit(student);
    setEditingStudent(student);
    setIsEditMode(true);
    setAddStudentForm(true);
   
    
    
    // Set form values
    setValue("name", student.name);
    setValue("class", student.class);
    setValue("rollNo", student.rollNo);
    setValue("section", student.section);
    setValue("house", student.house);
    setValue("address", student.address || "");
    setValue("contact", student.contact);
    setValue("fatherName", student.fatherName || "");
    setValue("motherName", student.motherName || "");
  };

  // Handle delete click
  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteConfirmation(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      const token = getCookie("token");
      const response = await fetch(`/api/student/deleteStudent?id=${studentToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete student");
      }

      // Refresh student list
      const updatedStudents = allStudents.data.filter(
        (s) => s._id !== studentToDelete._id
      );
      setAllStudents({ data: updatedStudents });
      setDeleteConfirmation(false);
      setStudentToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation(false);
    setStudentToDelete(null);
  };

  const onSubmit = async (data) => {
    try {
      const token = getCookie("token");
      const formData = new FormData();

      // Common form fields for both create and update
      formData.append("name", data.name);
      formData.append("clas", data.class);
      formData.append("rollNo", data.rollNo.toString());
      formData.append("section", data.section);
      formData.append("house", data.house);
      formData.append("address", data.address);
      formData.append("contact", data.contact);
      formData.append("fatherName", data.fatherName);
      formData.append("motherName", data.motherName);

      if (data.file && data.file[0]) {
        formData.append("file", data.file[0]);
      }

      let response;
      
      if (isEditMode && editingStudent) {
        // Add the student ID for updates
        formData.append("studentId", editingStudent._id);
        
        response = await axios.put(
          "/api/student/updateStudent",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setAddingStudentState(true);
          toast.success("Student updated successfully!");
        }
      } else {
        response = await axios.post(
          "/api/student/createStudent",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          setAddingStudentState(true);
          toast.success("Student added successfully!");
        }
      }

      // Refresh student list
      const updatedResponse = await fetch("/api/student/getStudents");
      const updatedData = await updatedResponse.json();
      setStudents(updatedData);
    } catch (error) {
      toast.error(`Error ${isEditMode ? 'updating' : 'adding'} student: ${error.response?.data?.message || error.message}`);
    }
  };

  // Download Excel
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
        <div className="flex gap-2">
          <button
            onClick={toggleAddStudents}
            className="cursor-pointer px-6 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-800 transition-all"
          >
            Add Student
          </button>
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
              <div key={index} className="border p-4 gap-5 flex rounded shadow">
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
                    <span className="text-black/40">Class:</span> {student.class}
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
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleEditStudent(student)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(student)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-all"
                    >
                      Delete
                    </button>
                  </div>
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

      {/* Add/Edit Student Form */}
      {addStudentForm && !addingStudentState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={toggleAddStudents}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl text-black font-bold mb-6 text-center">
              {isEditMode ? "Edit Student" : "Add New Student"}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-lg mx-auto text-black/60 p-6 bg-white rounded-lg shadow-md"
            >
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Student Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  placeholder="Enter student name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">Name is required</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="class"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Class
                </label>
                <select
                  id="class"
                  {...register("class", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                >
                  <option value="">Select Class</option>
                  <option value="PG">PG</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
                {errors.class && (
                  <p className="text-red-500 text-xs mt-1">Class is required</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="section"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Section
                </label>
                <select
                  id="section"
                  {...register("section", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                >
                  <option value="">Select Section</option>
                  <option value="ODD">ODD</option>
                  <option value="EVEN">EVEN</option>
                  <option value="NM">NM</option>
                </select>
                {errors.section && (
                  <p className="text-red-500 text-xs mt-1">
                    Section is required
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="house"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  House
                </label>
                <select
                  id="house"
                  {...register("house", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                >
                  <option value="">Select House</option>
                  <option value="red">RED</option>
                  <option value="blue">BLUE</option>
                  <option value="green">GREEN</option>
                  <option value="yellow">YELLOW</option>
                </select>
                {errors.house && (
                  <p className="text-red-500 text-xs mt-1">
                    House is required
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="rollNo"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Roll Number
                </label>
                <input
                  type="number"
                  id="rollNo"
                  {...register("rollNo", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  placeholder="Enter roll number"
                />
                {errors.rollNo && (
                  <p className="text-red-500 text-xs mt-1">
                    Roll number is required
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="file"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Student Photo {isEditMode && "(Leave empty to keep current photo)"}
                </label>
                <input
                  type="file"
                  id="file"
                  accept="image/*"
                  {...register("file")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                />
                {errors.photo && !isEditMode && (
                  <p className="text-red-500 text-xs mt-1">Photo is required</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="fatherName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Father's Name
                </label>
                <input
                  type="text"
                  id="fatherName"
                  {...register("fatherName", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  placeholder="Enter father's name"
                />
                {errors.fatherName && (
                  <p className="text-red-500 text-xs mt-1">
                    Father's name is required
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="motherName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Mother's Name
                </label>
                <input
                  type="text"
                  id="motherName"
                  {...register("motherName", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  placeholder="Enter mother's name"
                />
                {errors.motherName && (
                  <p className="text-red-500 text-xs mt-1">
                    Mother's name is required
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  {...register("address", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  placeholder="Enter address"
                  rows="3"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    Address is required
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="contact"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contact"
                  {...register("contact", { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  placeholder="Enter contact number"
                />
                {errors.contact && (
                  <p className="text-red-500 text-xs mt-1">
                    Contact number is required
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 text-lg font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {isEditMode ? "Update Student" : "Add Student"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Delete</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{studentToDelete.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;