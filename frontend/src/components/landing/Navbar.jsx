import { Globe, LogIn } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function Navbar() {
  const { language, changeLanguage, t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        <div className="h-16 sm:h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-800 flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">
                ज
              </span>
            </div>

            <span className="text-base sm:text-xl font-bold text-green-900">
              JanSamadhan
            </span>

          </div>


          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Language */}
            <div className="flex items-center border border-gray-200 rounded-lg p-0.5 sm:p-1">

              <Globe
                size={14}
                className="ml-1 text-gray-500 hidden sm:block"
              />

              <button
                onClick={() => changeLanguage("hi")}
                className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                  language === "hi"
                    ? "bg-green-800 text-white"
                    : "text-gray-600"
                }`}
              >
                हिन्दी
              </button>

              <button
                onClick={() => changeLanguage("en")}
                className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                  language === "en"
                    ? "bg-green-800 text-white"
                    : "text-gray-600"
                }`}
              >
                English
              </button>

            </div>


            {/* Login */}
            <button
              className="
                flex items-center gap-1.5
                bg-green-800
                hover:bg-green-900
                text-white
                px-3 sm:px-5
                py-2 sm:py-2.5
                rounded-lg
                text-xs sm:text-sm
                font-medium
                transition
              "
            >

              <LogIn size={15} />

              <span>
                {t.navbar.login}
              </span>

            </button>

          </div>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;