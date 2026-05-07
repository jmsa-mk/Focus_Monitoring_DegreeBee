// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faFacebook,
//   faInstagram,
//   faTiktok,
// } from "@fortawesome/free-brands-svg-icons";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-200 dark:bg-gray-900">

        <div className="w-full bg-white backdrop-blur-md px-10 py-12 shadow-xl dark:bg-gray-800">

            {/* Top grid */}
            <div className="px-6 sm:px-10 md:px-12 lg:px-32 gap-10 items-start
                grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1.2fr_auto]
            ">

            {/* Column 1 */}
            <div>
                <h3 className="font-bold text-gray-900 mb-3 dark:text-white">
                    BeeLearning
                </h3>

                <p className="text-gray-600 text-sm leading-relaxed max-w-xs dark:text-white">
                    Empowering the Way Students Stay
                    Focused and Learn Better
                </p>
            </div>

            {/* Column 2 - support */}
            <div>
                <h3 className="font-bold text-gray-900 mb-3 dark:text-white">
                    Support
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-white ">
                    <li className="hover:text-black cursor-pointer dark:hover:text-gray-300">
                        Help Center
                    </li>
                    <li className="hover:text-black cursor-pointer dark:hover:text-gray-300">
                        Contact Us
                    </li>
                    <li className="hover:text-black cursor-pointer dark:hover:text-gray-300">
                        Privacy Policy
                    </li>
                    <li className="hover:text-black cursor-pointer dark:hover:text-gray-300">
                        Terms of Service
                    </li>
                </ul>
            </div>

            {/* COlumn 3 - coonection*/}
            <div>
                <h3 className="font-bold text-gray-900 mb-3 dark:text-white">
                Connect
                </h3>
                <p className="text-sm text-gray-600 mb-3 dark:text-white">
                    beelearning@gmail.com
                </p>

                <h4 className="font-semibold text-gray-900 dark:text-white">
                    Address
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed mt-1 dark:text-white">
                    Jl. Jenderal Sudirman Blok Lot 11 <br />
                    No.Kav 58, RT.5/RW.3, Senayan, Kec. <br />
                    Kby. Baru, Jakarta Selatan, 12190
                </p>
            </div>

            {/* Column 4 - Social*/}
            <div className="flex md:justify-end gap-3 flex-col">

                <div className="w-9 h-9 flex items-center justify-center rounded-md bg-blue-600 text-white cursor-pointer">
                    {/* <FontAwesomeIcon icon={faFacebook} /> */}
                    <i className="fa-brands fa-facebook"></i>
                </div>

                <div className="w-9 h-9 flex items-center justify-center rounded-md bg-pink-500 text-white cursor-pointer">
                    {/* <FontAwesomeIcon icon={faInstagram} /> */}
                    <i className="fa-brands fa-instagram"></i>
                </div>

                <div className="w-9 h-9 flex items-center justify-center rounded-md bg-black text-white cursor-pointer">
                    {/* <FontAwesomeIcon icon={faTiktok} /> */}
                    <i className="fa-brands fa-tiktok"></i>
                </div>

            </div>

            </div>

            <div className="border-t border-gray-300 dark:border-gray-700 mt-10 pt-6 text-center">

            <p className="text-sm text-gray-600 dark:text-white">
                &copy; {new Date().getFullYear()} DegreeBee. All rights reserved.
            </p>

            </div>

        </div>
    </footer>
  );
}
