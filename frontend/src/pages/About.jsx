import {
  FaSearch,
  FaHandHoldingHeart,
  FaShieldAlt,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";

const About = () => {
  return (
    <main className="bg-gray-50 min-h-screen">

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-14">
        <div className="max-w-3xl">

          <span className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 mb-4">
            <FaHandHoldingHeart />
            Helping people find what they've lost
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            About Baafiye
          </h1>

          <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed">
            Baafiye is a community-focused lost and found service designed
            to help people reconnect with belongings they have lost and
            return items they have found.
          </p>

        </div>
      </section>


      {/* What We Do */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div>
              <p className="text-sm font-semibold text-indigo-600 mb-3">
                WHAT WE DO
              </p>

              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                A simple way to reconnect people with their belongings.
              </h2>

              <p className="mt-5 text-gray-600 leading-relaxed">
                Losing something important can be stressful. Finding
                something that belongs to someone else can be just as
                difficult to deal with.
              </p>

              <p className="mt-4 text-gray-600 leading-relaxed">
                Baafiye provides one place where people can share found
                items, search for belongings they have lost, and contact
                the person who found them.
              </p>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="p-5 rounded-2xl bg-indigo-50">
                <FaSearch className="text-indigo-600 text-xl mb-4" />

                <h3 className="font-semibold text-gray-900">
                  Find Items
                </h3>

                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Search through items that have been reported as found.
                </p>
              </div>


              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <FaHandHoldingHeart className="text-indigo-600 text-xl mb-4" />

                <h3 className="font-semibold text-gray-900">
                  Return Items
                </h3>

                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Help someone recover something that matters to them.
                </p>
              </div>


              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <FaUsers className="text-indigo-600 text-xl mb-4" />

                <h3 className="font-semibold text-gray-900">
                  Community
                </h3>

                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Connect people through a simple community service.
                </p>
              </div>


              <div className="p-5 rounded-2xl bg-indigo-50">
                <FaShieldAlt className="text-indigo-600 text-xl mb-4" />

                <h3 className="font-semibold text-gray-900">
                  Trust
                </h3>

                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Designed with responsible communication and privacy in mind.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

        <div className="text-center max-w-2xl mx-auto mb-10">

          <p className="text-sm font-semibold text-indigo-600 mb-3">
            HOW IT WORKS
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Simple for everyone
          </h2>

          <p className="mt-3 text-gray-600">
            Baafiye keeps the process straightforward.
          </p>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-5">
              01
            </div>

            <h3 className="font-semibold text-lg text-gray-900">
              Someone finds an item
            </h3>

            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              A person reports an item they found and provides the
              necessary information.
            </p>
          </div>


          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-5">
              02
            </div>

            <h3 className="font-semibold text-lg text-gray-900">
              Someone searches
            </h3>

            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              People can browse and search for items they may have lost.
            </p>
          </div>


          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-5">
              03
            </div>

            <h3 className="font-semibold text-lg text-gray-900">
              They reconnect
            </h3>

            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              The finder and owner can communicate and arrange the return.
            </p>
          </div>

        </div>

      </section>


      {/* Mission */}
      <section className="bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">

          <FaHandHoldingHeart className="mx-auto text-white text-3xl mb-5" />

          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Our Mission
          </h2>

          <p className="mt-4 text-indigo-100 text-base sm:text-lg leading-relaxed">
            To make lost and found easier, more accessible, and more
            useful for communities by giving people a simple place to
            help one another.
          </p>

        </div>
      </section>


      {/* Closing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

          <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <FaCheckCircle className="text-green-600" />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Every returned item matters.
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              A small act of honesty can make a big difference to someone.
            </p>
          </div>

        </div>

      </section>

    </main>
  );
};

export default About;