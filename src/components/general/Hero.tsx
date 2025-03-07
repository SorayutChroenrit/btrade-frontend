import Image from "next/image";
import { Button } from "../ui/button";

export default function Hero() {
  return (
    <div className="relative z-0 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
      <div className="flex flex-col xl:flex-row gap-8 md:gap-12 xl:gap-16 items-center">
        {/* Text Content */}
        <div className="w-full xl:w-1/2 space-y-6">
          <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl leading-tight">
            <span className="text-[#FDAB04] block mb-2">
              Master the Art of Bond Trading —
            </span>
            <span className="block">Take Your Skills to New Heights</span>
          </h1>

          <p className="text-lg sm:text-xl lg:text-2xl text-gray-800 dark:text-gray-200 font-normal max-w-2xl">
            Renew Your Knowledge, Elevate Your Profits! Learn Bond Trading Like
            a Pro!
          </p>

          <Button
            variant="hero"
            className="mt-6 text-lg px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Explore Course
          </Button>
        </div>

        {/* Image */}
        <div className="w-full xl:w-1/2 mt-8 xl:mt-0">
          <div className="relative aspect-[4/3] w-full max-w-2xl mx-auto xl:mx-0">
            <Image
              src="/hero.jpg"
              alt="Bond Trading Course"
              fill
              priority
              className="object-contain rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
