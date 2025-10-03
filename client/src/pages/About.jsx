import React, { useState } from 'react';
// import Logo from '../assets/Logo.png';

const About = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const teamMembers = [
    {
      name: "Tanvi",
      designation: "President",
      funnyFact: "thik hai kya bolu ab",
      type: "founder"
    },
    {
      name: "Mayank Kejriwal",
      designation: "Vice President",
      funnyFact: "ye bhi thik hai kya bolu ab",
      type: "founder"
    },
    {
      name: "Pranav Gupta",
      designation: "Tech Head",
      funnyFact: "ye to saala chamar hai",
      type: "founder"
    },
    {
      name: "Abhinav",
      designation: "Web dev head",
      funnyFact: "silent but goated",
      type: "founder"
    },
    {
      name: "Pravar",
      designation: "Web dev",
      funnyFact: "Writes code that works on the first try but burns breakfast daily",
      type: "technical"
    },
    {
      name: "Arsh",
      designation: "Web dev",
      funnyFact: "pata nahi kya cook karre hai ye",
      type: "technical"
    },
    {
      name: "Sumeet",
      designation: "Web dev",
      funnyFact: "only honest guy sabse acha banda hai",
      type: "technical"
    },
    {
      name: "Sam",
      designation: "Design team",
      funnyFact: "Design nahi banri inse abhi tak",
      type: "technical"
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-black pt-10 text-white min-h-screen w-full font-sans overflow-x-hidden">
      {/* Navigation - Fully Responsive */}

      {/* Main Content Container with consistent spacing */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* What is ACUMEN Section - Responsive with consistent spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 py-16 lg:py-20 items-center">
          <div className="w-full">
            <h2 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold mb-6 lg:mb-8 leading-tight">
              WHAT IS <span className="text-red-500">ACUMEN</span>?
            </h2>
            <div className="space-y-6 text-gray-300 text-sm sm:text-base leading-relaxed">
              <p>
                TechTatva 2025 Acumen Where Strategy, Puzzles, and Possibilities Unite!
                Step into TechTatva 2025's most exhilarating challenge: Acumen.
                A clash of intellect and strategy, featuring two thrilling journeys—
                Tesseract and Hopeless Opus.
              </p>
              <p>
                From mind-bending puzzles to choices that shape your destiny,
                Acumen is not just a test—it's an adventure you won't forget.
                Try your hand at the prize pool of a whopping Rs. 24,000!
              </p>
            </div>
          </div>
          <div className="w-full flex items-center justify-center">
            <div className="w-full h-48 sm:h-56 lg:h-64 xl:h-72 bg-gray-800 rounded-lg border border-gray-700"></div>
          </div>
        </div>

        {/* Our Challenges Section - Responsive with consistent spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-16 lg:py-20">
          <div className="w-full">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 lg:mb-8">Our Challenges</h2>
            <p className="mb-8 text-gray-300 text-sm sm:text-base leading-relaxed">
                From mind-bending puzzles to choices that shape your destiny,
                Acumen is not just a test—it's an adventure you won't forget.
                Try your hand at the prize pool of a whopping Rs. 24,000!
            </p>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex justify-between mb-2 text-sm sm:text-base">
                  <span className="text-gray-300">Strategy Games</span>
                  <span className="text-gray-300">98%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{width: '98%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2 text-sm sm:text-base">
                  <span className="text-gray-300">Puzzle Solving</span>
                  <span className="text-gray-300">95%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{width: '95%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2 text-sm sm:text-base">
                  <span className="text-gray-300">Interactive Stories</span>
                  <span className="text-gray-300">93%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{width: '93%'}}></div>
                </div>
              </div>
            </div>
          </div>  
          
          <div className="w-full flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-md w-full">
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-800">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400 mb-2">24K+</div>
                <div className="text-gray-400 text-xs sm:text-sm">Downloads</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-800">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400 mb-2">1000+</div>
                <div className="text-gray-400 text-xs sm:text-sm">Happy Users</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-800">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400 mb-2">2</div>
                <div className="text-gray-400 text-xs sm:text-sm">Platforms</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-800">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-400 mb-2">40</div>
                <div className="text-gray-400 text-xs sm:text-sm">Team Members</div>
              </div>
            </div>
          </div>
        </div>

        {/* Meet The Core Team - Responsive Grid with Card Backgrounds */}
        <div className="py-16 lg:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 leading-tight">
          Meet The<br />
          <span className="text-red-500">Core Team</span>
          </h2>
        <p className="text-gray-400 text-center mb-8 lg:mb-12 max-w-2xl mx-auto text-sm sm:text-base px-4">
        Our dedicated team works tirelessly to create unforgettable 
        experiences and challenging adventures for all participants.
        </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {teamMembers.map((member, index) => (
          <div 
            key={index} 
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6 text-center hover:scale-105 transition-transform duration-300 group"
          >
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-lg sm:text-xl font-bold ${
                member.type === 'founder'
                  ? 'bg-red-900 border-2 border-red-500'
                  : 'bg-green-900 border-2 border-green-500'
              }`}
            >
              {member.name.charAt(0)}
            </div>
            <div className="text-sm sm:text-base font-bold mb-1">{member.name}</div>
            <div className="text-xs sm:text-sm text-gray-400 mb-3 font-medium">
              {member.designation}
            </div>
            <div className="text-xs text-gray-500 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 italic">
              "{member.funnyFact}"
            </div>
          </div>
        ))}
      </div>
    </div>


        {/* What is HOPELESS OPUS - Responsive with consistent spacing */}
        <div className="text-center py-16 lg:py-20 px-4">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 lg:mb-8">
            WHAT IS <span className="text-red-500">HOPELESS OPUS</span> ?
          </h2>
          <p className="text-gray-400 max-w-4xl mx-auto text-sm sm:text-base leading-relaxed">
            Hopeless Opus is a global blog that has garnered substantial popularity 
            due to its comprehensive array of subjects. Founded by a team of passionate 
            writers and industry experts, the blog offers a diverse range of content 
            spanning technology, lifestyle, finance, health, and much more. With a 
            commitment to delivering high-quality, well-researched articles, Hopeless 
            Opus has become a trusted source of information for readers worldwide.
          </p>
        </div>

        {/* Contact Section - Responsive with consistent spacing */}
        <div className="py-16 lg:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 lg:mb-12 text-center">
            CONTACT <span className="text-red-500">US</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="w-full">
              <div className="bg-gray-900 rounded-lg h-64 sm:h-72 lg:h-80 xl:h-96 p-4 sm:p-6 lg:p-8 border border-gray-800 flex items-center justify-center">
                <span className="text-gray-500">Map/Image Placeholder</span>
              </div>
            </div>
            
            <div className="w-full">            
              <h3 className="text-lg sm:text-xl font-semibold mb-4 lg:mb-6 text-red-500">
                Get In Touch
              </h3>
              <p className="text-gray-400 mb-6 text-sm sm:text-base leading-relaxed">
                Have any questions or issues that you want to bring to our attention? Feel free to drop us a message here, and we'll get back to you as soon as possible!
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors text-sm sm:text-base"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors text-sm sm:text-base"
                />
                <textarea
                  name="message"
                  placeholder="Message"
                  rows="4"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none text-sm sm:text-base"
                ></textarea>
                <button
                  onClick={handleSubmit}
                  className="w-full bg-red-600 text-white py-3 rounded font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 text-sm sm:text-base"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Fully Responsive with consistent spacing */}
      <footer className="bg-black px-4 sm:px-6 lg:px-8 py-12 lg:py-16 border-t border-gray-800 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <h3 className="text-red-500 font-bold mb-4 text-lg sm:text-xl">HOPELESS OPUS</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                Experience the ultimate challenge of strategy, puzzles, and intellectual prowess in TechTatva
                2025's most exciting competition.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-base sm:text-lg">Quick Links</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Challenges</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Leaderboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-base sm:text-lg">Get in Touch</h4>
              <div className="text-sm sm:text-base text-gray-400 space-y-2">
                <p>Udupi, Karnataka, India</p>
                <p>Email: info@acumen.com</p>
                <p>Phone: +91 99999999999</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs sm:text-sm text-gray-400">
            Copyright 2025 Hopeless Opus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
export default About;
