import React from "react";
import Cyber from "../assets/Cyber.png";

function Contact() {
  return (
    <div className="min-h-screen pt-30 flex items-center justify-center bg-gradient-to-br from-[#411E3A] to-[#0D1A2F] text-white px-6">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-12">
        {/* Left Section */}
        <div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
            Let's Get <span className="text-[#BD0927]">Connected</span>.
          </h1>
          <p className="text-gray-300">
            Or just send us an email directly at{" "}
            <a
              href="mailto:tt.acumen@gmail.com"
              className="text-[#09D8C7] underline hover:text-[#BD0927] transition"
            >
              tt.acumen@gmail.com
            </a>
            <img src={Cyber} alt="envelope" className="pt-7 md:flex hidden w-full h-[27em] ounded-lg mt-2" />
          </p>
        </div>

        {/* Right Section (Form) */}
        <form className="space-y-6 p-6 rounded-2xl">
          {/* Full Name */}
          <div>
            <label className="block text-sm mb-2 text-[#09D8C7] uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#BD0927] text-white placeholder-gray-400"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm mb-2 text-[#09D8C7] uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email address..."
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#BD0927] text-white placeholder-gray-400"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm mb-2 text-[#09D8C7] uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              placeholder="Write a short title for your problem..."
              maxLength={60}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#BD0927] text-white placeholder-gray-400"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm mb-2 text-[#09D8C7] uppercase tracking-wider">
              Message
            </label>
            <textarea
              placeholder="Enter your message..."
              maxLength={300}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#BD0927] text-white placeholder-gray-400 h-28 resize-none"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-[#500A1F] transition font-semibold tracking-wide flex items-center justify-center space-x-2"
          >
            <span>Submit Form</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;