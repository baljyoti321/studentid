import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className=" text-gray-800 flex flex-col  p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-6xl mt-20 text-black font-bold text-start sm:text-center">
        Shree Baljyoti Secondary School
      </h1>
      <h1 className="text-3xl font-bold text-center">
        Student Management System{" "}
      </h1>

      <div className="flex items-center justify-center sm:flex-row flex-col gap-4">
        <Link href="/auth/teacher">
          <button className="px-12 cursor-pointer py-3 text-lg font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Login
          </button>
        </Link>
        {/* <Link href="/auth/admin">
          <button className="px-6 cursor-pointer py-3 text-lg font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
            Login as Admin
          </button>
        </Link> */}
      </div>
    </div>
  );
}
