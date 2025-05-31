'use client';

import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Shinjan Patra",
      role: "Founder & CTO",
      image: "/team/shinjan.png", // Add team member images to public/team/
      linkedin: "https://www.linkedin.com/in/shinjanpatra/",
    },
    {
      name: "Bilo",
      role: "Chief Vibe Officer",
      image: "/team/bilo.png",
      linkedin: "#",
      description: "AI enthusiast, meme connoisseur, and keeper of good vibes"
    },
    // Add more team members as needed
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Story Section */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-5xl text-3xl font-medium mb-8 md:mb-16 tracking-tight mx-auto text-center">
            Our Bilo Story 🐶
          </h1>
          
          <div className="space-y-8 md:space-y-12 text-gray-600 text-base md:text-lg leading-relaxed">
            

            <div className="relative w-full h-[250px] md:h-[400px] rounded-[20px] overflow-hidden mb-8 md:mb-12">
              <Image
                src="/about-us.png"
                alt="About Bilo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <p>
              Bilo is an AI-powered invoicing platform founded by 
              <span className="text-gray-900"> Shinjan Patra</span>, who discovered 
              firsthand how broken and time-consuming traditional invoicing still is.
            </p>
            <p>
              After years of helping small businesses and startups manage their finances,
              we witnessed countless hours wasted on manual data entry, chasing unpaid invoices,
              and dealing with human errors in financial records.
            </p>

            <p>
              The breaking point came when we saw a brilliant local business almost shut down
              because of delayed payments and messy invoice tracking. That's when we realized:
              in an age of AI and automation, why are businesses still struggling with basic
              financial operations?
            </p>

            <p>
              We decided it was time to change this. Drawing from our experience in AI and
              fintech, we built Bilo - a platform that makes invoicing as simple as having
              a conversation. No more manual entry, no more lost invoices, no more sleepless
              nights over cash flow.
            </p>

            <p>
              Today, Bilo is helping businesses across the globe transform their invoicing
              workflow with AI. Our mission is simple: give businesses their time back,
              so they can focus on what truly matters - growing their business and serving
              their customers.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-10 px-0 ">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-medium text-center mb-8 md:mb-16 px-4 opacity-70">
            Reimagining <span className="text-black">invoicing</span> ❤️ to help businesses<br className="hidden md:block" />
            get paid faster and stress less about billing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
            {/* Team Image Box */}
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <Image
                src="/thought-bubble.png"
                alt="Bilo Team"
                fill
                className="object-cover"
              />
            </div>

            {/* Extreme Ownership Box */}
            <div className="bg-black text-white p-8 rounded-lg flex flex-col justify-between aspect-square">
              <h3 className="text-3xl font-bold mb-6">Customer First</h3>
              <p className="text-gray-300">
                Every decision we make starts with our customers. We obsess over their needs,
                challenges, and success. Their growth is our growth.
              </p>
            </div>

            {/* First Principles Box */}
            <div className="bg-black text-white p-8 rounded-lg flex flex-col justify-between aspect-square">
              <h3 className="text-3xl font-bold mb-6">AI-Powered Innovation</h3>
              <p className="text-gray-300">
                We leverage cutting-edge AI to solve real problems. Not for the sake of tech,
                but to make financial operations truly effortless.
              </p>
            </div>

            {/* Built for Trust Box */}
            <div className="bg-black text-white p-8 rounded-lg flex flex-col justify-between aspect-square">
              <h3 className="text-3xl font-bold mb-6">Built for Trust</h3>
              <p className="text-gray-300">
                Security and reliability are our foundation. We handle your finances with the
                care and precision they deserve. No compromises.
              </p>
            </div>

            {/* Empathy Box */}
            <div className="bg-black text-white p-8 rounded-lg flex flex-col justify-between aspect-square">
              <h3 className="text-3xl font-bold mb-6">Move Fast, Stay Humble</h3>
              <p className="text-gray-300">
                We're quick to act but never rush. Every feature we ship is thoughtfully
                crafted to make your business run smoother.
              </p>
            </div>

            {/* Join Us Box */}
            <div className="bg-gradient-to-br from-[#FBB03B]/20 to-[#FBB03B]/10 p-8 rounded-lg flex flex-col justify-between aspect-square relative overflow-hidden">
              <h3 className="text-3xl font-bold mb-6">Join Our Mission 🚀</h3>
              <Link 
                href="/careers"
                className="inline-block bg-[#FBB03B] text-black px-6 py-3 rounded-full font-medium hover:bg-[#FBB03B]/80 transition-colors w-fit"
              >
                We're Hiring!
              </Link>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FBB03B]/20 rounded-full opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-base md:text-lg text-gray-600">
              To simplify financial operations for businesses through intelligent automation, 
              enabling them to focus on growth while we handle the complexities of invoicing.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4 md:p-6">
              
              <div className="text-primary text-2xl md:text-3xl font-medium mb-3">AI-Powered</div>
              <p className="text-gray-600 text-sm md:text-base">
                Leveraging cutting-edge AI technology to automate and optimize invoicing processes
              </p>
            </div>
            <div className="text-center p-4 md:p-6">
              
              <div className="text-primary text-2xl md:text-3xl font-medium mb-3">Efficient</div>
              <p className="text-gray-600 text-sm md:text-base">
                Reducing manual work and errors through smart automation and validation
              </p>
            </div>
            <div className="text-center p-4 md:p-6">
              
              <div className="text-primary text-2xl md:text-3xl font-medium mb-3">Secure</div>
              <p className="text-gray-600 text-sm md:text-base">
                Ensuring your financial data is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-2">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 md:mb-12">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative w-32 h-32 md:w-48 md:h-48 mx-auto mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-600 mb-2">{member.role}</p>
                {member.description && (
                  <p className="text-gray-500 text-sm mb-3 italic">{member.description}</p>
                )}
                {member.linkedin !== "#" && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    LinkedIn Profile
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
            Ready to Transform Your Invoicing?
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8">
            Join us in revolutionizing the way businesses handle their finances.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-primary text-black px-8 py-3 rounded-full font-medium hover:bg-primary/80 transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </main>
  );
} 