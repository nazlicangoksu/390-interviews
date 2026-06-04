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
  title: 'Field notes on family-office climate capital',
  lead: "I am a graduate student at Stanford GSB. For the past six months I have been doing independent research on a question that sounds simple: why doesn't more private wealth reach climate solutions?",
  paragraphs: [
    'I interviewed more than twenty investors, fund managers, philanthropic advisors, and family-office practitioners across five countries. I asked the questions people in this world usually keep to themselves: where their climate money actually goes, why it stalls, and what would move it.',
    'Family-office capital for climate fails in two places. Getting a family office through the door is the first. Making its money count once it is inside is the second.',
    'Both failures come from the same place: a financial system that was never built for climate assets. The timelines run longer than any fund allows, the standard vehicles do not fit, and the incentives point the wrong way. Lately, even the word climate has started to scare money off.',
    'The family offices on the sidelines have mostly heard the case and believe it. What stops them is the system around the money. This synthesis lays out eleven things I heard, eight opportunities they point to, and the one I would build first.',
  ],
};

export const pullQuotes: PullQuote[] = [
  { text: 'The first climate investment that works is driven by something personal, not by the math.', afterSection: 'intro' },
  { text: 'Some investors are so sure of their version of climate that the certainty itself keeps the money from ever pooling.', afterSection: 'why-not-enter' },
  { text: 'If everyone backed their second-favorite cause instead of their first, the money would go much further.', afterSection: 'what-keeps-scaling' },
  { text: 'Everyone is waiting for the first mover to start the chain. No one wants to be the first domino.', afterSection: 'system-fails' },
];

export const insights: Insight[] = [
  {
    id: 'insight-1',
    number: 1,
    title: 'The first climate check almost never comes from a spreadsheet.',
    subtitle: 'It comes from a grandchild’s question at dinner, and because it starts as a feeling, for some it stays small.',
    section: 'why-not-enter',
    body: [
      'Almost no family office makes its first climate investment off a spreadsheet. It starts with a grandchild’s question at dinner, or with watching a reef die and writing a check that afternoon. FOMO, legacy, identity, a personal experience: these are the on-ramps. The financial case shows up later, built to justify a decision the gut already made.',
      'That same origin caps it. When a family office is not climate-first, treating the investment as personal lets everyone keep it small. The principal calls it an indulgence; the CIO tolerates a passion project. Growing it from a five-million-dollar gesture to a fifty-million-dollar position is hard, because no one underwrote it as a serious allocation. They underwrote a feeling.',
    ],
  },
  {
    id: 'insight-2',
    number: 3,
    title: 'The family offices with the strongest vision are the hardest to pool.',
    subtitle: 'Each one wants its own version of climate, and only that.',
    section: 'why-not-enter',
    body: [
      'Mission-aligned family offices often hold a vision too specific to combine. They love clean electrons but will not touch biodiversity. They want the ocean but not agriculture. The sharpness of the vision becomes the obstacle. A diversified climate fund holds less appeal; they want their version of climate, and sometimes nothing else.',
      'That is why aggregating family-office capital is so hard. Every family office defines climate differently, so getting ten of them into one vehicle means finding the overlap among ten separate passions, and there usually is not much. No single fund can satisfy more than a few at once. The money is there. A shared definition of climate is what is missing, so the capital stays small.',
    ],
  },
  {
    id: 'insight-3',
    number: 4,
    title: 'As venture chases AI, climate’s capital stack is diversifying.',
    subtitle: 'The capital pool is broadening beyond VC, into guarantees, blended finance, and blue bonds.',
    section: 'why-not-enter',
    body: [
      'Venture capital is pivoting out of climate and into AI ([WSJ](https://www.wsj.com/articles/venture-capitalists-likely-to-continue-pivoting-away-from-climate-in-2026-bea8f315)). Investment still held around forty billion dollars in 2025, but the deal count fell and more than a quarter of every climate-equity dollar went to something AI-enabled ([Sightline Climate](https://www.sightlineclimate.com/research/40-5bn-and-8-uptick-as-power-demand-drives-25-investment)). Early-stage funding thinned from a fifth of the total in 2021 to under a tenth ([Heatmap](https://heatmap.news/climate-tech/early-stage-investing)). Venture did its job for the software-shaped corners of climate. The slower, asset-heavy parts were never a fit for a seven-year fund. Even within venture, the money pulled to the edges, seed at one end and late-stage mega-deals at the other, stranding the Series B and C companies in the middle that need project finance more than another equity round.',
      'What is easy to miss is how the rest of the money is reorganizing. A broader capital stack is taking shape, most visibly in the ocean: blended finance, sovereign blue bonds, guarantee facilities, and biodiversity credits, with public and philanthropic money taking the first loss so private capital follows. Writing about the blue economy, Prince Albert II of Monaco notes that instruments like "guarantee facilities supporting small and medium-sized enterprises" and sovereign blue bonds "are gaining traction," and that the ReOcean fund raised seventy-three million dollars this way ([Project Syndicate](https://www.project-syndicate.org/commentary/how-to-unlock-financing-necessary-to-scale-the-ocean-economy-by-prince-albert-ii-of-monaco-2025-11)). The blue economy is worth about two and a half trillion dollars a year ([TIME](https://time.com/article/2026/05/28/the-new-value-of-oceans/)). These structures fit long-horizon, real-asset businesses in a way equity rounds never did.',
      'Family offices are central to making that stack work. The catalytic, patient, risk-absorbing seats, first-loss capital, guarantees, blended structures, credit for measurable outcomes, are exactly the ones an institutional fund usually cannot fill. In 2025 Builders Vision co-guaranteed a three-hundred-million-dollar debt-for-nature conversion for The Bahamas alongside the Inter-American Development Bank, putting up seventy million dollars to lower the country’s borrowing costs and unlock about a hundred and twenty-four million dollars for marine conservation over fifteen years. It was, in the platform’s words, "the first time a family office has stepped in alongside a multilateral development bank to co-guarantee a debt conversion for nature" ([Builders Vision](https://www.buildersvision.com/news-insights/builders-vision-innovation-in-climate-and-nature-finance-to-protect-and-bolster-bahamian-environmental-and-economic-prosperity/)).',
    ],
  },
  {
    id: 'insight-4',
    number: 2,
    title: 'Climate is fifty different sectors, and very few family offices are fluent in all of them.',
    subtitle: 'What looks like indifference is usually just confusion.',
    section: 'why-not-enter',
    body: [
      'Ocean investing alone is a career specialty. Carbon removal, grid infrastructure, industrial decarbonization, sustainable agriculture, biodiversity, building efficiency: each has its own science, its own market dynamics, its own regulators. Almost no family office can build fluency across all of it, and they know it.',
      'No report or conference fixes that. Even a strong climate team struggles to get comfortable enough across sectors this different to write the check. The way you underwrite software or real estate does not carry over to ocean carbon or industrial decarbonization, and no one has a proven way to value those yet.',
      'Trust does spread between family offices, but along narrow lines. An infrastructure family office follows another infrastructure family office into climate. A science-trained principal follows someone with the same technical fluency. They want to know exactly whose judgment they are leaning on, and that person needs to look like them. This is why broad platforms and anonymous diligence-sharing meet resistance. What finally moves a family office is seeing someone it recognizes on the other side of the same bet.',
    ],
  },
  {
    id: 'insight-5',
    number: 5,
    title: 'Investment in biodiversity is rising.',
    subtitle: 'Urgent, needed, proven, and apolitical: the rare climate bet almost no one argues with.',
    section: 'why-not-enter',
    body: [
      'Biodiversity is one of the few climate stories almost no one argues with. Almost no one is against whales. It carries real emotional weight, it is genuinely urgent, and it sidesteps the political landmines that trip up the rest of climate. For a family office, it is one of the safest on-ramps there is, and the money is starting to move.',
      'The one thing still lagging is perception. Nature has long been filed under philanthropy. Mangrove restoration, forest preservation, wetland recovery read as causes, and a check written into nature can still look like a donation. That optics gap, more than the economics, is what keeps some capital cautious.',
      'The proof, though, is already here. The best operators bake the impact straight into the revenue: waste-management companies that earn carbon credits as a byproduct, shrimp aquaculture that restores mangroves while producing twenty times more output per hectare. When the impact is the business result, no separate impact thesis is needed, and the capital follows. As more of these models work, biodiversity reads less like a donation and more like the investment it already is.',
    ],
  },
  {
    id: 'insight-6',
    number: 6,
    title: 'The CIO can unlock climate capital, but bears the risk alone.',
    subtitle: 'A winning climate bet can help a CIO’s career. A losing one can end it.',
    section: 'what-keeps-scaling',
    body: [
      'Family offices can take risks institutional capital cannot. They carry none of the governance weight of a pension fund, and while the founder is alive they are often more entrepreneurial than any other source of capital. They can run experiments and build the track records that more conservative owners will later follow.',
      'The opportunity sits with the CIO, the person between the principal and the portfolio. Today most CIOs are judged on three-year windows against a thesis that needs seven to ten. The asymmetry runs deeper than the timeline: a winning climate bet can help a career, while a losing one can end it. So a CIO in that seat optimizes to avoid looking wrong, and returns come second.',
      'The family offices where climate capital actually flows have solved this in the structure. Some wrote risk-taking into the CIO mandate. Others split the office in two: one side for wealth preservation, the other for climate, with its own team and its own authority. The contagion between family offices follows people more than funds: one office trails another with similar DNA and a proven hand. The fix is structural, a mandate where a climate bet no longer puts a career on the line.',
    ],
  },
  {
    id: 'insight-7',
    number: 7,
    title: 'Climate assets keep getting judged on the wrong clock.',
    subtitle: 'Pulling a tree out of the ground to check whether the roots are growing.',
    section: 'what-keeps-scaling',
    body: [
      'Closed-end funds with three-to-seven-year horizons are a poor match for climate. Forests have no exit timeline. Grid-scale deployment does not mature in five years. Judging a twenty-year asset on a three-year mark is like pulling a tree out of the ground to check whether the roots are growing.',
      'The mismatch runs deeper than duration. The carry structure decides who shows up to manage climate capital in the first place. Funds built on AUM growth and management fees reward managers for gathering assets. Climate needs managers whose economics ride on outcomes, paid when the asset performs over a decade. First-time funds keep landing in the top performance deciles precisely because those managers are betting on carry. Yet allocators retreat from first-time funds exactly when markets tighten, which is exactly when climate needs them most.',
      'The container is broken. The asset inside it is fine.',
    ],
  },
  {
    id: 'insight-8',
    number: 8,
    title: 'Every pitch sells climate as an opportunity. The bigger hook is the risk a family office already owns.',
    subtitle: 'The most underexplored move in climate investing might be an audit.',
    section: 'what-keeps-scaling',
    body: [
      'The conversation is almost always framed as investment: here is a fund, here is a return, here is an impact thesis. Meanwhile a wealthy family office already holds climate exposure no one has shown it. Coastal real estate, supply-chain dependencies, agricultural holdings, infrastructure. The risk is already in the portfolio. The family office did not put it there as a climate bet; it arrived as weather, as an insurer walking away, as a shifting growing season, as a ski resort with no snow.',
      'The corporations that depend on natural systems already understand this. LVMH funds regenerative agriculture and biodiversity protection ([LVMH](https://www.lvmh.com/en/commitment-in-action/for-the-environment)) because ninety-six percent of its carbon footprint sits in its supply chain, in the grapes, cotton, leather, and jasmine its houses run on. Chanel put twenty-five million dollars into a fund for climate adaptation across the farming and forestry supply chains its raw materials depend on ([The Fashion Law](https://www.thefashionlaw.com/in-its-latest-sustainability-centric-venture-chanel-invests-25-million-in-new-climate-fund/)). They are protecting the inputs their businesses cannot run without.',
      'Most family offices with the same kind of exposure have not made the connection, because no one has drawn the map for them. A family office with farmland, coastal or heat-exposed real estate, or portfolio companies riding on physical supply chains carries the same risk. The opportunity is simple: show that family office what a two-degree world does to the assets it already holds, building by building, acre by acre.',
    ],
  },
  {
    id: 'insight-9',
    number: 10,
    title: 'The people protecting the most nature get almost none of the funding.',
    subtitle: 'Indigenous communities receive under one percent of climate finance, locked out by the way the big funds are built.',
    section: 'system-fails',
    body: [
      'Indigenous communities steward much of the world’s remaining biodiversity and forests, and they sit on the front line of climate damage. Yet between 2011 and 2020 they received less than one percent of global climate finance ([Grist](https://grist.org/indigenous/indigenous-peoples-bear-the-brunt-of-climate-change-and-get-almost-none-of-the-money-to-fight-it/)). The people doing some of the most effective conservation on earth are nearly absent from the money meant to pay for it.',
      'The reason is structural. The Green Climate Fund runs a twenty-billion-dollar portfolio, and not one Indigenous organization has been accredited to draw from it. The Global Environment Facility has moved twenty-seven billion dollars over three decades and routed about fifty million of it to Indigenous and local communities ([Grist](https://grist.org/indigenous/indigenous-peoples-bear-the-brunt-of-climate-change-and-get-almost-none-of-the-money-to-fight-it/)). Accreditation can take years, minimum grants run to ten million dollars, and the money moves through government and intermediary channels never designed to reach a community directly. Indigenous access to these funds, as one advisory-committee member told Grist, is "near to nil."',
      'This is the gap flexible private capital can close. Where an institutional fund needs years of accreditation and a ten-million-dollar minimum, a family office can back an Indigenous-led trust directly, on terms that fit the community instead of the bureaucracy.',
      'There is a deeper shift underneath the mechanics. At his Arizona State commencement, Harrison Ford reminded graduates that "humanity is a part of nature, not above it," and that Indigenous communities have long understood the trees, the water, and the soil are "not commodities, they are relatives to be cherished" ([The Hill](https://thehill.com/blogs/in-the-know/5876514-harrison-ford-asu-commencement-speech/)). Part of investing well here is unlearning the reflex that nature is a resource to draw down, and relearning it as kinship. The capital that endures will behave less like an owner and more like a relative, which is the patient, generational stance a family office is built to take.',
    ],
  },
  {
    id: 'insight-10',
    number: 9,
    title: 'Adaptation sells itself to a family office, until you try to prove it worked.',
    subtitle: 'It slips past every barrier in this research, except the loss it quietly prevents.',
    section: 'what-keeps-scaling',
    body: [
      'Mitigation asks an investor to help solve a shared global problem. Adaptation asks a family office to protect what it already owns. Those are very different requests. Insurers are pulling out of California, Florida, and coastal Southeast Asia. Supply chains are breaking. Infrastructure is degrading. The family offices exposed to this do not need a climate thesis. They are already living it.',
      'Adaptation slips past the barriers in this research. No political resistance, no mission test, no twenty-year thesis to defend. It speaks the language a family office already uses: risk, preservation, protection. Infrastructure family offices in Southeast Asia feel it directly in their operating businesses.',
      'It carries one problem the other categories do not. Its return is a negative: damage that did not happen. Not a single dramatic rescue. A thousand small losses, quietly avoided. A premium that rose eight percent instead of twenty. A yield that fell five percent instead of thirty. A supply chain that held while the one next door broke. Try putting that on a slide. A VC needs a number within five years, and adaptation pays off in a counterfactual, usually visible only after a disaster next door makes it real. The family office that funded mangrove restoration cannot point to the moment it paid off. It can only point to the neighbor who did not.',
      'The models that work bundle prediction with response: risk assessment paired with mitigation, insurance paired with prevention. In developing economies the bundling is harder, because carbon-credit revenue fractures where carbon markets do not exist. There the adaptation product needs different foundations: agroforestry, heat reduction, government ecosystem fees. The logic holds everywhere, though. Show someone what they stand to lose, and package the fix with the diagnosis.',
    ],
  },
  {
    id: 'insight-11',
    number: 11,
    title: 'Nobody in this system is making a mistake. That is the problem.',
    subtitle: 'Every actor behaves rationally. The sum of them does not.',
    section: 'system-fails',
    body: [
      'Look closely, and nobody here is behaving badly. The CIO who steers around climate is protecting a career. Keeping a new allocation small is how a cautious family office manages risk. A seven-year fund is what LPs ask their managers to build. And in a developing economy, a family office that puts survival ahead of sustainability is doing the math. Each of those choices is rational on its own terms.',
      'Put them together, though, and the logic breaks. There is plenty of capital and real intent, yet only a fraction of it ever gets deployed. Nobody made a mistake. The system was simply never built to connect these actors to one another, or to the opportunities that need them.',
      'What is missing sits in the connections between these actors: the tissue that would let a CIO borrow conviction instead of standing up a team, let small checks pool into deployments large enough to matter, and let independent players move together without surrendering what keeps them independent, all carried by vehicles whose timelines finally fit the assets inside them. Unglamorous as it is, that is where the real work lies.',
    ],
  },
];

export const designIntro =
  'These eleven barriers point to eight opportunities to change how a family office moves capital from intent to impact.';

export const designOpportunities: DesignOpportunity[] = [
  {
    id: 'climate-risk-wealth-preservation',
    title: 'Climate risk as wealth preservation',
    question: 'How might we help a family office see the climate risk it already owns?',
    body: [
      'The most underexplored move in climate investing might be an audit. A family office with two hundred million dollars in coastal real estate, supply-chain exposure, and infrastructure is sitting on climate risk no one has shown it. Insurers already build sophisticated models to underwrite their own books. Point that same capability at the family office’s portfolio and the conversation shifts from opportunity to necessity, which is the language a family office actually responds to.',
    ],
    proposals: [
      'A climate-risk audit that maps a family office’s actual holdings against 1.5 to 3 degree warming scenarios, down to specifics: how much value a coastal property loses, what a supply chain costs under drought, how many productive days a stretch of farmland loses per decade.',
      'An output that reads like a preservation plan, with five exposures and three interventions. Some are investments, some are insurance, some are operational.',
      'A vehicle where the family office invests in solutions that hedge its own exposed assets: coastal restoration that softens storm surge where it owns beachfront, water infrastructure that secures the agricultural regions its portfolio depends on.',
    ],
  },
  {
    id: 'bundling-problem-solution',
    title: 'Bundling the problem and the solution',
    question: 'How might we connect the people bearing climate risk with the people building climate solutions?',
    body: [
      'Bolt Tech in Florida sells flood insurance bundled with water-leak sensors: preventable risks managed, catastrophic ones reinsured. The lesson is simple. Prediction alone moves anxiety. Prediction paired with response moves capital. Right now the municipality worried about flooding never meets the family office that might fund mangrove restoration. The problem owner and the solution funder live in different worlds.',
    ],
    proposals: [
      'A coastal-resilience product where a family office with beachfront exposure invests in mangrove and wetland restoration in the same geography. The nature protects its assets; returns come from ecosystem-service payments, carbon credits, and lower premiums. They are building a seawall out of mangroves, and earning on it.',
      'An agricultural supply-chain product where food companies invest in watershed preservation where their ingredients are grown. Their own supply risk drops, and returns come from better yields and lower input costs.',
      'An urban-heat product where real-estate owners in hot cities invest in tree canopy and green infrastructure near their own buildings. Measurable cooling, quantifiable property-value uplift, avoided energy costs.',
    ],
  },
  {
    id: 'due-diligence-commons',
    title: 'The due diligence commons',
    question: 'How might we help family offices trust each other’s climate judgment?',
    body: [
      'Climate is fifty different sectors. Ocean investing alone is a career. Not all family offices will build in-house expertise across all of it, and the complexity reads as indifference when it is really confusion. Trust between family offices is real, and it travels along narrow lines. An infrastructure family office follows another into climate. A science-trained principal follows someone with the same fluency. They want to know exactly whose judgment they are leaning on, and that person needs to look like them.',
    ],
    proposals: [
      'A membership platform organized around shared DNA rather than a broad coalition. Five to ten anchor family offices with overlapping expertise contribute and draw on climate diligence across deals and subsectors: ocean-carbon economics, geothermal project finance, direct-air-capture cost curves, mangrove restoration returns. The model is borrowed from open-source software. Contribute what you know, use what others built, and the collective capability beats anything one office could build alone.',
      'A CIO reputation layer, where peers a CIO actually recognizes and respects underwriting the same deal makes it safe to move. The commons works as a knowledge platform and a career-insurance policy at once.',
    ],
  },
  {
    id: 'nature-credibility-gap',
    title: 'The nature credibility gap',
    question: 'How might we give a family office the same confidence in a mangrove as in a toll road?',
    body: [
      'Few people question whether a toll road needs a traffic guarantee to be bankable. That is simply how infrastructure gets financed before a revenue history exists. Nature-based infrastructure gets held to a different standard, asked to attract capital on faith. A family office cannot easily verify what it is buying. Projects sit far from where the office is based. Measurement is hard. Permanence is uncertain. A bad bet does more than lose money. It makes you look foolish in front of your peers.',
    ],
    proposals: [
      'A guarantee fund seeded by aggregating commitments from twenty family offices, wrapping measurable performance around nature-based projects. A mangrove buffer that cuts storm surge by a set percentage, guaranteed. A wetland that filters a set volume of runoff, guaranteed. The actuarial modeling comes straight from property-and-casualty insurers, pointed at ecological systems instead of buildings.',
      'In developing markets without carbon frameworks, guarantees built on diversified revenue: agroforestry yields, heat reduction, tourism, government ecosystem fees. Government takes first loss on the capital stack, performance guarantees sit on the asset, and private capital sits between the two layers, finally comfortable enough to write the check.',
      'A standardized measurement-and-verification protocol so a family office can compare nature-based investments with the same confidence it compares real estate. The metric is risk reduced, yield improved, damage avoided.',
    ],
  },
  {
    id: 'five-doors',
    title: 'Five doors, not one',
    question: 'How might we make climate investing feel familiar, even to a family office that would never call itself a climate investor?',
    body: [
      'Everyone building climate-investment products builds one product and hopes it appeals broadly. In developing economies the conversation starts and ends with risk to existing assets. The next generation enters through conviction and identity. Philanthropists enter through catalytic-capital frameworks no one has shown them. Each of these groups gets stuck at a different point.',
    ],
    proposals: [
      'A peer-visibility track built on social proof: curated co-investment, the diligence commons, a visible anchor in every deal. A risk-mitigation track built on business logic: risk audits tied to existing holdings, investments that map to operating businesses, no mission language at all.',
      'An asset-protection track built on preservation: risk prediction paired with resilience, solutions that work without carbon markets. A next-gen track built on authority: real decision rights over a defined allocation, small enough to be low-risk for the family office, large enough to build a real track record.',
      'A philanthropist track for those who do not yet know charitable capital can fund market solutions: the diligence commons plus deal-level transaction support, walking them from grant-making toward catalytic investing.',
    ],
  },
  {
    id: 'pre-competitive-coalitions',
    title: 'Pre-competitive climate coalitions',
    question: 'How might we make it possible to go big without going first?',
    body: [
      'In semiconductors, Intel and AMD funded shared research through SEMATECH because the problems were too expensive to solve alone. Climate has the same economics and has not built the equivalent institutions. The first-mover problem makes it worse: everyone waits, because no one wants to carry the full cost of going first.',
    ],
    proposals: [
      'A venture studio pooling fifty to a hundred million dollars across five to ten companies facing the same operational problem. Cotton drought exposure hits every major apparel company; pool Nike, H&M, and Inditex around shared water-resilience infrastructure. Beyond the Bag, with CVS, Target, and Walmart on plastic, already proved the model.',
      'Family offices funding the studio infrastructure rather than individual deals. Catalytic capital that enables collaboration without anyone subordinating their own strategy, with the Singapore approach layered on top: tax incentives that make participation rational beyond the climate thesis itself.',
      'Data-center cooling as a proving ground: AI companies with shared thermal challenges, pre-competitive, too large for any one company to solve alone.',
      'A pooled vehicle that sends family-office capital straight to Indigenous-led conservation trusts, with the guarantees and first-loss layers shared across offices. The big climate funds are built in a way that locks these stewards out; a coalition can route around them and back the people protecting the most nature directly, going big without anyone having to go first.',
    ],
  },
  {
    id: 'adaptation-economy',
    title: 'The adaptation economy',
    question: 'How might we turn avoided losses into a return an investor can see?',
    body: [
      'Adaptation has the most natural demand and the least investable infrastructure. Every family office with coastal real estate, agricultural supply chains, or assets in warming regions is already living the problem and does not need a thesis to care. The capital still does not flow, because adaptation’s value lives in what did not happen: a premium that did not rise, a yield that did not fall, a property that held while the one next door lost thirty percent. The missing piece is legibility. Build the measurement-and-packaging layer that turns avoided losses into a return an investor can actually report.',
    ],
    proposals: [
      'Measurement infrastructure that makes the counterfactual visible. Baseline risk modeling for a geography or asset, paired with real-time tracking of how the adaptation investment changes the trajectory. Less "we planted mangroves," more "storm-surge damage in this corridor dropped forty percent against the modeled baseline, and here is your avoided loss, quarter by quarter."',
      'Peril-specific adaptation funds that bundle prediction with response end to end. A wildfire fund pairing detection and defensible-space startups with the insurance capacity to re-enter a geography once risk drops. A coastal fund pairing mangrove restoration with parametric insurance and property-level resilience. The return is measurable risk reduction.',
      'A supply-chain adaptation product where food and apparel companies invest in watershed preservation, soil health, and climate-resilient agriculture where their ingredients are grown. The return is fewer disruptions, steadier input costs, lower premiums. Procurement teams are already tracking the avoided losses. Someone just has to connect the investment to the data.',
    ],
  },
  {
    id: 'redesigning-the-carry',
    title: 'Redesigning the carry',
    question: 'How might we raise the variance instead of the mean?',
    body: [
      'Volatility has never bothered the financial industry. It is the entire business model. Venture capital as an asset class underperforms the S&P. The best venture capitalists deliberately drive the failure rate up. The structure makes that rational: limited liability caps the downside, the residual claim leaves the upside open, and the variance is asymmetric. Foolishness is the price of genius. Unicorns come from the bets where half the room thinks you are wrong.',
      'Climate investing has exactly this structure. Capped downside, uncapped upside, asymmetric variance. And the whole ecosystem has been built to minimize risk when it should be maximizing variance. CIOs are judged on three-year windows against a thesis that needs ten. A winning climate bet can help a career; a losing one can end it. So everyone optimizes to avoid looking wrong, and the portfolio ends up looking like last year’s, undone by caution. Risk-averse strategies will always fail here. The real design question is how to make staying safe the dangerous choice.',
    ],
    proposals: [
      'A dual-mandate family office with two teams and two scorecards. The preservation side runs the endowment on traditional metrics. The experimental side runs a climate portfolio judged on portfolio-level variance, learning velocity, and seven-to-ten-year vintages. The experimental CIO reports to the family office, not to the preservation CIO, which resolves the principal-agent problem that keeps climate allocations small.',
      'An investment-committee rule borrowed from the best VC firms: approve no climate investment unless at least one senior decision-maker disagrees with the thesis. A unanimous committee means the opportunity is already consensus and holds no alpha. Track the disagreement rate as a health metric, and track what was killed and what it would have returned, so the cost of a missed opportunity is as visible as the cost of a failed one.',
      'A next-generation allocation with real authority and explicit experimental KPIs: distinct theses tested per vintage, speed of kill decisions on the losers, and a target failure rate that treats a portfolio with no losses as a sign of excess caution rather than good judgment. Small enough to be low-risk for the family office, large enough to generate the variance where asymmetric returns actually live.',
    ],
  },
];

export const pov = {
  title: 'If I had to pick one',
  paragraphs: [
    'Every opportunity in this research depends on a family office that already sees climate as relevant to its own holdings. So that is where I would start: show a family office the climate risk sitting inside what it already owns, and help it act on what it sees.',
    'A family office with beachfront in Miami, vineyards in Napa, and supply chains through Southeast Asia already carries climate exposure it never chose. Its own insurer can see it, which is why South Florida premiums have tripled and some carriers have left the state, yet no one has turned those same physical-risk models on the family office’s own holdings.',
    'That is the gap: a climate-risk audit built on a family office’s real asset register, run against the physical scenarios insurers and sovereign funds already use, not only heat and flood but drought, water stress, and the loss of the ecosystems its holdings quietly depend on. The output is specific, this coastal property’s flood risk by this date, this vineyard’s lost growing days, this watershed running short, the fishery thinning as the water warms. The data and models exist; Moody’s bought Four Twenty Seven and Jupiter Intelligence already sells this to institutions. Almost no one has packaged it for family offices.',
    'Once a family office sees its vineyard losing days, its watershed thinning, or its coast exposed, the question shifts from whether to invest in climate to what to do about what it already owns: drought-resistant rootstock, water security, the habitats its supply chains rely on, repositioning before the repricing. The opportunity is the whole chain: surface the exposure, plan the response asset by asset, and connect the family office to the fix.',
  ],
};

export const sectionHeaders: Record<string, { title: string; id: string }> = {
  'why-not-enter': { title: 'Why the capital never enters', id: 'why-not-enter' },
  'what-keeps-scaling': { title: 'What keeps it from scaling', id: 'what-keeps-scaling' },
  'system-fails': { title: 'Nobody is wrong, and the system still fails', id: 'system-fails' },
};
