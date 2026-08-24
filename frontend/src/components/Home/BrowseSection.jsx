import { FaSearch, FaFilter, FaMapMarkerAlt } from "react-icons/fa";
import ItemsGrid from "./ItemsGrid";

const DISTRICTS = [
  "Abdiaziz",
  "Bondhere",
  "Daynile",
  "Dharkenley",
  "Hamar Jajab",
  "Hamar Weyne",
  "Hodan",
  "Howlwadaag",
  "Kahda",
  "Karaan",
  "Shangani",
  "Shibis",
  "Waberi",
  "Wadajir",
  "Warta Nabada",
  "Yaqshid",
  "Garasbaaley",
  "Daarusalaam",
  "Gubadley",
  "Huriwaa",
];

const CATEGORIES = [
  "Money",
  "Passport",
  "Phone",
  "Wallet",
  "Keys",
  "Other",
];

const BrowseSection = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Found Items
        </h2>

        <p className="mt-2 text-gray-500 text-sm sm:text-base">
          Find an item that may belong to you.
        </p>
      </div>


      {/* Search */}
      <div className="relative w-full mb-4">

        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search by item name or description..."
          className="w-full h-12 pl-11 pr-4 bg-white border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
        />

      </div>


      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>

          <select
            defaultValue=""
            className="w-full h-11 px-3 sm:px-4 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Categories</option>

            {CATEGORIES.map((category) => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
        </div>


        {/* District */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FaMapMarkerAlt className="text-gray-400 text-xs" />
            District
          </label>

          <select
            defaultValue=""
            className="w-full h-11 px-3 sm:px-4 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Districts</option>

            {DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>


        {/* Filter Button */}
        <div className="col-span-2 lg:col-span-1">

          <label className="hidden lg:block text-sm font-medium text-gray-700 mb-2">
            Filter
          </label>

          <button
            type="button"
            className="w-full h-11 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition"
          >
            <FaFilter />

            Filter Items
          </button>

        </div>

      </div>


      {/* Results */}
      <div className="flex items-center justify-between mt-10 mb-5">

        <h3 className="text-lg font-semibold text-gray-900">
          Recently Found
        </h3>

        <span className="text-sm text-gray-500">
          4 items
        </span>

      </div>


      {/* Items */}
      <ItemsGrid />

    </section>
  );
};

export default BrowseSection;