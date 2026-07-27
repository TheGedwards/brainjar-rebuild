/**
 * Location landing pages. One registry drives /locations, the six
 * /locations/[city] pages, their SEO, their schema, and the footer links.
 *
 * These are NOT doorway pages. Each city has its own audience, argument, service
 * emphasis, and FAQ — no find-and-replace. We never imply Brainjar physically
 * operates from a city other than Gresham: the only real address/phone is the
 * Gresham HQ (in the sitewide LocalBusiness schema); location pages emit a
 * `Service` with `areaServed` set to the city, which is honest.
 *
 * Pure data (no server imports) so lib/pages.ts — read by the admin client — can
 * import it. `argument`/`audience`/`faq` defaults feed editable content slots.
 */

export type LocationFaq = { q: string; a: string };

export type Location = {
  slug: string;
  city: string;
  /** Short label for nav/footer, e.g. "Fairview & Wood Village". */
  label: string;
  title: string; // SEO <title>
  description: string; // SEO meta description
  eyebrow: string;
  /** Hero heading — supports *accent* and \n for a line break (renderHeading). */
  heading: string;
  lede: string;
  /** Opening local argument — paragraphs. */
  argument: string[];
  audienceHeading: string;
  audience: string[];
  proofHeading: string;
  proof: string;
  faq: LocationFaq[];
};

export const LOCATIONS: Location[] = [
  {
    slug: "gresham",
    city: "Gresham",
    label: "Gresham",
    title: "Gresham Digital Marketing Agency | SEO & Web Design — Brainjar Media",
    description:
      "Brainjar Media is a Gresham digital marketing agency on Main Avenue, building SEO, websites, content and ad campaigns for East County businesses since 2003.",
    eyebrow: "Gresham, Oregon · Est. 2003",
    heading: "Gresham's Own\n*Digital Marketing* Agency",
    lede:
      "We're not a Portland firm with a Gresham landing page. Our office is on Main Avenue, and we've been compounding digital remedies for East County businesses for more than twenty years.",
    argument: [
      "Brainjar Media has worked from downtown Gresham since 2003 — long enough to watch Main Avenue change and a whole generation of local businesses grow up online. When you hire us, you're hiring neighbors who understand this market, not an account manager three states away.",
      "That local footing matters more than ever. Google rewards businesses that are genuinely relevant to the people searching nearby, and we've spent two decades learning exactly what Gresham and East County customers look for — and how to put our clients in front of them.",
      "We've done that work for household names — Intel, Microsoft, NASCAR, Pendleton Woolen Mills — and for the pub down the street. Both got the same attention. Neither got a template.",
    ],
    audienceHeading: "Who We Help in Gresham",
    audience: [
      "Local retailers, restaurants, and shops competing for foot traffic and “near me” searches",
      "Home-services and trades businesses — contractors, HVAC, plumbing, landscaping",
      "Professional practices — legal, dental, medical, financial",
      "Nonprofits and community organizations across East Multnomah County",
      "Established businesses ready to replace an aging website",
    ],
    proofHeading: "Two Decades of Proof",
    proof:
      "Every jar in our medicine cabinet is a real result for a real client. Browse the portfolio to see the websites, search rankings, and campaigns we've built — then tell us what you're trying to grow.",
    faq: [
      {
        q: "Where is Brainjar Media located?",
        a: "We're in downtown Gresham at 109 N Main Ave #202, Gresham, OR 97030. You can reach us at (503) 929-7436 — and yes, you can actually come in and talk to us.",
      },
      {
        q: "Do you only work with Gresham businesses?",
        a: "No — we work throughout the Portland metro and East County, and with clients well beyond Oregon. But Gresham is home, and local businesses get the advantage of an agency that knows the market first-hand.",
      },
      {
        q: "How long have you been in Gresham?",
        a: "Since 2003. That's twenty-plus years compounding digital marketing from the same downtown corner — through every major change in how search and the web work.",
      },
      {
        q: "What does digital marketing cost for a Gresham business?",
        a: "It depends on your goals, but we scope work to fit a wide range of budgets and we're candid when something won't pencil out. The initial consultation and diagnosis is free.",
      },
    ],
  },
  {
    slug: "troutdale",
    city: "Troutdale",
    label: "Troutdale",
    title: "Troutdale Digital Marketing & SEO | Brainjar Media",
    description:
      "Digital marketing for Troutdale businesses — SEO, websites and advertising built for Gorge-gateway tourism, restaurants, retail and home services. Based next door in Gresham.",
    eyebrow: "Serving Troutdale, Oregon",
    heading: "Digital Marketing for\n*Troutdale* Businesses",
    lede:
      "The gateway to the Columbia Gorge sees a river of visitors every year. We help Troutdale businesses turn that traffic — and the searches that come with it — into customers.",
    argument: [
      "Troutdale is where the Gorge begins, and that gives local businesses an advantage most towns would envy: a steady stream of travelers, day-trippers, and weekend visitors actively searching for somewhere to eat, stay, shop, and explore. The only question is whether they find you or the business one exit down.",
      "We build the search visibility and the website that capture that intent — so when someone types “restaurants near Troutdale” or “things to do in the Columbia Gorge,” you're the answer. And because we're right next door in Gresham, we understand this stretch of East County first-hand, not from a distance.",
      "For Troutdale's year-round businesses — the contractors, shops, and service providers who don't rely on tourists — we do exactly what the big Portland firms do, without the big-Portland-firm invoice.",
    ],
    audienceHeading: "Built for Troutdale's Economy",
    audience: [
      "Restaurants, cafés, breweries, and hospitality serving Gorge visitors",
      "Hotels, lodging, and tourism-driven retail",
      "Outdoor, recreation, and Gorge-adjacent experiences",
      "Contractors and home-services businesses",
      "Local retail and professional firms competing with Portland agencies",
    ],
    proofHeading: "See the Work",
    proof:
      "We'd rather show you than tell you. Our portfolio is full of real websites and campaigns for businesses like yours — take a look, then let's talk about what a Gorge-gateway business could do with the same approach.",
    faq: [
      {
        q: "Do you work with tourism and hospitality businesses?",
        a: "Yes — it's one of Troutdale's biggest opportunities. We build for the seasonal search patterns and “near me” intent that drive visitors to restaurants, lodging, and experiences at the mouth of the Gorge.",
      },
      {
        q: "Can you help us show up for Columbia Gorge searches?",
        a: "That's exactly what local SEO is for. We optimize your site and Google presence around the terms visitors and locals actually use, so you surface when someone's deciding where to go.",
      },
      {
        q: "Is Brainjar based in Troutdale?",
        a: "We're based in neighboring Gresham — close enough to know Troutdale well, near enough to meet in person. We serve Troutdale businesses without pretending to have a storefront on the Columbia River Highway.",
      },
      {
        q: "How is this different from hiring a Portland agency?",
        a: "Lower overhead, closer to home, and two decades of experience you can actually reach. You get big-agency strategy without paying for a downtown address you'll never visit.",
      },
    ],
  },
  {
    slug: "portland",
    city: "Portland",
    label: "Portland",
    title: "Portland Digital Marketing Agency (Based in Gresham) | Brainjar Media",
    description:
      "A Portland-metro digital marketing agency based in Gresham. SEO, web design, content and paid ads for East and Southeast Portland businesses — big-agency strategy without the overhead.",
    eyebrow: "Serving the Portland Metro",
    heading: "A Portland Digital Marketing Agency\n*Based in Gresham*",
    lede:
      "We won't pretend we have a downtown high-rise. We have something more useful: two decades of results and the leaner overhead of an East-metro agency — passed on to you.",
    argument: [
      "Plenty of Portland agencies will sell you a downtown address and bill you for it. Brainjar takes a different position: we're a Portland-metro agency headquartered in Gresham, serving businesses across the east and southeast side and throughout the region — with the strategy of a big firm and the overhead of one that isn't paying Pearl District rent.",
      "“Portland digital marketing” is a crowded, competitive search, and we'll be straight with you: ranking for it takes longer than ranking in the suburbs. But the fundamentals are the same ones we've used since 2003 — and we've competed for national brands like Intel and NASCAR, so a metro market doesn't intimidate us.",
      "If your customers are in Portland, we'll help you reach them — honestly, and without charging you for a skyline view you don't need.",
    ],
    audienceHeading: "Who We Serve Across Portland",
    audience: [
      "East and Southeast Portland businesses and neighborhood commerce",
      "Metro-area service businesses and trades",
      "Professional practices and B2B firms",
      "Retailers and restaurants competing in a saturated market",
      "Established companies that have outgrown a do-it-yourself website",
    ],
    proofHeading: "Proof Over Promises",
    proof:
      "Anyone can claim results in a competitive market. We'd rather show you ours — browse the portfolio for the real websites, rankings, and campaigns behind the claim, then judge us on the work.",
    faq: [
      {
        q: "Do you have a Portland office?",
        a: "No — we're based in Gresham and serve the whole metro from there. We'll happily meet you in Portland or on a call; we just don't pass along the cost of a downtown lease you'd be helping to pay for.",
      },
      {
        q: "Why hire a Gresham agency for a Portland business?",
        a: "Same strategy, lower overhead. You get two decades of experience — including national brands — without the premium that comes with a downtown address, and a team that's part of the same metro you're in.",
      },
      {
        q: "How long will it take to rank for Portland searches?",
        a: "Longer than a suburb, honestly. Portland is competitive, so organic gains build over months rather than weeks. We'll set realistic expectations up front and often pair SEO with paid ads so you're getting traffic while the rankings mature.",
      },
      {
        q: "Do you focus on any part of Portland in particular?",
        a: "We have a natural strength on the east and southeast side, given where we're based — but we serve businesses across the entire metro.",
      },
    ],
  },
  {
    slug: "happy-valley",
    city: "Happy Valley",
    label: "Happy Valley",
    title: "Happy Valley Digital Marketing & SEO Agency | Brainjar Media",
    description:
      "Digital marketing for Happy Valley's growing businesses — SEO, premium web design and advertising for medical, dental, real estate, home services and professional practices.",
    eyebrow: "Serving Happy Valley, Oregon",
    heading: "Digital Marketing for\n*Happy Valley's* Growth",
    lede:
      "One of Oregon's fastest-growing communities deserves marketing that looks the part. We help Happy Valley businesses present like the premium brands they are — and get found by the neighbors looking for them.",
    argument: [
      "Happy Valley has grown from a quiet hilltop into one of the region's most affluent, fastest-expanding communities — and the businesses serving it are competing for discerning customers with high expectations for how a company presents itself online.",
      "That raises the bar. A dated website or a thin Google presence doesn't just cost you rankings here; it costs you credibility with an audience that notices. We build the polished, fast websites and the local search visibility that make a growing Happy Valley business look as established and trustworthy as it is.",
      "There are agencies that already brand themselves around Happy Valley, so we don't expect to win on the city name alone. We'd rather win on proof — two decades of it. Take a look at what we've built, and judge us on the work.",
    ],
    audienceHeading: "Who We Help in Happy Valley",
    audience: [
      "Medical, dental, and specialty healthcare practices",
      "Real estate agents, teams, and brokerages",
      "Home services, construction, and remodeling",
      "Professional services — legal, financial, consulting",
      "Premium consumer and lifestyle businesses",
    ],
    proofHeading: "Judge Us on the Work",
    proof:
      "In a competitive, image-conscious market, proof beats a sales pitch. Our portfolio shows the caliber of websites and results we deliver — see it for yourself, then tell us what you're trying to grow.",
    faq: [
      {
        q: "Do you work with medical and dental practices?",
        a: "Yes — healthcare practices are a natural fit for local SEO and a professional, trust-building website. We help patients in Happy Valley and the surrounding area find you and choose you.",
      },
      {
        q: "Can you make our brand look more premium?",
        a: "That's a core strength. Design and content that signal quality matter enormously to a Happy Valley audience, and we build sites that make a growing business look every bit as credible as the established players.",
      },
      {
        q: "We already have a website — do we really need a new one?",
        a: "Not always. We'll give you an honest assessment: sometimes the smart move is optimizing and modernizing what you have; sometimes an aging site is quietly costing you customers and a rebuild pays for itself. We'll tell you which.",
      },
      {
        q: "How do you compete with agencies based in Happy Valley?",
        a: "With results, not a mailing address. We've delivered for everyone from local shops to national brands since 2003, and we'd rather earn your business on proof than on a claim of being local.",
      },
    ],
  },
  {
    slug: "sandy",
    city: "Sandy",
    label: "Sandy",
    title: "Sandy, Oregon Digital Marketing & SEO | Brainjar Media",
    description:
      "Digital marketing for Sandy, Oregon businesses — SEO, websites and advertising for contractors, tourism, retail and trades. Big-agency strategy without hiring a Portland firm.",
    eyebrow: "Serving Sandy, Oregon",
    heading: "Sandy Businesses,\n*Big-League* Marketing",
    lede:
      "You shouldn't have to drive to Portland — or pay Portland rates — to get marketing that actually works. We bring two decades of big-agency strategy to Sandy's Main Street.",
    argument: [
      "Sandy sits at the gateway to Mt. Hood, with an economy built on trades, tourism, retail, and independent local businesses — the kind of companies that grew on referrals and word of mouth, and have started to notice that isn't enough anymore.",
      "When referrals plateau, your next customers are the ones searching online — and they go to whoever shows up first and looks most credible. We make that you. It's the same search, web, and advertising strategy we've run for national brands, sized and priced for a Sandy business.",
      "The alternative is hiring a Portland agency that treats you as a small account. We're closer, we're more affordable, and we've been doing this from East County since 2003.",
    ],
    audienceHeading: "Built for Sandy's Economy",
    audience: [
      "Contractors, trades, and home-services businesses",
      "Mt. Hood tourism, recreation, and hospitality",
      "Main Street retail and restaurants",
      "Professional and personal-service providers",
      "Independent local businesses ready to grow past referrals",
    ],
    proofHeading: "See What We've Built",
    proof:
      "Big-agency strategy isn't a slogan — it's a track record. Our portfolio shows the websites and campaigns behind it. Take a look, then let's talk about what it could do for a business at the foot of the mountain.",
    faq: [
      {
        q: "Is Brainjar close to Sandy?",
        a: "We're in Gresham, a straight shot down Highway 26 — close enough to serve Sandy and the Mt. Hood corridor as neighbors, not as a distant vendor.",
      },
      {
        q: "We get most of our business from referrals — why do we need this?",
        a: "Referrals are great until they plateau, and they don't reach the newcomers and visitors searching online for what you offer. A strong search presence keeps the pipeline full when word of mouth alone can't.",
      },
      {
        q: "Do you work with contractors and trades?",
        a: "Absolutely — it's some of our favorite work. Trades and home-services businesses win big from local SEO and a site that turns searches into booked jobs.",
      },
      {
        q: "Can you help us capture Mt. Hood tourism traffic?",
        a: "Yes. We optimize for the seasonal, intent-driven searches visitors make on their way to and from the mountain, so Sandy businesses catch that traffic instead of watching it drive past.",
      },
    ],
  },
  {
    slug: "fairview-wood-village",
    city: "Fairview & Wood Village",
    label: "Fairview & Wood Village",
    title: "Fairview & Wood Village Digital Marketing | Brainjar Media",
    description:
      "Digital marketing for Fairview and Wood Village businesses — local SEO, websites and advertising from a Gresham agency right in your backyard, serving East Multnomah County since 2003.",
    eyebrow: "Serving Fairview & Wood Village",
    heading: "Digital Marketing for\n*Fairview & Wood Village*",
    lede:
      "These are our closest neighbors — minutes from our Gresham office. We help Fairview and Wood Village businesses compete online without leaving East County to do it.",
    argument: [
      "Fairview and Wood Village are small, tight-knit, and closely linked — part of Brainjar's immediate backyard along the I-84 and Halsey corridor. For a local business here, that proximity is a real advantage: your marketing agency is a few minutes away, not a phone tree in another time zone.",
      "Being small doesn't mean being invisible. Local SEO, a fast modern website, and smart advertising put a Fairview or Wood Village business in front of customers across East County and the wider metro — the same tools we use for far larger clients, scaled to fit.",
      "We've paired these two communities on one page for now because they're so closely connected. As we take on more work in each, we'll give Fairview and Wood Village the dedicated, deeper pages they deserve.",
    ],
    audienceHeading: "Who We Help Here",
    audience: [
      "Local retail, restaurants, and services along the Halsey / I-84 corridor",
      "Home services, trades, and contractors",
      "Small and family-owned businesses",
      "Professional and personal-service providers",
      "Organizations serving East Multnomah County",
    ],
    proofHeading: "A Neighbor With a Track Record",
    proof:
      "Being close by is only half of it — the other half is knowing what we're doing. Our portfolio shows two decades of websites and campaigns for businesses of every size. Have a look, then let's talk.",
    faq: [
      {
        q: "Are Fairview and Wood Village too small to benefit from SEO?",
        a: "Not at all — smaller markets are often where local SEO works best, because there's less competition for the searches that matter. Showing up first for nearby customers is very achievable here.",
      },
      {
        q: "How close is Brainjar to Fairview and Wood Village?",
        a: "Minutes away, in downtown Gresham. These are among our nearest neighbors, so meeting in person is easy.",
      },
      {
        q: "Why are Fairview and Wood Village on the same page?",
        a: "They're small and closely interconnected, so we've started with one honest, combined page rather than two nearly identical ones. As we grow our work in each community, we'll split them into dedicated pages.",
      },
      {
        q: "Do you serve the areas nearby, too?",
        a: "Yes — we work throughout East Multnomah County and the greater Portland metro, from our base in Gresham.",
      },
    ],
  },
];

export function getLocation(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
