import {
  FaCalendar,
  FaMapPin,
  FaMoneyBillWave,
  FaPassport,
  FaMobileAlt,
  FaWallet,
  FaKey,
  FaQuestionCircle,
} from "react-icons/fa";

const categoryIcons = {
  money: FaMoneyBillWave,
  passport: FaPassport,
  phone: FaMobileAlt,
  wallet: FaWallet,
  keys: FaKey,
  other: FaQuestionCircle,
};

const ItemCard = ({
  image,
  category,
  title,
  description,
  location,
  date,
}) => {
  const Icon = categoryIcons[category] || FaQuestionCircle;

  return (
    <div className="cursor-pointer overflow-hidden rounded-[20px] border border-white/40 bg-white/60 backdrop-blur-lg transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl">

      <img
        src={image}
        alt={title}
        className="h-[200px] w-full object-cover"
      />

      <div className="px-5 pb-5 pt-[18px]">

        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <Icon className="mr-1 inline text-indigo-600" />
          {category}
        </div>

        <h3 className="mb-1 text-[1.2rem] font-semibold">
          {title}
        </h3>

        <p className="my-2.5 text-[0.95rem] leading-relaxed text-gray-700">
          {description}
        </p>

        <div className="flex items-center justify-between border-t border-black/5 pt-3 text-xs text-gray-500">

          <span>
            <FaMapPin className="mr-1 inline" />
            {location}
          </span>

          <span>
            <FaCalendar className="mr-1 inline" />
            {date}
          </span>

        </div>

      </div>
    </div>
  );
};

export default ItemCard;