'use client';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Container from '@/components/ui/layout/Container';
import Flex from '@/components/ui/layout/Flex';
import Grid from '@/components/ui/layout/Grid';

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

const FEATURE_LIST: FeatureItem[] = [
  {
    icon: '⚡',
    title: 'Ultra Fast',
    desc: "Leveraging Go's high-performance concurrency for lightning-fast, buffer-free audio delivery straight to your device.",
  },
  {
    icon: '☁️',
    title: 'Cloud Integration',
    desc: 'Dynamic, real-time audio extraction and piping using yt-dlp, providing a gateway to an infinite universe of sound.',
  },
  {
    icon: '💎',
    title: 'Premium UI',
    desc: 'A gorgeous, ultra-modern interface crafted with glassmorphism, rich colors, and dynamic animations for first-class aesthetics.',
  },
];

export default function Features() {
  return (
    <Container as="section" className="max-w-[1200px] py-20">
      <Flex direction="col" align="center" className="text-center mb-16">
        <Heading level={2} size="3xl" className="text-white font-bold mb-4">
          Why Soundstream?
        </Heading>
        <Text variant="body" color="muted" className="max-w-[600px] mx-auto">
          Engineered for raw streaming power, high-performance concurrency, and gorgeous pixel-perfect aesthetics.
        </Text>
      </Flex>

      <Grid cols={3} colsMobile={1} colsTablet={2} gap={6}>
        {FEATURE_LIST.map((feature, i) => (
          <Flex 
            key={i} 
            direction="col"
            className="p-10 rounded-2xl bg-[#111] border border-white/8 transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500 hover:bg-[#1a1a1a]"
          >
            <Flex align="center" justify="center" className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 mb-6 text-xl text-white shadow-md shadow-emerald-500/10 select-none">
              {feature.icon}
            </Flex>
            
            <Heading level={3} size="sm" className="text-white font-semibold mb-3">
              {feature.title}
            </Heading>
            
            <Text variant="body-sm" color="muted" className="text-sm leading-relaxed">
              {feature.desc}
            </Text>
          </Flex>
        ))}
      </Grid>
    </Container>
  );
}
