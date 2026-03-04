export interface Insight {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  body: string[];
  section: 'why-not-enter' | 'what-keeps-scaling' | 'system-fails';
}

export interface DesignOpportunity {
  id: string;
  title: string;
  question: string;
  body: string[];
  proposals: string[];
}

export interface PullQuote {
  text: string;
  afterSection?: string;
}

export const intro = {
  title: 'Not persuasion. Plumbing.',
  lead: "I'm a graduate student at Stanford GSB. For the past several months, I've been conducting independent research on a question that sounds simple: why doesn't more high net worth capital reach climate solutions?",
  paragraphs: [
    'I interviewed investors, fund managers, philanthropic advisors, and family office practitioners across five countries. What follows are the things everyone in this space is excited to understand but afraid to ask: the real reasons capital stalls, the structural failures nobody wants to name, and the counterintuitive opportunities hiding inside them.',
    'Mobilizing high net worth capital for climate has two distinct failures. The first is getting family offices through the door. The second is making their capital catalytic once it arrives.',
    "Both failures share the same root. The financial infrastructure that moves capital from intent to impact was never designed for what climate assets require. The timescales don't match. The vehicles don't match. The incentives don't match. Even the language has become a liability.",
    "The barrier isn't awareness. It isn't conviction. It's the plumbing. This synthesis maps the problem across eleven insights and eight design opportunities, and ends with the one I believe matters most.",
  ],
};

export const pullQuotes: PullQuote[] = [
  { text: 'Successful first climate investments are driven by personal factors rather than pure rationality.', afterSection: 'intro' },
  { text: 'Mission-aligned investors are so convicted in their vision that purity itself becomes the barrier to catalyzing capital at scale.', afterSection: 'why-not-enter' },
  { text: 'If everyone focused on their second favorite topic, the capital would be far more catalytic.', afterSection: 'what-keeps-scaling' },
  { text: 'Everyone is waiting for the first mover to trigger the domino effect. No one wants to be the domino.', afterSection: 'system-fails' },
];

export const insights: Insight[] = [
  {
    id: 'insight-1',
    number: 1,
    title: 'The first climate check is almost always emotional. That is why it rarely gets big.',
    subtitle: 'Emotion opens the door but keeps the allocation small.',
    section: 'why-not-enter',
    body: [
      "Few first climate investments come from a spreadsheet. It comes from a grandchild's question at dinner, or from watching a coral reef die and writing a check. FOMO, legacy, identity, personal experience. These are the on-ramps. The financial case comes later, as justification.",
      'But for investors who are not climate-first (or completely committed), emotion gives everyone permission to keep it small. The principal treats it as a personal indulgence. The CIO tolerates it as a passion project. It stays in a box. It makes it harder to graduate from a $5 million gesture to a $50 million position because it was never underwritten as a serious allocation. It was underwritten as a feeling.',
    ],
  },
  {
    id: 'insight-2',
    number: 2,
    title: 'Conviction opens wallets. It also prevents them from combining.',
    subtitle: 'Purity of vision is the barrier.',
    section: 'why-not-enter',
    body: [
      'Mission-aligned investors are often too convicted. They love clean electrons but will not touch biodiversity. They want to invest in the ocean but not agriculture. The specificity of their belief becomes the barrier. They do not want a diversified climate fund. They want their version of climate, and only that.',
      'This is why aggregating family office capital is so hard. Every family has a different conviction. Getting ten of them into the same vehicle means finding the overlap between ten different passions, and often there are few overlaps. No two family offices define climate the same way, which means no single fund can satisfy more than a few of them at once. The capital stays small not because the families are small but because the convictions do not combine.',
    ],
  },
  {
    id: 'insight-3',
    number: 3,
    title: 'The word "climate" raised billions when it was fashionable. Now it repels the same money.',
    subtitle: 'Capital raised under the banner of climate was never really underwritten as climate.',
    section: 'why-not-enter',
    body: [
      'A few years ago climate was the hottest category in venture. Now a growing share of venture dollars goes to AI. The same allocators who were writing climate checks in 2021 are actively avoiding the word. What changed was not the science or the opportunity. What changed was the political landscape, a new cool kid, and the mood.',
      'This tells you something important: capital that was raised under the banner of "climate" was never really underwritten as climate. It was underwritten as momentum. And momentum that left many that didn\'t have the same conviction.',
      'Many of the companies still raising never needed the word in the first place. They pitch as advanced manufacturing, chemistry, materials, infrastructure. The climate impact is real but it is the consequence of the business working, not the reason to invest. The better frame is collinearity: impact equals business revenue. More carbon removed, more clean energy deployed, more waste diverted. These are not philanthropic byproducts. They are the top line.',
    ],
  },
  {
    id: 'insight-4',
    number: 4,
    title: 'Climate is not a sector. It is fifty sectors. And confidence, not capital, is what is missing.',
    subtitle: 'The complexity creates paralysis that looks like indifference but is actually confusion.',
    section: 'why-not-enter',
    body: [
      'Ocean investing alone is an entire career specialty. Carbon removal, grid infrastructure, industrial decarbonization, sustainable agriculture, biodiversity, building efficiency. Each has its own science, its own market dynamics, its own regulatory landscape. Few family offices can build fluency across all of it. And they know it.',
      'This is not a knowledge problem that can be solved with a report or a conference. It is a confidence problem. Even sophisticated climate investment teams struggle to build conviction across sectors this varied, and without conviction the deal does not move forward. The tools that exist for evaluating software or real estate do not transfer to ocean carbon or industrial decarbonization. The playbook has not been written yet.',
      'The contagion effect between family offices is real but it is narrow. Families follow other families with similar DNA and proven expertise. An infrastructure family follows another infrastructure family into climate. A science-trained principal follows someone with similar technical fluency. The trust is not generic. This is why broad platforms and anonymous diligence sharing face resistance. Family offices want to know exactly whose judgment they are relying on, and that person needs to look like them. The confidence to act comes not from better information but from seeing someone you recognize on the other side of the same bet.',
    ],
  },
  {
    id: 'insight-5',
    number: 5,
    title: 'Biodiversity is having a moment. The trust to invest in it is not.',
    subtitle: 'The appetite is running ahead of the infrastructure.',
    section: 'why-not-enter',
    body: [
      'Biodiversity is trending because it is apolitical. Few people are against whales. It carries emotional resonance, it is genuinely urgent, and it is one of the few climate-adjacent categories that does not trigger political resistance. For family offices looking for an on-ramp that avoids the usual landmines, biodiversity is a real one.',
      'But the appetite is running ahead of the infrastructure. The instinct is still to treat nature-based solutions as inherently philanthropic. Mangrove restoration, forest preservation, wetland recovery. These feel like causes, not investments. The reputation of the category keeps serious capital on the sidelines, not because the returns are not there but because writing a check into nature looks like a donation rather than an allocation. It is an optical problem as much as a financial one.',
      'The best operators have found the seam: nature-based approaches that generate real revenue through adjacent value. Waste management companies that produce carbon credits as a byproduct. Shrimp aquaculture that restores mangroves while producing twenty times more output per hectare. The impact is embedded in the revenue model so completely you do not need a separate impact thesis. But these examples are still the exception. Until nature-based investments look and feel like business investments, the capital will stay willing but hesitant.',
    ],
  },
  {
    id: 'insight-6',
    number: 6,
    title: 'The CIO might be the biggest unlock or the bottleneck, and the key.',
    subtitle: 'A successful climate bet does not accelerate a CIO\'s career. A failed one can end it.',
    section: 'what-keeps-scaling',
    body: [
      'Family offices are uniquely positioned to take risks that institutional capital cannot. They lack the governance constraints of pension funds. When the founder is alive they are more entrepreneurial than almost any other capital source. They can run experiments and build track records for conservative asset owners to follow.',
      'The opportunity sits with the CIO. They are the person between the principal and the portfolio. But right now CIOs are evaluated on 3-year windows against a climate thesis that needs seven to ten. And the deeper issue is asymmetry: a successful climate bet does not accelerate a CIO\'s career. A failed one can end it. They are not optimizing for returns. They are optimizing for not looking wrong.',
      'The families where climate capital flows have solved this structurally. Some have integrated risk-taking into the CIO mandate. Others have split the family office entirely: one side for wealth preservation, another for climate with its own team and authority. The contagion effect between family offices is real but it follows people, not funds. Family offices follow other family offices with similar DNA and proven expertise. The unlock is not convincing CIOs to be braver. It is designing structures where bravery is not required.',
    ],
  },
  {
    id: 'insight-7',
    number: 7,
    title: 'The vehicle failed the investment, not the other way around.',
    subtitle: 'Judging a 20-year asset on a 3-year mark is like pulling a tree out of the ground to check if the roots are growing.',
    section: 'what-keeps-scaling',
    body: [
      'Closed-end funds with 3-to-7-year horizons are a poor match for climate assets. Forests do not have exit timelines. Grid-scale deployment does not mature in five years. Judging a 20-year asset on a 3-year mark is like pulling a tree out of the ground to check if the roots are growing.',
      'The mismatch runs deeper than duration. The carry structure shapes who shows up to manage climate capital. Models built around AUM growth and management fees create managers incentivized to gather assets, not generate returns. Climate needs managers whose economics depend on outcomes, not scale. First-time funds consistently show up in top performance deciles because those managers are betting on carry. But allocators pull back from first-time funds exactly when markets tighten, which is exactly when climate needs them most.',
      'The investments are not the problem. The container is.',
    ],
  },
  {
    id: 'insight-8',
    number: 8,
    title: 'Everyone is selling climate as an opportunity. Few are framing it as a threat to what you already own.',
    subtitle: 'The most underexplored move in climate investing might be an audit, not a fund.',
    section: 'what-keeps-scaling',
    body: [
      'The conversation around climate capital is almost entirely framed as investment: here is a fund, here is a return, here is an impact thesis. But wealthy families already have climate exposure they have not been shown. Coastal real estate, supply chain dependencies, agricultural holdings, infrastructure assets. The risk is already in their portfolio. Most did not put it there as a climate bet. It arrived as weather, as insurance withdrawal, as shifting growing seasons, as unreliable ski conditions.',
      'The corporations that depend on natural systems have figured this out. LVMH invests in regenerative agriculture and biodiversity protection because 96% of its carbon footprint sits in its supply chain, in the grapes, cotton, leather, and jasmine its houses depend on. Chanel invests in mangrove restoration and forest protection because its raw materials are directly threatened. They are not doing this as CSR. They are protecting the inputs their business cannot function without.',
      'Most family offices with comparable exposure have not yet made the same connection. A family with agricultural holdings, real estate in coastal or heat-exposed cities, or portfolio companies dependent on physical supply chains faces the same kind of risk. But the map has rarely been drawn for them. The underexplored opportunity is not another climate fund. It is showing a family what a 2 degree world does to the assets they already hold.',
    ],
  },
  {
    id: 'insight-9',
    number: 9,
    title: 'The messy middle is getting messier.',
    subtitle: 'Series B and C companies are stranded, not because they failed but because no capital product exists for their stage.',
    section: 'what-keeps-scaling',
    body: [
      'Private-market climate funds tripled their assets under management between 2019 and 2022. From the outside it looked like progress but it masked a structural fracture. Capital fled to the edges: seed-stage venture at one end, late-stage mega deals at the other. The middle got hollowed out. Series B and C companies that need real money but cannot yet show full commercial proof are stranded. Not because they failed but because no capital product exists for the stage they are at.',
      'AI captured a growing share of venture dollars while climate tech funding dropped by a third between 2022 and 2024. While the broader IPO market is slowly recovering, climate tech exits remain almost nonexistent, which means funds cannot return cash to their investors, which means those investors cut budgets for new commitments. Companies with working technology need project finance, not another equity round. But outside nuclear, geothermal, and critical minerals, the project finance world does not have a product for them.',
    ],
  },
  {
    id: 'insight-10',
    number: 10,
    title: 'Adaptation does not need the word climate to work. But it only proves its value when it fails.',
    subtitle: 'It sidesteps every barrier, except proving it worked.',
    section: 'what-keeps-scaling',
    body: [
      'Mitigation asks investors to solve a collective, global problem. Adaptation asks them to protect what they already own. That is a fundamentally different ask. Insurance companies are withdrawing from California, Florida, and coastal Southeast Asia. Supply chains are breaking. Infrastructure is degrading. The families and corporations exposed to these risks do not need a climate thesis. They are already living the problem.',
      'Adaptation sidesteps every barrier this research has identified. It does not trigger political resistance. It does not require mission alignment. It does not ask a CIO to underwrite a 20-year thesis. It speaks the language family offices already use: risk, preservation, protection. Infrastructure families in Southeast Asia feel it in their operating businesses.',
      'But adaptation has a problem the other categories do not. Its return on investment is a negative: damage that did not happen. Not one dramatic save, a thousand small losses quietly reduced. A premium that rose 8 percent instead of 20. A yield that dropped 5 percent instead of 30. A supply chain that held when the one next door broke. Try putting that in a pitch deck. A VC needs a number on a slide within five years. Adaptation delivers value that only becomes legible in hindsight, usually after a catastrophe next door makes the counterfactual visible. The family that funded mangrove restoration cannot point to the moment it paid off. They can only point to the neighbor who didn\'t.',
      'The models that work bundle prediction with response: risk assessment paired with mitigation, insurance paired with prevention. In developing economies the bundling challenge is harder because carbon credit revenue models fracture where carbon markets do not exist. The adaptation product in those markets needs different foundations: agroforestry, heat reduction, government ecosystem fees. But the underlying logic holds everywhere: show someone what they stand to lose, and package the solution with the diagnosis.',
    ],
  },
  {
    id: 'insight-11',
    number: 11,
    title: 'Nobody in this system is making a mistake. That is the problem.',
    subtitle: 'Every actor is behaving rationally. The collective result is irrational.',
    section: 'system-fails',
    body: [
      'The CIO who avoids climate is protecting their career. The emerging family office that keeps its allocation small is managing risk sensibly. The fund manager who builds a 7-year vehicle is matching LP expectations. The developing economy family that prioritizes survival over sustainability is doing arithmetic correctly. Every actor in this system is behaving rationally given their constraints.',
      'The collective result is irrational. Capital is abundant. Intent is real. Deployment is a fraction of what it could be. Not because anyone is failing but because the system was never designed to connect these actors to each other or to the opportunities that need them.',
      'The missing layer is not persuasion, education, or better pitch decks. It is connective tissue: shared diligence that lets CIOs build conviction without building teams, aggregation structures that let small checks become large deployments, vehicles whose timelines match the assets inside them, and coordination that lets independent actors move together without surrendering what makes them independent. The plumbing, not the pitch.',
    ],
  },
];

export const designIntro = 'The insights above surfaced eight opportunities to reimagine how climate capital moves from intent to impact.';

export const designOpportunities: DesignOpportunity[] = [
  {
    id: 'climate-risk-wealth-preservation',
    title: 'Climate risk as wealth preservation',
    question: 'How might we help families see the climate risk they already own?',
    body: [
      'The most underexplored move in climate investing is not a new fund. It might be an audit. A family with $200 million in coastal real estate, supply chain exposure, and infrastructure assets is sitting on climate risk they have never been shown. Insurance companies already build sophisticated models for their own underwriting. The same capability, pointed at the family\'s portfolio instead of the insurer\'s book, changes the conversation from opportunity to necessity. Which is the language family offices actually respond to.',
    ],
    proposals: [
      'A climate risk audit that maps a family\'s actual holdings against 1.5 to 3 degree warming scenarios. Specific. Your property here loses this much value. Your supply chain here costs this much under drought. Your holdings here face this many fewer productive days per decade.',
      'An output that is not a pitch for climate funds but a preservation plan. Five exposures. Three interventions. Some are investments. Some are insurance. Some are operational.',
      'A vehicle where the family invests in solutions that directly hedge their own exposed assets: coastal restoration that reduces storm surge where they own beachfront, water infrastructure that secures the agricultural regions their portfolio depends on.',
    ],
  },
  {
    id: 'bundling-problem-solution',
    title: 'Bundling the problem and the solution',
    question: 'How might we connect the people bearing climate risk with the people building climate solutions?',
    body: [
      'Bolt Tech in Florida sells flood insurance bundled with water leak sensors. Preventable risks managed. Catastrophic ones reinsured. The insight is simple and important: prediction alone moves anxiety. Prediction plus response moves capital. Right now the municipality worried about flooding never meets the family office that might fund mangrove restoration. The problem owner and the solution funder sit in different worlds. They never meet.',
    ],
    proposals: [
      'A coastal resilience product where a family with beachfront exposure invests in mangrove and wetland restoration in the same geography. The nature protects their assets. Returns come from ecosystem service payments, carbon credits, and reduced premiums. They are not donating to conservation. They are building a seawall out of mangroves.',
      'An agricultural supply chain product where food companies invest in watershed preservation where their ingredients are sourced. Their own supply chain risk goes down. Returns come from improved yields and lower input costs.',
      'An urban heat product where real estate owners in hot cities invest in urban canopy and green infrastructure near their own properties. Measurable cooling, quantifiable property value uplift, avoided energy costs.',
    ],
  },
  {
    id: 'due-diligence-commons',
    title: 'The due diligence commons',
    question: 'How might we help family offices trust each other\'s climate judgment?',
    body: [
      'Climate is fifty different sectors. Ocean investing alone could be an entire career. No family office will build internal expertise across all of it, and the complexity creates a paralysis that looks like indifference but is actually confusion. And the contagion effect between families is real but narrow. An infrastructure family follows another infrastructure family into climate. A science-trained principal follows someone with similar technical fluency. The trust is not generic. Family offices want to know exactly whose judgment they are relying on, and that person needs to look like them.',
    ],
    proposals: [
      'A membership platform organized around shared DNA, not broad coalitions. Five to ten anchor family offices with overlapping expertise contribute and access climate due diligence across deals and subsectors. Ocean carbon economics. Geothermal project finance. Direct air capture cost curves. Mangrove restoration returns. Borrowed from open-source software: contribute what you know, use what others built, collective capability exceeds what any one participant could create alone.',
      'A CIO reputation layer where the social proof of peers they actually recognize and respect underwriting the same deal makes it safe to move. The commons is a knowledge platform and a career insurance policy at the same time.',
    ],
  },
  {
    id: 'nature-credibility-gap',
    title: 'The nature credibility gap',
    question: 'How might we give investors the same confidence in a mangrove as in a toll road?',
    body: [
      'Few question whether a toll road needs a traffic guarantee to be bankable. That is how you finance infrastructure before revenue history exists. We treat nature-based infrastructure as though it should attract capital on faith. Family offices cannot verify what they are buying. Projects are rarely where the family office is based. Measurement is hard. Permanence is uncertain. A bad bet does not just lose money. It makes you look foolish in front of your peers.',
    ],
    proposals: [
      'A guarantee fund seeded by aggregating commitments from twenty family offices. Wraps measurable performance around nature-based projects. A mangrove buffer that reduces storm surge by X percent, guaranteed. A wetland that filters Y volume of runoff, guaranteed. Actuarial modeling borrowed from property and casualty insurers, applied to ecological systems instead of buildings.',
      'In developing markets where carbon frameworks do not exist, guarantees built around diversified revenue: agroforestry yields, heat reduction, tourism, government ecosystem fees. Government first-loss on the capital stack. Performance guarantees on the asset. Private capital between the two layers, finally comfortable enough to write the check.',
      'A standardized measurement and verification protocol that lets family offices compare nature-based investments with the same confidence they compare real estate or infrastructure. The metric is not carbon sequestered. It is risk reduced, yield improved, damage avoided.',
    ],
  },
  {
    id: 'five-doors',
    title: 'Five doors, not one',
    question: 'How might we make climate investing feel familiar, even to families who would never call themselves climate investors?',
    body: [
      'Everyone building climate investment products is building one product and hoping it appeals broadly. In developing economies, the conversation starts and ends with risk exposure to existing assets. The next generation enters through conviction and identity. Philanthropists enter through catalytic capital frameworks they have never been shown. Each of these populations gets stuck at a completely different point.',
    ],
    proposals: [
      'A peer-visibility track built around social proof: curated co-investment, the diligence commons, visible anchors in every deal. A risk-mitigation track built around business logic: risk audits tied to existing holdings, investments that map to operating businesses, no mission language.',
      'An asset-protection track built around preservation: risk prediction bundled with resilience, solutions that work without carbon markets. A next-gen track built around authority: governance structures with real decision rights over a defined allocation, small enough to be low-risk for the family, large enough to build a real track record.',
      'A philanthropist track for those who do not know charitable capital can fund market-driven solutions: the due diligence commons plus deal-level transaction support. Showing them the path from grant-making to catalytic investing.',
    ],
  },
  {
    id: 'pre-competitive-coalitions',
    title: 'Pre-competitive climate coalitions',
    question: 'How might we make it possible to go big without going first?',
    body: [
      'In semiconductors, Intel and AMD fund shared research through SEMATECH. The problems are too expensive to solve alone. Climate has the same economics but has not built the equivalent institutions. The first-mover problem makes it worse: everyone waits because nobody wants to bear the full cost of going first.',
    ],
    proposals: [
      'A venture studio pooling $50 to $100 million across five to ten companies facing the same operational problem. Cotton drought exposure affects every major apparel company. Pool Nike, H&M, Inditex around shared water resilience infrastructure. Beyond the Bag (CVS, Target, Walmart on plastic) proved the model.',
      'Family offices funding the studio infrastructure, not individual deals. Catalytic capital enabling collaboration without anyone subordinating their own strategy. Singapore government approach layered on: tax incentives making participation economically rational beyond the climate thesis.',
      'Data center cooling as a proving ground: AI companies with shared thermal challenges, pre-competitive, too large for any one company to solve alone.',
    ],
  },
  {
    id: 'adaptation-economy',
    title: 'The adaptation economy',
    question: 'How might we turn avoided losses into a return an investor can see?',
    body: [
      'Adaptation is the category with the most natural demand and the least investable infrastructure. Every family office with coastal real estate, agricultural supply chains, or infrastructure in warming regions is already living the problem. They do not need a climate thesis to care. But the capital still does not flow at scale because adaptation\'s value lives in what did not happen. A premium that did not rise. A yield that did not fall. A property that held its value while the one next door lost 30 percent. The gap is not solutions. It is legibility. The opportunity is to build the measurement and packaging layer that turns avoided losses into returns an investor can actually report.',
    ],
    proposals: [
      'A measurement infrastructure that makes the counterfactual visible. Baseline risk modeling for a geography or asset, paired with real-time tracking of how adaptation investments change the trajectory. Not "we planted mangroves." Instead: "storm surge damage in this corridor dropped 40 percent relative to the modeled baseline. Here is your avoided loss, quarter by quarter."',
      'Peril-specific adaptation funds that bundle prediction with response end to end. A wildfire fund pairing detection and defensible-space startups with the insurance capacity to re-enter the geography once risk drops. A coastal fund pairing mangrove restoration with parametric insurance and property-level resilience. The return is measurable risk reduction, not carbon credits.',
      'A supply chain adaptation product where food and apparel companies invest in watershed preservation, soil health, and climate-resilient agriculture where their ingredients are sourced. The return is fewer disruptions, more stable input costs, and lower insurance premiums. The avoided losses are already being tracked by procurement teams. Someone just needs to connect the investment to the data.',
    ],
  },
  {
    id: 'redesigning-the-carry',
    title: 'Redesigning the carry',
    question: 'How might we raise the variance instead of the mean?',
    body: [
      'Volatility has never upset the financial community. It is the entire business model. Venture capital as an asset class underperforms the S&P. The best venture capitalists are not the ones who avoid failure. They are the ones who drive up the failure rate. The structure makes this rational: limited liability caps the downside, the residual claim makes the upside unlimited, and variance is asymmetric. Foolishness is the price of genius. The unicorns do not come from consensus. They come from bets where half the room thinks you are wrong.',
      'Climate investing has exactly this structure. Capped downside. Uncapped upside. Asymmetric variance. And yet the entire ecosystem has been designed to minimize risk instead of maximize variance. CIOs are evaluated on three-year windows against a thesis that needs ten. A successful climate bet does not advance a career. A failed one can end it. So every actor optimizes for not looking wrong, which guarantees the portfolio looks like yesterday. The problem is not that people are too reckless with climate capital. The problem is that they are too careful. Risk-averse strategies will always fail here. The question is not how to make it safe to say yes. It is how to make it dangerous to stay safe.',
    ],
    proposals: [
      'A dual-mandate family office structure with two separate teams and two separate scorecards. The preservation side manages the endowment on traditional metrics. The experimental side runs a climate portfolio evaluated on portfolio-level variance, learning velocity, and seven-to-ten-year vintage cycles. The experimental CIO reports to the family, not to the preservation CIO. This resolves the principal-agent problem that keeps climate allocations small.',
      'An investment committee rule borrowed from the best VC firms: do not approve a climate investment unless at least one senior decision-maker disagrees with the thesis. If the committee is unanimous, the opportunity is already consensus and contains no alpha. Track the disagreement rate as a portfolio health metric. Track what was killed and what it would have returned. Make the cost of missed opportunities as visible as the cost of failed ones.',
      'A next-generation allocation with real authority and explicit experimental KPIs: number of distinct theses tested per vintage, speed of kill decisions on underperformers, and a target failure rate that treats a portfolio with no losses as evidence of excessive conservatism, not good judgment. Small enough to be low-risk for the family. Large enough to generate the variance where asymmetric returns actually live.',
    ],
  },
];

export const pov = {
  title: 'If I had to pick one',
  paragraphs: [
    'Every opportunity surfaced in this research depends on a family office that already sees climate as relevant to their own holdings. So this is where I would start: show family offices the climate risk sitting inside what they already own, and help them act on it.',
    'A family with beachfront in Miami, vineyards in Napa, and manufacturing supply chains through Southeast Asia already has climate exposure. They did not choose it. It accumulated. Their property insurer sees it clearly, which is why coastal premiums in South Florida have tripled and some carriers have stopped writing policies in the state entirely. The insurer is running physical risk models that the family has never seen applied to their own holdings.',
    'Many families have already moved capital into climate. But the ones on the sideline are not waiting for a better fund or a sharper deck. They have seen the decks. What they have not seen is a clear picture of what warming does to the specific assets they already own.',
    'What does not exist yet is a climate risk audit built on a family\'s real asset register. You take their properties, their agricultural land, their supply chain dependencies, and run them against the physical climate scenarios that insurers and sovereign wealth funds already use internally. The output is specific: this coastal property faces this level of flood risk by this date, this vineyard loses this many viable growing days, this factory crosses the heat threshold where outdoor labor shuts down. The data and models already exist. Moody\'s acquired Four Twenty Seven to do this for institutional clients. Jupiter Intelligence does it for infrastructure. Few have packaged it specifically for family offices.',
    'The audit is only the starting point. Once a family sees that their vineyard is losing growing days, the question shifts from whether to invest in climate to whether to invest in drought-resistant rootstock for land they already own. Once they see flood exposure on coastal property, the decision becomes whether to reposition, hedge, or invest in the resilience infrastructure that protects what is already there. LVMH already thinks this way: ninety-six percent of their carbon footprint sits in raw material sourcing, so they fund regenerative agriculture as a procurement strategy. The same logic applies to any family with physical exposure they have not yet modeled.',
    'The opportunity is not another fund. It is the full chain: the diagnostic that surfaces the exposure, the preservation strategy that addresses it asset by asset, and the advisory that connects families to the right interventions, whether that is resilience infrastructure, supply chain hedging, or repositioning holdings before the repricing arrives.',
  ],
};

export const sectionHeaders: Record<string, { title: string; id: string }> = {
  'why-not-enter': { title: 'Why capital does not enter', id: 'why-not-enter' },
  'what-keeps-scaling': { title: 'What keeps capital from scaling', id: 'what-keeps-scaling' },
  'system-fails': { title: 'Why nobody is wrong and the system still fails', id: 'system-fails' },
};
