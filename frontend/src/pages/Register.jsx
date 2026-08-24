import { FaUserPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">

      <div className="w-full max-w-[520px] rounded-[28px] bg-white p-8 shadow-2xl">

        <h2 className="mb-5 text-[1.6rem] font-bold">
          <FaUserPlus className="mr-2 inline text-indigo-600" />
          Register
        </h2>

        <form>

          <div className="mb-[18px]">
            <label className="mb-1.5 block text-sm font-medium">
              Full Name *
            </label>

            <input
              type="text"
              placeholder="John Doe"
              className="w-full rounded-[14px] border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
            />
          </div>

          <div className="mb-[18px]">
            <label className="mb-1.5 block text-sm font-medium">
              Email *
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-[14px] border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
            />
          </div>

          <div className="mb-[18px]">
            <label className="mb-1.5 block text-sm font-medium">
              Phone Number *
            </label>

            <input
              type="tel"
              placeholder="+252 63 0000000"
              className="w-full rounded-[14px] border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
            />
          </div>

          <div className="mb-[18px]">
            <label className="mb-1.5 block text-sm font-medium">
              Password *
            </label>

            <input
              type="password"
              placeholder="At least 6 characters"
              className="w-full rounded-[14px] border border-gray-300 bg-gray-50 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30"
          >
            Create Account
          </button>

        </form>

        <p className="mt-3 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600"
          >
            Log In
          </Link>
        </p>

      </div>

    </div>
  );
};

export default Register;