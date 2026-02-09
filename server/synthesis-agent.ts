import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import fs from 'fs';
import { parse } from 'yaml';

const PROJECT_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');

const WRITING_STYLE_PROMPT = `You are a research synthesis writer for a Stanford GSB study on climate investment by high-net-worth individuals and family offices.

WRITING STYLE RULES (follow these exactly):
- Never use em-dashes (—). Use periods, commas, or parentheses instead.
- Open with a specific, concrete observation before expanding to the general.
- Alternate between longer flowing sentences and short declarative ones for rhythm.
- Ground abstract patterns in tangible evidence: specific quotes, specific numbers, specific moments from interviews.
- Use first person when appropriate ("What we heard..." not "The data suggests...").
- Metaphor as argument, not decoration. If a metaphor doesn't carry meaning, cut it.
- Write like a designer who thinks in systems, not an analyst who thinks in reports.
- Name what's missing, what's surprising, what doesn't fit the pattern.
- No bullet-point lists as primary structure. Use prose. Bullets only for reference data.
- Vocabulary: measured and literary without pretension. Favor verbs over adjectives.
- Never use these phrases: "it's important to note", "significantly", "it is worth mentioning", "delve into", "leverage", "utilize", "in conclusion", "key takeaways", "robust", "landscape"
- Never start sentences with "Interestingly," or "Notably,"
- Keep paragraphs varied in length. Some can be a single sentence.

When you write synthesis, always attribute insights to specific sessions by participant ID when possible. A rating of 0 means discussed but not rated (exclude from averages).`;

type AnalysisType = 'thematic' | 'concept-synthesis' | 'decision-framework' | 'triangulation' | 'key-quotes' | 'paper-section';
type ParticipantGroup = 'investor' | 'scientist' | 'policy';

function classifyGroup(role: string, orgType: string): ParticipantGroup {
  const r = (role || '').toLowerCase();
  const o = (orgType || '').toLowerCase();
  if (r.includes('scientist') || r.includes('researcher') || r.includes('professor')
    || r.includes('academic') || o.includes('university') || o.includes('research')) return 'scientist';
  if (r.includes('policy') || r.includes('analyst') || r.includes('government')
    || r.includes('regulator') || o.includes('government') || o.includes('ngo')
    || o.includes('think tank')) return 'policy';
  return 'investor';
}

function loadSessions(): any[] {
  const dir = path.join(DATA_DIR, 'sessions');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8')));
}

function loadConcepts(): any[] {
  const dir = path.join(DATA_DIR, 'concepts');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.yaml'))
    .map(f => parse(fs.readFileSync(path.join(dir, f), 'utf-8')));
}

function loadYaml(filename: string): any {
  const fp = path.join(DATA_DIR, filename);
  if (!fs.existsSync(fp)) return {};
  return parse(fs.readFileSync(fp, 'utf-8'));
}

function summarizeSession(s: any): string {
  const group = classifyGroup(s.participantRole, s.organizationType);
  let summary = `--- Session ${s.participantId} (${s.participantRole}, ${s.organizationType}, group: ${group}) ---\n`;
  if (s.hasInvestedInClimate !== undefined) summary += `Invested in climate: ${s.hasInvestedInClimate}\n`;
  if (s.selectedTopics?.length) summary += `Selected topics: ${s.selectedTopics.join(', ')}\n`;
  if (s.customTopics?.length) summary += `Custom topics: ${s.customTopics.join(', ')}\n`;
  if (s.selectedBarriers?.length) summary += `Selected barriers: ${s.selectedBarriers.join(', ')}\n`;
  if (s.customBarriers?.length) summary += `Custom barriers: ${s.customBarriers.join(', ')}\n`;

  const fb = s.conceptFeedback || {};
  const fbEntries = Object.entries(fb);
  if (fbEntries.length > 0) {
    summary += `\nConcept feedback:\n`;
    for (const [cid, f] of fbEntries as [string, any][]) {
      summary += `  ${cid}: rating=${f.rating}`;
      if (f.notes) summary += ` | notes: ${f.notes}`;
      if (f.modifications) summary += ` | modifications: ${f.modifications}`;
      summary += '\n';
    }
  }

  if (s.sessionConcepts?.length) {
    summary += `\nSession concepts created:\n`;
    for (const sc of s.sessionConcepts) {
      summary += `  - ${sc.name}: ${sc.tagline || ''}\n`;
    }
  }

  if (s.notes) {
    summary += `\nInterview notes:\n${s.notes}\n`;
  }

  return summary;
}

function buildContext(type: AnalysisType, params?: Record<string, any>): string {
  const sessions = loadSessions();
  const concepts = loadConcepts();
  const topics = loadYaml('topics.yaml');
  const barriers = loadYaml('barriers.yaml');

  let context = '';

  // Add topics/barriers reference
  if (topics.topics) {
    context += `TOPICS: ${topics.topics.map((t: any) => `${t.id} (${t.name})`).join(', ')}\n\n`;
  }
  if (barriers.barriers) {
    context += `BARRIERS: ${barriers.barriers.map((b: any) => `${b.id} (${b.name})`).join(', ')}\n\n`;
  }

  // Filter sessions based on analysis type
  let filteredSessions = sessions;
  if (type === 'thematic' && params?.participantGroup && params.participantGroup !== 'all') {
    filteredSessions = sessions.filter(s => classifyGroup(s.participantRole, s.organizationType) === params.participantGroup);
  }

  // For concept-synthesis, add the concept definition
  if (type === 'concept-synthesis' && params?.conceptId) {
    const concept = concepts.find(c => c.id === params.conceptId);
    if (concept) {
      context += `TARGET CONCEPT:\n`;
      context += `Name: ${concept.name}\nTagline: ${concept.tagline}\n`;
      if (concept.details) {
        for (const d of concept.details) {
          if (d.title) context += `${d.title}: `;
          context += `${d.description}\n`;
        }
      }
      context += '\n';
    }
  }

  // Add session data
  context += `INTERVIEW DATA (${filteredSessions.length} sessions):\n\n`;
  for (const s of filteredSessions) {
    context += summarizeSession(s) + '\n';
  }

  return context;
}

function buildPrompt(type: AnalysisType, params?: Record<string, any>): string {
  switch (type) {
    case 'thematic': {
      const group = params?.participantGroup || 'all';
      const groupLabel = group === 'all' ? 'all participants'
        : group === 'investor' ? 'investor participants'
        : group === 'scientist' ? 'climate scientist participants'
        : 'policy analyst participants';
      return `Analyze the interview data below, focusing on ${groupLabel}.

Identify 5-8 key insights across these interviews. Format your output in markdown using this structure for each insight:

## [Sharp, specific title]

[A synthesis paragraph explaining what this insight means. Don't just report what people said. Interpret it. What does this pattern reveal about how these participants think? What tension or contradiction does it expose? What does it imply for the field? Write with conviction.]

> "[Direct quote or close paraphrase]" (Participant ID, role)

> "[Another quote]" (Participant ID, role)

---

Use sharp, specific titles (not generic category names like "Risk" but something that captures the actual finding, e.g. "The 10-year patience gap" or "Climate returns need a different scorecard"). Use blockquotes (>) for all participant quotes. Separate each insight with a horizontal rule (---).

After the main insights, add:

## Outliers

1-2 observations that only one person made but feel significant. Explain why they matter.

Write the synthesis paragraphs as a flowing narrative. Connect the insights to each other. The goal is not a summary of what people said but an argument about what it means.`;
    }

    case 'decision-framework':
      return `Analyze the investor interview data below.

Identify the 5-10 core questions these investors ask (explicitly or implicitly) when evaluating a climate investment opportunity. These are the questions that separate "investable" from "interesting but unfundable."

For each question, state it clearly, explain why it matters with evidence from specific interviews, and note whether different investor types weight it differently.

Write this as a cohesive narrative. Think of it as the hidden decision tree these investors carry in their heads.`;

    case 'triangulation':
      return `Analyze the interview data below, grouped by participant type (investor, scientist, policy).

For each group, analyze what topics they care about, what barriers they identify, and what concepts excite them.

Write a narrative mapping where perspectives ALIGN and where they DIVERGE. Identify the 2-3 highest-potential "overlap zones" where investor demand, scientific priority, and policy momentum converge.

If only one participant group has data, note this honestly and analyze what's available.`;

    case 'key-quotes':
      return `From the interview data below, extract the 15-20 most significant direct quotes or closely paraphrased statements.

"Significant" means: reveals a mental model, captures a barrier vividly, proposes something novel, or contradicts conventional wisdom.

For each, include the quote, who said it (participant ID and role), and brief context. Organize thematically. Write a brief introduction framing what these quotes collectively reveal.`;

    case 'paper-section': {
      const section = params?.paperSection || 2;
      const prompts: Record<number, string> = {
        1: `Using the interview data below, draft Part 1: "The Setup" for a research paper on HNWI climate investment. Map where climate capital flows today, identify where it gets stuck and why, frame the three perspectives (investors, scientists, policy), and set up the research questions. Use evidence from actual interviews.`,
        2: `Using the interview data below, draft Part 2: "Insights" for a research paper on HNWI climate investment. Synthesize what each group said. Organize by insight, not by interview. Pull specific quotes. If only investor data exists, go deep on what's there.`,
        3: `Using the interview data below, draft Part 3: "Overlaps" for a research paper on HNWI climate investment. Map investor demand x scientific priority x policy viability. Where do they converge? Where do they diverge? Identify specific areas where new investment vehicles could unlock capital.`,
        4: `Using the interview data below, draft Part 4: "Decision Framework" for a research paper on HNWI climate investment. Distill 5-10 core questions HNW investors ask when evaluating opportunities. Show how different types weight these differently.`,
        5: `Using the interview data below, identify 5-7 design opportunities for new climate investment products, vehicles, or approaches. Format your output in markdown using this structure for each opportunity:

## [Opportunity title]

[A synthesis paragraph explaining why this opportunity exists. What pain point does it address? What gap in the current market does it fill? What did participants say (or fail to say) that points here? Attribute insights to specific participant IDs. Ground it in evidence.]

> "[Supporting quote]" (Participant ID, role)

### What this might look like

- **[Idea 1 name]**: [1-2 sentence description of a concrete, buildable version of this]
- **[Idea 2 name]**: [1-2 sentence description]
- **[Idea 3 name]**: [1-2 sentence description]

---

Use sharp, concrete opportunity titles (not "better climate funds" but "a rolling 18-month climate infrastructure SPV designed for family offices that want exposure without 10-year lockups"). Separate each opportunity with a horizontal rule (---). Think like a designer, not an analyst. Sketch possibilities that feel tangible and buildable, not theoretical.

Write as a narrative. Connect the opportunities to each other where they overlap. The goal is not a wish list but a design brief grounded in evidence.`,
      };
      return prompts[section] || prompts[2];
    }

    case 'concept-synthesis':
      return `Using the interview data below, synthesize all feedback for the target concept.

Write a synthesis including: an honest assessment of how this concept landed, the strongest arguments for it (with quotes), the strongest arguments against or concerns, and 2-3 specific recommendations for evolving it.

Write in prose. Be direct about what works and what doesn't.`;

    default:
      return 'Provide a general synthesis of the interview data below.';
  }
}

export async function runSynthesisAgent(
  type: AnalysisType,
  params?: Record<string, any>
): Promise<{ content: string; sessionCount: number }> {
  const client = new Anthropic();

  const context = buildContext(type, params);
  const prompt = buildPrompt(type, params);
  const sessions = loadSessions();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: WRITING_STYLE_PROMPT,
    messages: [
      {
        role: 'user',
        content: `${prompt}\n\n---\n\n${context}`,
      },
    ],
  });

  const content = response.content
    .filter(block => block.type === 'text')
    .map(block => (block as any).text)
    .join('\n');

  return { content, sessionCount: sessions.length };
}
