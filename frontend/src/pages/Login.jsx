import {
  UserRound,
  GraduationCap,
  University,
  Landmark,
  Building2,
  Globe,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import RoleCard from "../components/role/RoleCard";

import useLanguage from "../context/useLanguage";

function Login() {
  const navigate = useNavigate();

  const { language, changeLanguage, t } = useLanguage();

  const roles = [
    {
      title: t.login.citizen.title,
      description: t.login.citizen.description,
      buttonText: t.login.citizen.button,
      icon: UserRound,
      theme: "blue",
      path: "/login/citizen",
    },

    {
      title: t.login.student.title,
      description: t.login.student.description,
      buttonText: t.login.student.button,
      icon: GraduationCap,
      theme: "purple",
      path: "/login/student",
    },

    {
      title: t.login.university.title,
      description: t.login.university.description,
      buttonText: t.login.university.button,
      icon: University,
      theme: "orange",
      path: "/login/university",
    },

    {
      title: t.login.government.title,
      description: t.login.government.description,
      buttonText: t.login.government.button,
      icon: Landmark,
      theme: "green",
      path: "/login/government",
    },
    {
      title: t.login.industry.title,
      description: t.login.industry.description,
      buttonText: t.login.industry.button,
      icon: Building2,
      theme: "green",
      path: "/login/industry",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* =========================================
          BACKGROUND IMAGE
      ========================================= */}

      {/* =========================================
    BACKGROUND IMAGE
========================================= */}

<div
  className="
    absolute
    inset-0
    bg-no-repeat

    bg-[length:auto_100%]
    bg-[position:center_bottom]

    sm:bg-cover
    sm:bg-center
  "
  style={{
    backgroundImage: "url('/images/login.png')",
  }}
/>

{/* =========================================
    SOFT OVERLAY
========================================= */}

<div
  className="
    absolute
    inset-0
    bg-white/45

    sm:bg-white/65
  "
/>

<div className="absolute inset-0 bg-green-50/10" />

      {/* =========================================
          BACKGROUND DECORATIONS
      ========================================= */}

      <div
        className="
          absolute
          -top-40
          -left-40

          w-[420px]
          h-[420px]

          bg-blue-100/30

          rounded-full

          blur-3xl
        "
      />

      <div
        className="
          absolute
          -bottom-40
          -right-40

          w-[450px]
          h-[450px]

          bg-green-100/30

          rounded-full

          blur-3xl
        "
      />


      {/* =========================================
          TOP BAR
      ========================================= */}

      <div
        className="
          relative
          z-20

          w-full

          px-4
          sm:px-6
          lg:px-10

          pt-5
          sm:pt-6
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto

            flex
            items-center
            justify-between
          "
        >

          {/* =====================================
              LOGO
          ===================================== */}

          <button
            onClick={() => navigate("/")}
            className="
              flex
              items-center
              gap-2

              group
            "
          >

            <div
              className="
                w-9
                h-9

                sm:w-10
                sm:h-10

                rounded-full

                bg-green-800

                flex
                items-center
                justify-center

                shadow-md

                group-hover:bg-green-900

                transition
              "
            >
              <span
                className="
                  text-white
                  font-bold
                  text-base
                  sm:text-lg
                "
              >
                ज
              </span>
            </div>


            <span
              className="
                text-lg
                sm:text-xl

                font-bold

                text-green-900
              "
            >
              JanSamadhan
            </span>

          </button>


          {/* =====================================
              LANGUAGE SWITCHER
          ===================================== */}

          <div
            className="
              flex
              items-center

              gap-1

              bg-white/85
              backdrop-blur-md

              border
              border-gray-200

              rounded-xl

              p-1

              shadow-sm
            "
          >

            <Globe
              size={15}
              className="
                text-gray-500
                ml-1
                mr-0.5

                hidden
                sm:block
              "
            />


            {/* Hindi */}

            <button
              onClick={() => changeLanguage("hi")}
              className={`
                px-2.5
                sm:px-3

                py-1.5

                rounded-lg

                text-xs
                sm:text-sm

                font-medium

                transition-all

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
                px-2.5
                sm:px-3

                py-1.5

                rounded-lg

                text-xs
                sm:text-sm

                font-medium

                transition-all

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

        </div>

      </div>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main
        className="
          relative
          z-10

          min-h-[calc(100vh-80px)]

          flex
          items-center
          justify-center

          px-4
          sm:px-6
          lg:px-8

          -mt-4
          sm:-mt-8
          lg:-mt-10
        "
      >

        <div
          className="
            w-full
            max-w-7xl
          "
        >


          {/* =====================================
              HEADING
          ===================================== */}

          <div className="text-center">


            {/* Badge */}

            

            {/* Heading */}

           {/* Heading */}

<h1
  className="
    mt-10
    sm:mt-12

    text-3xl
    sm:text-4xl
    lg:text-5xl

    font-bold

    text-gray-900

    leading-tight
  "
>
  {t.login.title}{" "}

  <span className="text-green-800">
    {t.login.titleHighlight}
  </span>
</h1>

            {/* Subtitle */}

            <p
              className="
                mt-2
                sm:mt-3

                text-sm
                sm:text-base

                text-gray-600

                max-w-lg

                mx-auto
              "
            >
              {t.login.subtitle}
            </p>

          </div>


          {/* =====================================
              ROLE CARDS
          ===================================== */}

          <div
            className="
              mt-7
              sm:mt-9
              lg:mt-10

              grid

              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-5

              gap-3
              lg:gap-4

              max-w-7xl

              mx-auto
            "
          >

            {roles.map((role) => (
              <RoleCard
                key={role.path}

                icon={role.icon}

                title={role.title}

                description={role.description}

                buttonText={role.buttonText}

                theme={role.theme}

                onClick={() => navigate(role.path)}
              />
            ))}

          </div>


          {/* =====================================
              BOTTOM MESSAGE
          ===================================== */}

          <div
            className="
              text-center

              mt-5
              sm:mt-6

              pb-5
            "
          >

            <p
              className="
                inline-block

                px-4
                py-1.5

                rounded-full

                bg-white/60
                backdrop-blur-sm

                text-xs
                sm:text-sm

                text-gray-500
              "
            >
              {t.login.bottomMessage}
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Login;