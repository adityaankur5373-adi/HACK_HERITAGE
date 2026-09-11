import { Globe, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useLanguage from "../../context/useLanguage";
import useAuthStore from "../../store/authStore";

function Navbar() {
  const { language, changeLanguage, t } = useLanguage();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const navigate = useNavigate();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        <div className="h-16 sm:h-20 flex items-center justify-between">

          {/* =========================================
              LOGO
          ========================================= */}

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >

            <div
              className="
                w-8 h-8
                sm:w-10 sm:h-10
                rounded-full
                bg-green-800
                flex
                items-center
                justify-center
                shadow-sm
              "
            >
              <span className="text-white font-bold text-sm sm:text-lg">
                ज
              </span>
            </div>

            <span className="text-base sm:text-xl font-bold text-green-900">
              JanSamadhan
            </span>

          </button>


          {/* =========================================
              RIGHT SIDE
          ========================================= */}

          <div className="flex items-center gap-2 sm:gap-4">

            {/* =========================================
                LANGUAGE SWITCHER
            ========================================= */}

            <div
              className="
                flex
                items-center
                border
                border-white/70
                rounded-lg
                p-0.5
                sm:p-1
                bg-white/75
                backdrop-blur-sm
                shadow-sm
              "
            >

              <Globe
                size={14}
                className="ml-1 text-gray-500 hidden sm:block"
              />


              {/* Hindi */}

              <button
                onClick={() => changeLanguage("hi")}
                className={`
                  px-2
                  sm:px-3
                  py-1.5
                  rounded-md
                  text-xs
                  sm:text-sm
                  font-medium
                  transition-all
                  duration-200

                  ${
                    language === "hi"
                      ? "bg-green-800 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                हिन्दी
              </button>


              {/* English */}

              <button
                onClick={() => changeLanguage("en")}
                className={`
                  px-2
                  sm:px-3
                  py-1.5
                  rounded-md
                  text-xs
                  sm:text-sm
                  font-medium
                  transition-all
                  duration-200

                  ${
                    language === "en"
                      ? "bg-green-800 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                English
              </button>

            </div>


            {/* =========================================
                LOGIN BUTTON
            ========================================= */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  isAuthenticated
                    ? "/citizen/dashboard"
                    : "/login"
                )
              }
              className="
                flex
                items-center
                justify-center
                gap-1.5
                sm:gap-2

                bg-green-800
                hover:bg-green-900

                text-white

                px-3
                sm:px-5

                py-2
                sm:py-2.5

                rounded-lg

                text-xs
                sm:text-sm

                font-medium

                transition-all
                duration-200

                shadow-sm
                hover:shadow-md
              "
            >

              <LogIn
                size={15}
                className="sm:w-4 sm:h-4"
              />

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