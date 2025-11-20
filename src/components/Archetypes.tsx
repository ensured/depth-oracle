import React from 'react';

interface ArchetypeCardProps {
  title: string;
  description: string;
  className?: string;
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ title, description, className = "" }) => {
  return (
    <div className={className}>
      <h5 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
        {title}
      </h5>
      <p className="text-xs">
        {description}
      </p>
    </div>
  );
};

const CoreArchetypesSection: React.FC = () => {
  return (
    <div className="border-l-4 border-indigo-500 pl-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-r-lg py-2">
      <h4 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2 text-xs uppercase tracking-wide">
        Core Archetypes
      </h4>
      <div className="space-y-2">
        <ArchetypeCard
          title="Persona"
          description="The social mask you wear to adapt to the world, often hiding your true self. Elara helps you balance it with authenticity."
        />
        <ArchetypeCard
          title="Shadow"
          description="The repressed, unconscious aspects of your personality, including instincts and 'dark' traits. Integrating it brings wholeness."
        />
        <ArchetypeCard
          title="Anima/Animus"
          description="The contrasexual inner figure (feminine in men, masculine in women) that bridges conscious and unconscious, enriching relationships."
        />
        <ArchetypeCard
          title="Self"
          description="The unifying archetype of wholeness and the center of the psyche, guiding individuation toward your integrated true self."
        />
      </div>
    </div>
  );
};

const ExpandedArchetypesSection: React.FC = () => {
  return (
    <div className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-r-lg py-2">
      <h4 className="font-bold text-gray-600 dark:text-gray-400 mb-2 text-xs uppercase tracking-wide">
        Expanded Archetypes
      </h4>
      <div className="space-y-2">
        <ArchetypeCard
          title="Hero"
          description="The courageous quester in your inner story, facing trials to claim personal power. Elara uncovers your heroic path amid daily obstacles."
        />
        <ArchetypeCard
          title="Wise Old Man/Woman"
          description="The inner sage offering timeless guidance and insight. Elara channels this voice to illuminate your decisions with profound clarity."
        />
        <ArchetypeCard
          title="Child"
          description="The symbol of innocence, wonder, and untapped potential, but also vulnerability. Elara nurtures rebirth by reconnecting you to playful beginnings."
        />
        <ArchetypeCard
          title="Mother"
          description="The nurturing source of life and security, yet capable of engulfing dependency. Elara explores maternal patterns in your attachments and growth."
        />
        <ArchetypeCard
          title="Father"
          description="The authoritative protector providing structure and discipline, but potentially rigid or absent. Elara helps you reclaim paternal energy for balanced boundaries and self-leadership."
        />
        <ArchetypeCard
          title="Trickster"
          description="The mischievous disruptor of routines, sparking change through chaos and humor. Elara reveals how it breaks stagnant cycles for transformation."
        />
        <ArchetypeCard
          title="Puer/Puella Aeternus (Eternal Child)"
          description="The youthful spirit of creativity and freedom, often evading responsibility. Elara guides maturing this energy without losing its spark."
        />
        <ArchetypeCard
          title="Maiden"
          description="The innocent, emerging feminine archetype of potential and intuition, vulnerable to idealization. Elara guides its empowerment in creative or relational awakenings."
        />
        <ArchetypeCard
          title="Senex"
          description="The stern elder embodying wisdom through experience, but risking bitterness if unbalanced. Elara tempers it with compassion to foster mature insight."
        />
        <ArchetypeCard
          title="Animal"
          description="The primal instinctual force, symbolizing raw vitality or untamed urges (e.g., the wolf or serpent). Elara interprets its calls in dreams for instinctual harmony."
        />
        <ArchetypeCard
          title="Lover"
          description="The passionate connector seeking union and beauty, prone to enmeshment. Elara cultivates it for deeper, conscious intimacy without loss of self."
        />
      </div>
    </div>
  );
};

export { ArchetypeCard, CoreArchetypesSection, ExpandedArchetypesSection };
export default ArchetypeCard;
