export default function About() {
  return (
    <section id="about" className="bg-[#344256] text-white py-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-[#F4882D] font-heading text-sm font-semibold uppercase tracking-wide">
            Sabki Hindi ...Sabkeliye Hindi
          </p>
          <h2 className="font-heading text-2xl md:text-4xl font-bold mt-2">
            Bharatiya Samata Hindi Prachar Parishad
          </h2>
          <h3 className="font-heading text-lg md:text-xl mt-3 text-white/90">
            National Hindi Test and Free Hindi Books Distribution
          </h3>
          <div className="w-20 h-0.5 bg-[#F4882A] my-4" />
          <p className="text-sm md:text-base text-white/80">
            Bharatiya Samata Hindi Prachar Parishad started NIP -2022 to bring out the civic sense and social
            responsibility and also cater help to the needy. keeping in view the lower income group children and also
            considering the RTE( Right to Education) the B.S.H.P.Vibhag has proposed to help the children of schools
            under government sector with free hindi book for one year for which we need your sponsor.
          </p>
          {/* <a
            href="https://bharatiyasamata.com/gallary/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-5 bg-[#F4882A] text-white px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            view more
          </a> */}
        </div>
        <div>
          <img
            src="https://bharatiyasamata.com/wp-content/uploads/2022/06/2-768x740.jpg"
            alt="Bharatiya Samata Hindi Prachar Parishad"
            className="w-full rounded shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}