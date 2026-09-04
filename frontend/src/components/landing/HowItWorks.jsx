import {
  Mic,
  Search,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

import { useLanguage } from "../../context/LanguageContext";

function HowItWorks() {

  const { t } = useLanguage();

  const steps = [
    {
      icon: Mic,
      title: t.howItWorks.step1.title,
      description: t.howItWorks.step1.description,
    },

    {
      icon: Search,
      title: t.howItWorks.step2.title,
      description: t.howItWorks.step2.description,
    },

    {
      icon: Lightbulb,
      title: t.howItWorks.step3.title,
      description: t.howItWorks.step3.description,
    },

    {
      icon: CheckCircle,
      title: t.howItWorks.step4.title,
      description: t.howItWorks.step4.description,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="
        py-16
        sm:py-20
        lg:py-24

        bg-white
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto

          px-4
          sm:px-6
          lg:px-8
        "
      >

        {/* ================================
            HEADING
        ================================= */}

        <div
          className="
            text-center

            max-w-2xl

            mx-auto
          "
        >

          <span
            className="
              inline-block

              px-4
              py-2

              rounded-full

              bg-green-50

              text-green-800

              text-sm

              font-medium
            "
          >
            {t.howItWorks.badge}
          </span>


          <h2
            className="
              mt-4

              text-3xl
              sm:text-4xl
              lg:text-5xl

              font-bold

              text-gray-900
            "
          >
            {t.howItWorks.title}
          </h2>


          <p
            className="
              mt-4

              text-gray-600

              text-base
              sm:text-lg
            "
          >
            {t.howItWorks.subtitle}
          </p>

        </div>


        {/* ================================
            STEPS
        ================================= */}

        <div
          className="
            mt-12

            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4

            gap-6
            lg:gap-8
          "
        >

          {steps.map((step, index) => {

            const Icon = step.icon;

            return (
              <div
                key={index}
                className="
                  relative

                  bg-green-50/60

                  border
                  border-green-100

                  rounded-2xl

                  p-6

                  text-center

                  hover:-translate-y-1

                  hover:shadow-lg

                  transition-all
                  duration-300
                "
              >

                {/* Number */}

                <div
                  className="
                    absolute

                    top-4
                    right-4

                    w-7
                    h-7

                    rounded-full

                    bg-white

                    text-green-800

                    text-xs

                    font-bold

                    flex
                    items-center
                    justify-center
                  "
                >
                  {index + 1}
                </div>


                {/* Icon */}

                <div
                  className="
                    mx-auto

                    w-14
                    h-14

                    rounded-2xl

                    bg-green-800

                    text-white

                    flex
                    items-center
                    justify-center
                  "
                >
                  <Icon size={25} />
                </div>


                {/* Title */}

                <h3
                  className="
                    mt-5

                    text-lg

                    font-bold

                    text-gray-900
                  "
                >
                  {step.title}
                </h3>


                {/* Description */}

                <p
                  className="
                    mt-2

                    text-sm

                    text-gray-600

                    leading-6
                  "
                >
                  {step.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}

export default HowItWorks;