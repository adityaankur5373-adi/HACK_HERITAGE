import {
  ArrowRight,
  MapPin,
  Mic,
  PenLine,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";

function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="relative overflow-hidden min-h-[600px] lg:min-h-[680px]"
    >

      {/* =========================================
          BACKGROUND IMAGE
      ========================================= */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/bg.png')",
        }}
      />

      {/* =========================================
          LIGHT OVERLAY
          35% white -> background remains visible
      ========================================= */}
      <div className="absolute inset-0 bg-white/35" />

      {/* Very subtle green tint */}
      <div className="absolute inset-0 bg-green-50/10" />


      {/* =========================================
          HERO CONTENT
      ========================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div
          className="
            min-h-[600px]
            lg:min-h-[680px]

            grid
            grid-cols-1
            lg:grid-cols-2

            gap-10
            lg:gap-16

            items-center

            py-12
            sm:py-16
            lg:py-20
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

              {/* =================================
                  MAP CONTAINER
              ================================= */}
              <div
                className="
                  relative

                  w-full
                  aspect-square

                  rounded-[35%]

                  bg-white/35

                  backdrop-blur-[2px]

                  border
                  border-white/60

                  shadow-lg

                  flex
                  items-center
                  justify-center
                "
              >

                {/* Temporary Map Placeholder */}
                <div className="text-center px-5">

                  <div
                    className="
                      text-6xl
                      sm:text-7xl
                      md:text-8xl
                    "
                  >
                    🗺️
                  </div>

                  <h2
                    className="
                      mt-3
                      sm:mt-4

                      text-2xl
                      sm:text-3xl
                      md:text-4xl

                      font-bold

                      text-green-900
                    "
                  >
                    Jharkhand
                  </h2>

                  <p
                    className="
                      mt-2

                      text-sm
                      sm:text-base

                      text-gray-600
                    "
                  >
                    Problems across Jharkhand
                  </p>

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