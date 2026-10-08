"use client";

import Image from "next/image";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import Flex from "@/components/ui/layout/Flex";

interface HeroProps {
  onStartListening: () => void;
  onExploreTracks: () => void;
  dataHook?: string;
}

export default function Hero({
  onStartListening,
  onExploreTracks,
  dataHook = "dashboard-hero",
}: HeroProps) {
  return (
    <Flex
      as="section"
      dataHook={dataHook}
      align="center"
      justify="center"
      className="relative h-screen overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <Image
        src="/hero.jpg"
        alt="Soundstream Hero"
        fill
        className="absolute top-0 left-0 w-full h-full z-[-1] object-cover brightness-[0.35] saturate-[1.1]"
        priority
      />

      {/* Content Container */}
      <Flex
        direction="col"
        align="center"
        className="text-center max-w-[800px] px-8 z-10 animate-[fadeIn_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
      >
        <Heading
          level={1}
          size="5xl"
          className="tracking-tight leading-[1.1] mb-6 font-extrabold text-white"
        >
          Stream Your{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent bg-[length:200%_200%] animate-[gradientMove_5s_ease_infinite]">
            World
          </span>
        </Heading>

        <Text
          variant="lead"
          color="muted"
          className="mb-10 max-w-[600px] mx-auto text-lg leading-relaxed"
        >
          Experience high-fidelity audio streaming powered by a high-performance Go backend. No lag,
          no limits, just pure sound.
        </Text>

        <Flex gap={4} justify="center" wrap="wrap">
          <Button
            variant="primary"
            size="lg"
            onClick={onStartListening}
            dataHook={`${dataHook}-start-listening`}
            className="rounded-full px-8 py-3 text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-[2px] active:translate-y-0 transition-all duration-300"
          >
            Start Listening
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onExploreTracks}
            dataHook={`${dataHook}-explore-tracks`}
            className="rounded-full px-8 py-3 text-base text-white border-white/20 hover:bg-white/5 hover:border-white/30 hover:-translate-y-[2px] active:translate-y-0 transition-all duration-300"
          >
            Explore Tracks
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
