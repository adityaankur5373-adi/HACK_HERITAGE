import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";

import { useLanguage } from "../../context/LanguageContext";

function Footer() {

  const { t } = useLanguage();

  return (
    <footer
      id="contact"
      className="
        relative

        overflow-hidden

        bg-[#f7f6ed]

        text-gray-800
      "
    >

      {/* ================================
          BACKGROUND IMAGE
      ================================= */}

      <div
        className="
          absolute

          inset-x-0

          bottom-0

          h-[65%]

          bg-cover

          bg-bottom

          bg-no-repeat

          pointer-events-none

          opacity-90
        "
        style={{
          backgroundImage:
            "url('/images/footer-bg.png')",
        }}
      />


      {/* Overlay */}

      <div
        className="
          absolute

          inset-0

          bg-gradient-to-b

          from-[#f7f6ed]

          via-[#f7f6ed]/80

          to-transparent

          pointer-events-none
        "
      />


      {/* ================================
          CONTENT
      ================================= */}

      <div
        className="
          relative
          z-10

          max-w-7xl

          mx-auto

          px-4
          sm:px-6
          lg:px-8

          pt-8
          pb-4
        "
      >

        {/* Main */}

        <div
          className="
            grid

            grid-cols-1

            sm:grid-cols-2

            lg:grid-cols-4

            gap-7
            lg:gap-10
          "
        >

          {/* ============================
              BRAND
          ============================= */}

          <div>

            <div className="flex items-center gap-2">

              <div
                className="
                  w-9
                  h-9

                  rounded-full

                  bg-green-800

                  flex
                  items-center
                  justify-center
                "
              >
                <span className="text-lg">
                  🌳
                </span>
              </div>

              <div>

                <h2
                  className="
                    text-lg

                    font-bold

                    text-green-900

                    leading-tight
                  "
                >
                  {t.footer.brand}
                </h2>

                <p
                  className="
                    text-[10px]

                    text-green-700
                  "
                >
                  {t.footer.tagline}
                </p>

              </div>

            </div>


            <p
              className="
                mt-2

                text-xs

                text-gray-600

                leading-5

                max-w-xs
              "
            >
              {t.footer.description}
            </p>


            {/* Social */}

            <div
              className="
                flex

                gap-2

                mt-3
              "
            >

              <a
                href="#"
                className="
                  w-7
                  h-7

                  rounded-full

                  border
                  border-green-800/30

                  flex
                  items-center
                  justify-center

                  text-green-900

                  hover:bg-green-800

                  hover:text-white

                  transition
                "
              >
                <FaFacebookF size={11} />
              </a>


              <a
                href="#"
                className="
                  w-7
                  h-7

                  rounded-full

                  border
                  border-green-800/30

                  flex
                  items-center
                  justify-center

                  text-green-900

                  hover:bg-green-800

                  hover:text-white

                  transition
                "
              >
                <FaXTwitter size={11} />
              </a>


              <a
                href="#"
                className="
                  w-7
                  h-7

                  rounded-full

                  border
                  border-green-800/30

                  flex
                  items-center
                  justify-center

                  text-green-900

                  hover:bg-green-800

                  hover:text-white

                  transition
                "
              >
                <FaInstagram size={12} />
              </a>


              <a
                href="#"
                className="
                  w-7
                  h-7

                  rounded-full

                  border
                  border-green-800/30

                  flex
                  items-center
                  justify-center

                  text-green-900

                  hover:bg-green-800

                  hover:text-white

                  transition
                "
              >
                <FaYoutube size={12} />
              </a>

            </div>

          </div>


          {/* ============================
              PLATFORM
          ============================= */}

          <div>

            <h3
              className="
                text-sm

                font-bold

                text-green-900

                mb-3
              "
            >
              {t.footer.platform}
            </h3>

            <div className="space-y-1.5">

              <p className="text-xs text-gray-600">
                {t.footer.reportProblem}
              </p>

              <p className="text-xs text-gray-600">
                {t.footer.trackProblem}
              </p>

              <p className="text-xs text-gray-600">
                {t.footer.publicProblems}
              </p>

              <p className="text-xs text-gray-600">
                {t.footer.about}
              </p>

            </div>

          </div>


          {/* ============================
              SUPPORT
          ============================= */}

          <div>

            <h3
              className="
                text-sm

                font-bold

                text-green-900

                mb-3
              "
            >
              {t.footer.support}
            </h3>

            <div className="space-y-1.5">

              <p className="text-xs text-gray-600">
                {t.footer.helpCenter}
              </p>

              <p className="text-xs text-gray-600">
                {t.footer.userGuide}
              </p>

              <p className="text-xs text-gray-600">
                {t.footer.faq}
              </p>

              <p className="text-xs text-gray-600">
                {t.footer.contact}
              </p>

            </div>

          </div>


          {/* ============================
              CONTACT
          ============================= */}

          <div>

            <h3
              className="
                text-sm

                font-bold

                text-green-900

                mb-3
              "
            >
              {t.footer.connect}
            </h3>


            <div className="space-y-2">

              <div className="flex items-center gap-2">

                <MapPin
                  size={14}
                  className="text-green-800 shrink-0"
                />

                <p className="text-xs text-gray-600">
                  {t.footer.address}
                </p>

              </div>


              <div className="flex items-center gap-2">

                <Mail
                  size={14}
                  className="text-green-800 shrink-0"
                />

                <p className="text-xs text-gray-600 break-all">
                  {t.footer.email}
                </p>

              </div>


              <div className="flex items-center gap-2">

                <Phone
                  size={14}
                  className="text-green-800 shrink-0"
                />

                <p className="text-xs text-gray-600">
                  {t.footer.phone}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ================================
            TRUST
        ================================= */}

        <div
          className="
            mt-5

            pt-3

            border-t

            border-green-900/15

            flex

            flex-wrap

            items-center

            justify-center

            gap-x-4

            gap-y-1

            text-[10px]
            sm:text-xs

            text-green-900
          "
        >

          <span>
            🛡️ {t.footer.secure}
          </span>

          <span>
            ✓ {t.footer.trusted}
          </span>

          <span>
            🔒 {t.footer.transparent}
          </span>

          <span>
            👥 {t.footer.publicInterest}
          </span>

        </div>


        {/* ================================
            COPYRIGHT
        ================================= */}

        <div
          className="
            mt-3

            pt-3

            border-t

            border-green-900/10

            flex

            flex-col
            sm:flex-row

            items-center
            justify-between

            gap-2

            text-[10px]
            sm:text-xs

            text-gray-500
          "
        >

          <p>
            {t.footer.copyright}
          </p>

          <p className="text-green-800">
            {t.footer.tagline}
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;