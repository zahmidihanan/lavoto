{/* Hero */}
<section className="py-20 px-6">
  <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

    {/* Left Content */}
    <div>
      <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
        Professional Car Wash Management
      </span>

      <h1 className="mt-6 text-5xl lg:text-7xl font-extrabold leading-tight">
        Manage Your
        <span className="text-blue-600"> Car Wash </span>
        Like a Pro
      </h1>

      <p className="mt-6 text-xl text-gray-600 max-w-xl">
        Simplify bookings, manage employees, track payments and build
        customer loyalty with one powerful platform.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
          Start Free Trial
        </button>

        <button className="border border-gray-300 px-8 py-3 rounded-xl">
          Sign In
        </button>
      </div>

      <div className="mt-8 flex gap-8">
        <div>
          <h3 className="text-3xl font-bold">500+</h3>
          <p className="text-gray-500">Bookings</p>
        </div>

        <div>
          <h3 className="text-3xl font-bold">100+</h3>
          <p className="text-gray-500">Customers</p>
        </div>

        <div>
          <h3 className="text-3xl font-bold">25+</h3>
          <p className="text-gray-500">Employees</p>
        </div>
      </div>
    </div>

    {/* Right Image */}
    <div className="relative">
      <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>

      <img
        src="/car.png"
        alt="Car Wash"
        className="relative w-full rounded-3xl shadow-2xl"
      />
    </div>

  </div>
</section>