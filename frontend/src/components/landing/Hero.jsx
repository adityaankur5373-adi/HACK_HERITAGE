import {
  ArrowRight,
  MapPin,
  Mic,
  PenLine,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import useLanguage from "../../context/useLanguage";
import useAuthStore from "../../store/authStore";

function Hero() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { t } = useLanguage();

  const handleCitizenAction = () => {
    navigate(isAuthenticated ? "/citizen/dashboard" : "/login");
  };

  return (
    <section
      id="home"
      className="
        relative
        overflow-hidden
        min-h-screen
        lg:min-h-[800px]
        -mb-px
      "
    >

      {/* =========================================
          BACKGROUND IMAGE
      ========================================= */}
      <div
        className="
          absolute
          inset-0
          bg-cover
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundImage: "url('/images/bg.png')",
        }}
      />

      {/* =========================================
          LIGHT OVERLAY
      ========================================= */}
      <div className="absolute inset-0 bg-white/35" />

      {/* Very subtle green tint */}
      <div className="absolute inset-0 bg-green-50/10" />


      {/* =========================================
          HERO CONTENT
      ========================================= */}
      <div
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
        "
      >

        <div
          className="
            min-h-screen
            lg:min-h-[800px]

            grid
            grid-cols-1
            lg:grid-cols-2

            gap-10
            lg:gap-16

            items-center

            pt-24
            sm:pt-28
            lg:pt-24

            pb-12
            sm:pb-16
            lg:pb-20
          "
        >

          {/* =====================================
              LEFT SIDE
          ===================================== */}
          <div className="text-center lg:text-left">

            {/* Badge */}
            <div
              className="
                inline-flex
                items-center
                gap-2

                bg-white/90
                backdrop-blur-sm

                border
                border-green-200

                px-3
                sm:px-4

                py-2

                rounded-full

                text-green-800

                text-xs
                sm:text-sm

                font-medium

                shadow-sm
              "
            >
              <MapPin size={15} />

              <span>
                {t.hero.badge}
              </span>
            </div>


            {/* =================================
                HEADING
            ================================= */}
            <h1
              className="
                mt-5
                sm:mt-6

                text-4xl
                sm:text-5xl
                md:text-6xl
                lg:text-6xl
                xl:text-7xl

                font-bold

                leading-[1.1]

                text-gray-900
              "
            >
              {t.hero.title}

              <span className="block text-green-800 mt-2">
                {t.hero.titleHighlight}
              </span>
            </h1>


            {/* =================================
                DESCRIPTION
            ================================= */}
            <p
              className="
                mt-5
                sm:mt-6

                text-base
                sm:text-lg
                lg:text-xl

                text-gray-700

                max-w-xl

                mx-auto
                lg:mx-0

                leading-relaxed
              "
            >
              {t.hero.description}
            </p>


            {/* =================================
                ACTION BUTTONS
            ================================= */}
            <div
              className="
                mt-7
                sm:mt-9

                flex
                flex-col
                sm:flex-row

                gap-3
                sm:gap-4

                max-w-xl

                mx-auto
                lg:mx-0
              "
            >

              {/* ===============================
                  VOICE BUTTON
              =============================== */}
              <button
                type="button"
                onClick={handleCitizenAction}
                className="
                  group

                  flex
                  items-center
                  justify-center
                  gap-2
                  sm:gap-3

                  bg-green-800
                  hover:bg-green-900

                  text-white

                  px-5
                  sm:px-6

                  py-3.5
                  sm:py-4

                  rounded-xl

                  font-semibold

                  shadow-lg
                  hover:shadow-xl

                  transition-all
                  duration-200

                  text-sm
                  sm:text-base

                  w-full
                  sm:w-auto
                "
              >

                <Mic
                  size={20}
                  className="shrink-0"
                />

                <span>
                  {t.hero.voice}
                </span>

                <ArrowRight
                  size={17}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />

              </button>


              {/* ===============================
                  TEXT BUTTON
              =============================== */}
              <button
                type="button"
                onClick={handleCitizenAction}
                className="
                  group

                  flex
                  items-center
                  justify-center
                  gap-2
                  sm:gap-3

                  bg-white/95
                  hover:bg-white

                  border-2
                  border-green-800

                  text-green-900

                  px-5
                  sm:px-6

                  py-3.5
                  sm:py-4

                  rounded-xl

                  font-semibold

                  shadow-sm
                  hover:shadow-md

                  transition-all
                  duration-200

                  text-sm
                  sm:text-base

                  w-full
                  sm:w-auto
                "
              >

                <PenLine
                  size={20}
                  className="shrink-0"
                />

                <span>
                  {t.hero.text}
                </span>

                <ArrowRight
                  size={17}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />

              </button>

            </div>

          </div>


          {/* =====================================
              RIGHT SIDE - JHARKHAND MAP
          ===================================== */}
          <div
            className="
              flex
              justify-center
              items-center

              mt-4
              sm:mt-6
              lg:mt-0
            "
          >

            <div
              className="
                relative

                w-full

                max-w-[280px]
                sm:max-w-[360px]
                md:max-w-[420px]
                lg:max-w-[500px]

                flex
                items-center
                justify-center
              "
            >

              <div
                className="
                  relative

                  w-full
                  aspect-square

                  overflow-hidden
                  rounded-[30%]
                  bg-white/35
                  p-5
                  shadow-xl
                  backdrop-blur-[3px]
                "
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-orange-300/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-emerald-300/30 blur-3xl" />
                <svg
                  viewBox="0 0 420 500"
                  role="img"
                  aria-label="Map of India with civic service locations"
                  className="relative h-full w-full drop-shadow-[0_18px_18px_rgba(15,81,50,0.2)]"
                >
                  <defs>
                    <linearGradient id="indiaTricolor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="45%" stopColor="#fff7ed" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <filter id="mapGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="7" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  <path
                    d="M190 18 224 31 245 56 276 66 291 91 326 104 316 126 344 145 330 166 351 190 334 207 340 235 318 251 309 281 290 294 278 331 260 353 249 389 230 416 213 471 198 449 185 414 166 389 151 356 128 336 119 306 96 288 101 265 77 247 84 224 62 210 78 191 70 169 92 158 88 134 111 123 120 98 145 88 149 65 176 55 165 34Z"
                    fill="url(#indiaTricolor)"
                    stroke="#166534"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    filter="url(#mapGlow)"
                  />

                  <g fill="none" stroke="#166534" strokeOpacity=".28" strokeWidth="2">
                    <path d="m126 123 54 20 51-12 49 37-28 34 41 34-56 34 16 44-43 22-31-36" />
                    <path d="m91 191 63 13 31 32-25 43 42 27 13 55" />
                    <path d="m181 42 14 52-16 48 24 43 46 14" />
                    <path d="m275 65-20 40 18 43 45 18" />
                    <path d="m119 306 47-27 56 22 38-18" />
                  </g>

                  <g fill="#fff" stroke="#166534" strokeWidth="3">
                    <circle cx="197" cy="160" r="7" />
                    <circle cx="157" cy="236" r="7" />
                    <circle cx="224" cy="305" r="7" />
                    <circle cx="253" cy="371" r="7" />
                  </g>
                  <g fill="#166534">
                    <circle cx="197" cy="160" r="3" />
                    <circle cx="157" cy="236" r="3" />
                    <circle cx="224" cy="305" r="3" />
                    <circle cx="253" cy="371" r="3" />
                  </g>
                </svg>

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-center shadow-md backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-900">One nation</p>
                  <p className="mt-0.5 text-[11px] text-slate-600">Every voice, every community</p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;