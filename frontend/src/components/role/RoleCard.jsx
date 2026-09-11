import { ArrowRight } from "lucide-react";

function RoleCard({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  theme,
}) {
  const themes = {
    blue: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      iconHover: "group-hover:bg-blue-600",
      iconHoverColor: "group-hover:text-white",

      border: "border-blue-100",
      button: "bg-blue-600 hover:bg-blue-700",
      glow: "group-hover:shadow-blue-100",
    },

    purple: {
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      iconHover: "group-hover:bg-purple-600",
      iconHoverColor: "group-hover:text-white",

      border: "border-purple-100",
      button: "bg-purple-600 hover:bg-purple-700",
      glow: "group-hover:shadow-purple-100",
    },

    orange: {
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      iconHover: "group-hover:bg-orange-600",
      iconHoverColor: "group-hover:text-white",

      border: "border-orange-100",
      button: "bg-orange-600 hover:bg-orange-700",
      glow: "group-hover:shadow-orange-100",
    },

    green: {
      iconBg: "bg-green-50",
      iconColor: "text-green-700",
      iconHover: "group-hover:bg-green-700",
      iconHoverColor: "group-hover:text-white",

      border: "border-green-100",
      button: "bg-green-700 hover:bg-green-800",
      glow: "group-hover:shadow-green-100",
    },
  };

  const currentTheme = themes[theme];

  return (
    <div
      className={`
        group
        relative
        flex
        flex-col
        bg-white/90
        backdrop-blur-md

        border
        ${currentTheme.border}

        rounded-3xl

        overflow-hidden

        shadow-lg
        ${currentTheme.glow}

        hover:-translate-y-2
        hover:shadow-2xl

        transition-all
        duration-300

        min-h-[350px]
      `}
    >

      {/* Top accent */}

      <div
        className={`
          h-1.5
          w-full
          ${currentTheme.button}
        `}
      />


      {/* Icon section */}

      <div className="flex justify-center pt-7">

        <div
          className={`
            w-20
            h-20

            rounded-3xl

            ${currentTheme.iconBg}

            flex
            items-center
            justify-center

            transition-all
            duration-300

            ${currentTheme.iconHover}
          `}
        >

          <Icon
            size={45}
            strokeWidth={1.7}
            className={`
              ${currentTheme.iconColor}
              ${currentTheme.iconHoverColor}
              transition-colors
              duration-300
            `}
          />

        </div>

      </div>


      {/* Content */}

      <div
        className="
          flex
          flex-col
          flex-1

          text-center

          px-4
          pt-5
          pb-5
        "
      >

        <h2
          className="
            text-lg
            sm:text-xl
            font-bold
            text-gray-900
          "
        >
          {title}
        </h2>


        <p
          className="
            mt-2
            text-sm
            sm:text-sm
            text-gray-500
            leading-relaxed
          "
        >
          {description}
        </p>


        {/* Button */}

        <button
          onClick={onClick}
          className={`
            mt-auto
            pt-6
          `}
        >

          <div
            className={`
              w-full

              flex
              items-center
              justify-center
              gap-2

              ${currentTheme.button}

              text-white

              py-3

              rounded-xl

              font-semibold

              transition-all
              duration-200
            `}
          >

            <span>
              {buttonText}
            </span>

            <ArrowRight
              size={18}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />

          </div>

        </button>

      </div>

    </div>
  );
}

export default RoleCard;