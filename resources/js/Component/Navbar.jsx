import { Link, usePage, router } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import Logo from '@/assets/images/logo_backgroundless.png';

export default function Navbar() {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);


  const dropdownRef = useRef(null);
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || "light";
    setTheme(storedTheme);
    document.documentElement.classList.toggle("dark", storedTheme === "dark");
  }, []);

  const handleLogout = () => {
    router.post('/logout');
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setAppearanceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full p-4">
      <div className="max-w-7xl mx-auto mt-3.5 bg-white dark:bg-gray-800 rounded-full px-8 py-3 flex items-center justify-between shadow-md">

        {/* Left (Logo) */}
        <Link href="/explore" className="flex items-center gap-3">
          <img src={Logo} alt="DegreeBee" className="w-10 h-10 object-contain"/>
          <span className="text-xl font-bold text-gray-900 dark:text-white">DegreeBee</span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-10 text-gray-700 dark:text-gray-200 font-medium">
          <Link href="/" className="hover:text-black dark:hover:text-white">Home</Link>
          <Link href={user ? "/explore" : "/register"} className="hover:text-black dark:hover:text-white">Explore Videos</Link>
          <Link href={user ? "/classes" : "/register"} className="hover:text-black dark:hover:text-white">My Classes</Link>
          <Link href="/premium" className="hover:text-black dark:hover:text-white">Premium</Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {!user && (
            <Link
              href="/login"
              className="font-semibold text-[#01A9F2] hover:opacity-60 border border-[#01A9F2] px-4 py-2 rounded-3xl"
            >
              Login
            </Link>
          )}

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2"
              >
                <span className="font-semibold text-gray-900 dark:text-white">{user.name ?? user.email}</span>
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="User" className="w-10 h-10 rounded-full object-cover"/>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-semibold text-gray-600 dark:text-gray-200">
                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-2 z-50">

                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Profile
                  </Link>

                  <Link
                    href="/editProfile"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Edit Profile
                  </Link>

                  <Link
                    href="/manageVideos"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Manage Videos
                  </Link>

                  <Link
                    href="/bookmark"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Saved Videos
                  </Link>

                  <button
                    onClick={() => setAppearanceOpen(!appearanceOpen)}
                    className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                  >
                    Appearance
                    <span>{appearanceOpen ? "▲" : "▼"}</span>
                  </button>

                  {appearanceOpen && (
                    <div className="pl-6 flex flex-col gap-1">
                      <button
                        onClick={toggleTheme}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {theme === "light" ? <Moon /> : <Sun />}
                        {theme === "light" ? "Dark Mode" : "Light Mode"}
                      </button>
                    </div>
                  )}

                  <Link
                    href="/profile/change-password"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Change Password
                  </Link>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
