import { Sparkles } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

export function FounderStory() {
  return (
    <section className="story-section" id="about-us">
      <div className="story-copy">
        <SectionHeading eyebrow="Founder Story" title="Built from care, skill, and family" />
        <p>
          K Beauty Salon began with a simple promise: every client should feel listened to before a
          service begins and genuinely cared for after they leave. The founder grew up around women
          who made beauty feel practical, warm, and personal, and that feeling became the heart of
          the salon.
        </p>
        <p>
          What started as helping friends and family prepare for special days has grown into a calm,
          welcoming studio for hair, beauty, and nail services. The salon is modern in technique but
          personal in spirit, designed for clients who want honest advice, tidy results, and a place
          they can trust.
        </p>
      </div>
      <div className="belief-panel">
        <Sparkles size={28} />
        <h3>What We Believe</h3>
        <p>Beauty feels best when it is thoughtful, comfortable, and made for real life.</p>
      </div>
    </section>
  );
}
