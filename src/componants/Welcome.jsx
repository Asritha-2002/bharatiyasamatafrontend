import welcomeimg from "../assets/welcome.png"
export default function Welcome() {
  const currentYearSuffix = new Date().getFullYear().toString().slice(-2);
  return (
    <section className="py-16 bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <img
            src={welcomeimg}
            alt="One Book Donation"
            className="w-full max-w-sm mx-auto rounded shadow-lg"
          />
        </div>
        <div className="order-1 md:order-2">
          <p className="text-[#F4882A] font-heading text-xl font-semibold">Welcome</p>
          <h2 className="font-heading text-2xl md:text-4xl font-bold text-[#344256] mt-2">
            National Integration Programme -{currentYearSuffix}
          </h2>
          <div className="w-20 h-0.5 bg-[#F4882A] my-4" />
          <div className="space-y-4 text-sm md:text-base text-gray-700">
            <p>
              The Bharatiya Samata Hindi Prachar Vibhag has been rendering the help to the poor students of private &
              Govt. sector from th past 23 years, we expect you and your acquaintance also to be a part of the sponsor
              "As every drop makes the mighty ocean" for the help you confer, your name or your suggested name will be
              printed on every book you sponsor.
            </p>
            <p>
              Generosity is always two fold rewarded. Conferring education to the poor is said to be the greatest
              Generosity. We request and seek your permission to share the FREE Hindi Books distribution as an aid for
              donation to the poor students of various schools. This donation will be used to donate academic Hindi
              Books for high school poor students.
            </p>
          </div>
          {/* <a
            href="https://bharatiyasamata.com/2022/07/09/c-a-help/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 bg-[#F4882A] text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Learn more
          </a> */}
        </div>
      </div>
    </section>
  );
}