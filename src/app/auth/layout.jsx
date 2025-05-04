export default function authLayout({ children }) {
  return (
    <>
      <div className=" text-gray-800 flex flex-col  p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="text-5xl font-bold text-center">
          Student Management System
        </h1>

        {children}
      </div>
      ;
    </>
  );
}
