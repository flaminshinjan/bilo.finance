import Image from "next/image";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="mt-6 mb-10 flex flex-col items-center px-4">
      <div className="w-full max-w-[605px] mb-10 text-center">
        <h1 className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[55px] tracking-[0.5px] leading-[1.1] font-medium text-black dark:text-white transition-colors duration-200">
          <div>Building the First <span className="text-black dark:text-white">AI</span></div>
          <div className="tracking-[1px] sm:tracking-[2px]">Invoicing Company</div>
        </h1>
        
      </div>
      <div className="hero-image-container w-full max-w-[605px]">
        <div className="relative w-full h-[250px] sm:h-[300px] md:h-[351px] lg:h-[400px] rounded-[20px] overflow-hidden hero-image-wrapper">
          <Image
            src="/hero-image.png"
            alt="Team collaboration illustration"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="mt-4 flex justify-center">
          <Link 
            href="/select-user-type" 
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
          >
            Try Now
          </Link>
        </div>
      </div>
    </section>
  );
}; 