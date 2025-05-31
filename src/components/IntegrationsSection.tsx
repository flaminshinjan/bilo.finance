import Image from "next/image";

const INTEGRATIONS = [
  { name: "Supabase", logo: "/supabase.png" },
  { name: "ChatGPT", logo: "/chatgpt.png" },
  { name: "Cursor", logo: "/cursor.png" },
  { name: "Claude", logo: "/claude.png" },
  { name: "Figma", logo: "/figma.png" },
];

export const IntegrationsSection = () => {
  return (
    <section className="pt-2 px-4">
      <div className="text-center">
        <p className="text-base sm:text-lg font-medium mb-3 text-[#333333]">
          Integrations possible with
        </p>
        <div className="scroll-container w-full max-w-[545px] mx-auto">
          <div className="scroll-content">
            {/* First set of logos */}
            <div className="inline-flex items-center gap-[10px] mr-[20px]">
              {INTEGRATIONS.map((integration) => (
                <div key={integration.name} className="w-[80px] sm:w-[100px] h-[24px] relative">
                  <Image
                    src={integration.logo}
                    alt={integration.name}
                    fill
                    className="opacity-80 hover:opacity-100 transition-opacity object-contain"
                  />
                </div>
              ))}
            </div>
            {/* Duplicate set for seamless scrolling */}
            <div className="inline-flex items-center gap-[20px] mr-[20px]">
              {INTEGRATIONS.map((integration) => (
                <div key={`${integration.name}-dup`} className="w-[80px] sm:w-[100px] h-[24px] relative">
                  <Image
                    src={integration.logo}
                    alt={integration.name}
                    fill
                    className="opacity-80 hover:opacity-100 transition-opacity object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 