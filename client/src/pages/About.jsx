import { Mail, Phone, Download } from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const AboutContactPage = () => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-100 text-gray-800">
        {/* About Us */}
        <section className="text-center py-16 px-4 bg-gradient-to-b from-white to-indigo-50">
          <h2 className="text-4xl font-bold mb-4">About Us</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            MyCampusHome is a transparent and secure home rental platform that connects tenants and landlords.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {["web-demo-01.png", "web-demo-02.png", "web-demo-03.png"].map((src, index) => (
              <div key={index} className="w-64 h-40 bg-gray-300 flex items-center justify-center rounded-lg shadow-lg overflow-hidden group relative">
                <img
                  src={src}
                  alt="Web Demo"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Our Team */}
        <section className="bg-white text-center py-16 px-4">
          <h2 className="text-4xl font-bold mb-4">Our Team</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Meet the team that invented the platform! We brought together the most talented people around the globe.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
              <img src="Member_01.png" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
              <img src="Member_02.jpg" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-20 h-20 bg-gray-300 rounded-full overflow-hidden">
              <img src="Member_03.jpg" alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* Contact Us */}
        <section className="text-center py-16 px-4">
          <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">We're here for you 24/7. Reach out anytime!</p>
          <div className="flex justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 text-lg"><Mail /> Email Us</div>
            <div className="flex items-center gap-2 text-lg"><Phone /> +94 704424913</div>
          </div>
          <p className="mt-6 text-gray-600">201, Bandaranayake Mawatha, Moratuwa, 10400</p>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default AboutContactPage;
