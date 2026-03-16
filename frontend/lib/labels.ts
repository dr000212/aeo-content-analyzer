export const PILLAR_LABELS = {
  technical_seo: {
    name: "Site Foundation",
    tagline: "Is your website built right?",
    description:
      "These are the technical basics that search engines need to find and understand your page. Think of it like making sure your house has a proper address and an unlocked front door.",
    icon: "🏗️",
  },
  onpage_seo: {
    name: "Content Optimization",
    tagline: "Is your content set up for search?",
    description:
      "This checks whether your page title, summary, headings, and images are properly set up so search engines know what your page is about.",
    icon: "📝",
  },
  links: {
    name: "Link Health",
    tagline: "Are your links helping or hurting?",
    description:
      "Links are like recommendations. Linking to good sources and to your own related pages tells search engines your content is well-connected and trustworthy.",
    icon: "🔗",
  },
  performance: {
    name: "Page Speed",
    tagline: "How fast does your page load?",
    description:
      "Nobody likes a slow website. Search engines penalize slow pages and visitors leave before they even see your content. Every second counts.",
    icon: "⚡",
  },
  geo_readiness: {
    name: "AI Readiness",
    tagline: "Can AI assistants find and cite your content?",
    description:
      "AI tools like ChatGPT, Google AI, and Perplexity are now how many people find information. This checks if your content is structured so AI can understand and recommend it.",
    icon: "🤖",
  },
};

export const GEO_SUB_LABELS = {
  structure: {
    name: "Content Structure",
    tagline: "Is your content well-organized?",
    description:
      "AI engines prefer content with clear headings, short paragraphs, and a direct answer right at the top.",
  },
  schema_markup: {
    name: "Smart Tags",
    tagline: "Does your page speak the language of search engines?",
    description:
      "Smart tags are invisible labels in your code that tell search engines exactly what your content is — like a table of contents for robots.",
  },
  entity: {
    name: "Topic Depth",
    tagline: "Does your content cover the topic thoroughly?",
    description:
      "AI engines prefer content that covers a topic completely — mentioning related concepts, linking to sources, and answering follow-up questions.",
  },
  readability: {
    name: "Writing Quality",
    tagline: "Is your content clear and trustworthy?",
    description:
      "Content should be easy to read, use confident language, and show who wrote it and when. AI engines trust clear, authoritative writing.",
  },
};

export const CHECK_LABELS: Record<
  string,
  { passed: string; failed: string; why: string }
> = {
  // Site Foundation
  tseo_01: {
    passed: "Your page is secure (HTTPS)",
    failed: "Your page is not secure — it's using HTTP instead of HTTPS",
    why: "Browsers show a 'Not Secure' warning on HTTP pages, which scares visitors away. Search engines also rank secure pages higher.",
  },
  tseo_02: {
    passed: "Your page loads directly without unnecessary redirects",
    failed: "Your page goes through multiple redirects before loading — this slows things down",
    why: "Each redirect adds loading time. It's like being told to go to 3 different desks before someone helps you.",
  },
  tseo_03: {
    passed: "Your page loads successfully",
    failed: "Your page returned an error instead of loading properly",
    why: "If search engines get an error when visiting your page, they can't show it in results.",
  },
  tseo_04: {
    passed: "Search engines can find your crawling instructions",
    failed: "No instructions file (robots.txt) found for search engines",
    why: "A robots.txt file tells search engines which pages to visit. Without it, they have to guess.",
  },
  tseo_05: {
    passed: "Search engines are allowed to visit this page",
    failed: "Your page is blocked — search engines are told not to visit it",
    why: "Your robots.txt file is telling search engines to skip this page. That means it can never appear in search results.",
  },
  tseo_06: {
    passed: "A sitemap is available for search engines",
    failed: "No sitemap found — search engines don't have a map of your website",
    why: "A sitemap is like a directory of all your pages. It helps search engines find everything on your site.",
  },
  tseo_07: {
    passed: "Your page has proper duplicate protection",
    failed: "No canonical tag found — search engines might think this is a duplicate page",
    why: "If the same content exists at multiple URLs, search engines get confused about which one to show.",
  },
  tseo_08: {
    passed: "Your page is set up for mobile devices",
    failed: "Your page isn't set up for mobile — it may look broken on phones",
    why: "Over 60% of web traffic is from phones. Search engines penalize pages that don't work well on mobile.",
  },
  tseo_09: {
    passed: "Your page declares its language",
    failed: "Your page doesn't declare what language it's in",
    why: "Declaring the language helps search engines show your page to the right audience.",
  },
  tseo_10: {
    passed: "Character encoding is properly set",
    failed: "No character encoding declared — some characters might display incorrectly",
    why: "Without this, special characters like e, n, or € might show up as garbled text.",
  },
  // Content Optimization
  opseo_01: {
    passed: "Your page has a title",
    failed: "Your page is missing a title — this is the most important thing for search",
    why: "The title is what appears as the clickable headline in search results. Without it, search engines make up their own.",
  },
  opseo_02: {
    passed: "Your page title is a good length",
    failed: "Your page title length needs adjustment — it should be 30-60 characters",
    why: "Too short and it doesn't describe your page. Too long and search engines cut it off with '...'.",
  },
  opseo_03: {
    passed: "Your title includes your main topic",
    failed: "Your page title doesn't mention your main topic",
    why: "If someone searches for your topic, the title is the first thing they and search engines check for relevance.",
  },
  opseo_04: {
    passed: "Your page has a summary for search engines",
    failed: "Your page doesn't have a summary (meta description) — search engines will write their own",
    why: "The summary appears below the title in search results. A good one convinces people to click.",
  },
  opseo_05: {
    passed: "Your page summary is a good length",
    failed: "Your page summary needs length adjustment — target 120-160 characters",
    why: "Too short wastes valuable space. Too long gets cut off. The sweet spot is 120-160 characters.",
  },
  opseo_06: {
    passed: "Your URL is clean and readable",
    failed: "Your URL is messy — it should be short and descriptive",
    why: "Clean URLs like /best-running-shoes/ tell people and search engines what the page is about.",
  },
  opseo_07: {
    passed: "All your images have descriptions",
    failed: "Some images are missing descriptions (alt text)",
    why: "Image descriptions help blind users and help search engines know what the images show.",
  },
  opseo_08: {
    passed: "Your page has exactly one main title (H1)",
    failed: "Your page doesn't have exactly one main title",
    why: "Multiple main titles confuse search engines about what your page is really about.",
  },
  opseo_09: {
    passed: "Your main title includes your key topic",
    failed: "Your main title (H1) doesn't mention your key topic",
    why: "The main title is the biggest signal to search engines about your page's topic.",
  },
  opseo_10: {
    passed: "All your headings have text",
    failed: "Some headings are empty — they should all contain text",
    why: "Empty headings are confusing for both readers and search engines.",
  },
  // Link Health
  link_01: {
    passed: "You have good links to your own related pages",
    failed: "Not enough links to your own pages — add more to connect your content",
    why: "Linking to your own related pages helps visitors discover more of your content.",
  },
  link_02: {
    passed: "You link to external sources",
    failed: "No links to other websites — add references to build trust",
    why: "Linking to reputable sources shows you've done your research and makes your content more trustworthy.",
  },
  link_03: {
    passed: "All your links are working",
    failed: "Some links appear to be broken or empty",
    why: "Broken links frustrate visitors and tell search engines your page isn't well-maintained.",
  },
  link_04: {
    passed: "External links are properly secured",
    failed: "Some external links are missing security attributes",
    why: "When linking to other sites that open in a new tab, adding a security attribute prevents the other site from accessing your page info.",
  },
  link_05: {
    passed: "Your link text is descriptive",
    failed: "Some links use vague text like 'click here' instead of describing what they link to",
    why: "Good link text like 'read our pricing guide' tells people and search engines what they'll find.",
  },
  link_06: {
    passed: "Your page has a healthy number of links",
    failed: "Too many links compared to your content — it looks spammy",
    why: "Having way more links than content makes your page look like a link farm.",
  },
  link_07: {
    passed: "Your internal links point to accessible pages",
    failed: "Some of your internal links point to pages that might be blocked",
    why: "Linking to pages that search engines can't access wastes the link value.",
  },
  // Page Speed
  perf_01: {
    passed: "Your page loads fast",
    failed: "Your page takes too long to load — that's too slow",
    why: "53% of visitors leave if a page takes more than 3 seconds to load. Every second costs you visitors.",
  },
  perf_02: {
    passed: "Your page code is a reasonable size",
    failed: "Your page code is larger than it should be",
    why: "A bloated page takes longer to download, especially on slow connections or mobile data.",
  },
  perf_03: {
    passed: "No scripts are blocking your page from loading",
    failed: "Scripts are blocking your page from appearing — visitors see a blank screen while they load",
    why: "Render-blocking scripts make visitors stare at a white page while code loads in the background.",
  },
  perf_04: {
    passed: "Your stylesheets aren't blocking page load",
    failed: "Too many stylesheets are slowing down your page's first paint",
    why: "Too many external stylesheets in the header delay when visitors first see your content.",
  },
  perf_05: {
    passed: "Your images have proper dimensions set",
    failed: "Some images are missing width and height — this causes content to jump around",
    why: "Without dimensions, the page layout shifts as images load. This is annoying for visitors.",
  },
  perf_06: {
    passed: "Your images load efficiently",
    failed: "Some images could load on-demand instead of all at once",
    why: "Loading all images at once slows down the initial page load. Images below the screen should only load when scrolled to.",
  },
  perf_07: {
    passed: "Minimal inline styling on your page",
    failed: "Too much inline CSS styling on your page",
    why: "Inline styles bloat your page and can't be cached by browsers.",
  },
  perf_08: {
    passed: "Your page uses compression",
    failed: "Your page isn't compressed — it's sending more data than needed",
    why: "Compression shrinks your page by 60-80% before sending it. It's like zipping a file before emailing it.",
  },
  // AI Readiness: Structure
  str_01: {
    passed: "Your page has one clear main title",
    failed: "AI assistants can't find a clear main title on your page",
    why: "AI tools look for a single main title to understand what your page is about.",
  },
  str_02: {
    passed: "Your headings follow a logical order",
    failed: "Your headings skip levels (e.g., jumping from a main heading to a sub-sub-heading)",
    why: "AI assistants use heading levels to understand your content structure.",
  },
  str_03: {
    passed: "Your page answers the main question right away",
    failed: "Your page doesn't give a clear answer in the opening paragraph",
    why: "AI assistants strongly prefer content that answers the question immediately, then expands on it.",
  },
  str_04: {
    passed: "Your paragraphs are a good length for AI extraction",
    failed: "Some paragraphs are too long for AI to extract cleanly",
    why: "AI assistants pull out self-contained chunks. Short paragraphs (40-60 words) are perfect bite-sized answers.",
  },
  str_05: {
    passed: "You use question-style headings that match how people ask AI",
    failed: "Your headings don't match how people ask questions to AI assistants",
    why: "People ask AI things like 'How do I...' and 'What is...'. If your headings match these patterns, AI is more likely to pull your content.",
  },
  str_06: {
    passed: "Your content uses lists or tables for structured information",
    failed: "No lists or tables found — these are goldmines for AI citations",
    why: "AI assistants love citing structured data. Tables, numbered steps, or bullet lists get referenced much more often.",
  },
  str_07: {
    passed: "Your content is well-segmented with headings",
    failed: "Long content with too few section breaks",
    why: "AI assistants navigate content using headings. More sections = more chances for AI to find and cite specific answers.",
  },
  str_08: {
    passed: "Your content has enough depth",
    failed: "Your content is too short to be considered authoritative",
    why: "Very short pages rarely get cited by AI because they don't cover the topic thoroughly enough.",
  },
  // AI Readiness: Schema
  sch_01: {
    passed: "Your page has structured data that search engines can read",
    failed: "No structured data found — your page isn't speaking the language of search engines",
    why: "Structured data is like a machine-readable summary. Without it, AI tools have to guess what your content is about.",
  },
  sch_02: {
    passed: "Your Q&A content is properly marked up for AI",
    failed: "You have questions on your page but they're not marked up for AI to find",
    why: "FAQ markup tells AI assistants 'here are questions and their answers.' This massively increases citation chances.",
  },
  sch_03: {
    passed: "Your step-by-step content is marked up for AI",
    failed: "Step-by-step content detected but not marked up for AI",
    why: "HowTo markup helps AI present your instructions as step-by-step answers.",
  },
  sch_04: {
    passed: "Your content is marked for voice assistants",
    failed: "Your content isn't optimized for voice assistants like Siri or Alexa",
    why: "Speakable markup tells voice assistants which parts of your page to read aloud.",
  },
  sch_05: {
    passed: "Your page looks good when shared on social media",
    failed: "Missing social sharing tags — your page won't look great when shared",
    why: "When someone shares your link on social media, these tags control the title, description, and image that appear.",
  },
  sch_06: {
    passed: "Twitter/X sharing tags are set",
    failed: "Missing Twitter Card tags for social sharing",
    why: "Twitter Card tags make your links look professional when shared on Twitter/X.",
  },
  sch_07: {
    passed: "Your page summary is well-optimized",
    failed: "Your page summary (meta description) needs improvement",
    why: "The page summary appears in search results and is often used by AI to understand your page.",
  },
  sch_08: {
    passed: "Duplicate protection is set up",
    failed: "Missing canonical URL — risk of duplicate content issues",
    why: "Without this tag, search engines might split your ranking power across multiple URLs.",
  },
  // AI Readiness: Entity
  ent_01: {
    passed: "Your content covers specific topics and names",
    failed: "Your content is too vague — it doesn't mention enough specific topics",
    why: "AI assistants prefer content that mentions specific names, brands, and technical terms.",
  },
  ent_02: {
    passed: "Your main topic appears in all the right places",
    failed: "Your main topic isn't mentioned in all key positions (title, first paragraph, headings)",
    why: "AI needs to see your topic reinforced in key positions to be confident your page is about that topic.",
  },
  ent_03: {
    passed: "Your topic is mentioned a healthy number of times",
    failed: "Your main topic mention frequency is off — target 1-3% density",
    why: "Too few mentions = AI isn't sure your page is about this topic. Too many = it looks like spam.",
  },
  ent_04: {
    passed: "Key terms are defined and explained",
    failed: "Key terms are used but never defined or explained",
    why: "AI assistants love content that defines terms. It shows expertise and makes your content the go-to explanation.",
  },
  ent_05: {
    passed: "Good links to your related content",
    failed: "Not enough links to your own related pages",
    why: "Linking to your own related pages shows AI that you have deep coverage of the topic.",
  },
  ent_06: {
    passed: "You reference authoritative sources",
    failed: "No links to external authoritative sources",
    why: "Citing reputable sources makes AI more confident in recommending your content.",
  },
  ent_07: {
    passed: "Your content covers related subtopics",
    failed: "Your content focuses too narrowly — it doesn't cover related angles",
    why: "AI prefers comprehensive content that covers a topic from multiple angles.",
  },
  // AI Readiness: Readability
  read_01: {
    passed: "Your writing is clear and accessible",
    failed: "Your content readability needs improvement for the average reader",
    why: "AI assistants prefer content that's clear and professional — not full of unnecessary jargon.",
  },
  read_02: {
    passed: "Your sentences are a good length",
    failed: "Your sentence length needs adjustment — aim for 15-25 words",
    why: "Short, punchy sentences are easier for both humans and AI to understand.",
  },
  read_03: {
    passed: "Your writing uses strong, direct language",
    failed: "Too many sentences use weak, passive phrasing",
    why: "'Our team wrote the report' is stronger than 'The report was written.' Direct language sounds more authoritative.",
  },
  read_04: {
    passed: "No overly long sentences",
    failed: "Some sentences are extremely long and hard to follow",
    why: "Very long sentences lose readers and are hard for AI to extract as clean answers.",
  },
  read_05: {
    passed: "Your content shows who wrote it",
    failed: "No author or organization name found on this page",
    why: "AI assistants trust content from known authors. Anonymous content is less likely to be cited.",
  },
  read_06: {
    passed: "Your content shows when it was written or updated",
    failed: "No publish date or update date found",
    why: "AI prefers fresh, dated content. Without a date, AI can't tell if your info is current.",
  },
  read_07: {
    passed: "Your writing sounds confident",
    failed: "Your writing uses too many uncertain words (might, perhaps, possibly)",
    why: "AI prefers to cite confident, definitive answers. 'This will help' is more citable than 'This might possibly help.'",
  },
  read_08: {
    passed: "Your content has a clear conclusion",
    failed: "No summary or conclusion section found",
    why: "A clear conclusion reinforces your key points. AI often cites summary paragraphs as quick answers.",
  },
};

export const GRADE_DESCRIPTIONS: Record<string, string> = {
  Excellent:
    "Your page is in great shape! It's well-optimized for both search engines and AI assistants.",
  Good: "Your page is doing well, but there's room to improve. Focus on the high-priority fixes below.",
  "Needs Improvement":
    "Your page has several issues that are likely hurting its visibility. Start with the critical fixes.",
  Poor: "Your page needs significant work to be found by search engines and AI. The good news: every fix below will make a real difference.",
};

export const PRIORITY_LABELS: Record<
  string,
  { label: string; color: string; description: string }
> = {
  Critical: {
    label: "Fix now",
    color: "red",
    description: "This is seriously hurting your visibility",
  },
  High: {
    label: "Important",
    color: "amber",
    description: "Fixing this will noticeably improve your score",
  },
  Medium: {
    label: "Recommended",
    color: "blue",
    description: "A good improvement when you have time",
  },
  Low: {
    label: "Nice to have",
    color: "gray",
    description: "Minor improvement, tackle this last",
  },
};

export const EFFORT_LABELS: Record<string, string> = {
  Low: "Quick fix (5 minutes)",
  Medium: "Some work needed (30 minutes)",
  High: "Significant effort (1+ hours)",
};

export const PILLAR_WHAT_WE_CHECK: Record<
  string,
  { weight: number; summary: string; checks: string[]; color: string }
> = {
  technical_seo: {
    weight: 15,
    color: "blue",
    summary: "We check 10 things about your website's technical setup",
    checks: [
      "Is your site secure (HTTPS)?",
      "Does your page load without extra redirects?",
      "Does the page load successfully (no errors)?",
      "Can search engines find your crawling instructions?",
      "Are search engines allowed to visit this page?",
      "Is there a sitemap for search engines?",
      "Is duplicate content protection set up?",
      "Is the page set up for mobile devices?",
      "Does the page declare its language?",
      "Is character encoding properly set?",
    ],
  },
  onpage_seo: {
    weight: 20,
    color: "purple",
    summary: "We check 10 things about how your content is set up for search",
    checks: [
      "Does your page have a title?",
      "Is your title the right length (30-60 characters)?",
      "Does your title include your main topic?",
      "Is there a summary (meta description) for search engines?",
      "Is the summary the right length (120-160 characters)?",
      "Is the URL clean and readable?",
      "Do all images have descriptions (alt text)?",
      "Is there exactly one main heading (H1)?",
      "Does the main heading mention the key topic?",
      "Do all headings have text content?",
    ],
  },
  links: {
    weight: 10,
    color: "emerald",
    summary: "We check 7 things about your internal and external links",
    checks: [
      "Are there enough links to your own related pages?",
      "Do you link to external sources for credibility?",
      "Are all links working (no broken links)?",
      "Are external links properly secured?",
      "Is link text descriptive (not just 'click here')?",
      "Is the link-to-content ratio healthy?",
      "Do internal links point to accessible pages?",
    ],
  },
  performance: {
    weight: 20,
    color: "amber",
    summary: "We check 8 things about how fast your page loads",
    checks: [
      "Does the page load in under 3 seconds?",
      "Is the page code a reasonable size (under 100KB)?",
      "Are scripts blocking the page from appearing?",
      "Are too many stylesheets slowing things down?",
      "Do images have proper dimensions set?",
      "Do images load on-demand (lazy loading)?",
      "Is inline styling kept to a minimum?",
      "Is the page compressed for faster delivery?",
    ],
  },
  geo_readiness: {
    weight: 35,
    color: "violet",
    summary: "We check 31 things across 4 areas of AI readiness",
    checks: [
      "Content Structure (30%) — 8 checks on headings, paragraphs, and organization",
      "Smart Tags (25%) — 8 checks on structured data and social sharing",
      "Topic Depth (25%) — 7 checks on topic coverage and authority",
      "Writing Quality (20%) — 8 checks on clarity, confidence, and freshness",
    ],
  },
};

export const GEO_SUB_WHAT_WE_CHECK: Record<
  string,
  { weight: number; checks: string[] }
> = {
  structure: {
    weight: 30,
    checks: [
      "Is there one clear main title?",
      "Do headings follow a logical order?",
      "Is the main question answered right away?",
      "Are paragraphs a good length for AI extraction?",
      "Do headings match how people ask AI questions?",
      "Are there lists or tables for structured info?",
      "Is the content well-segmented with headings?",
      "Is there enough depth and length?",
    ],
  },
  schema_markup: {
    weight: 25,
    checks: [
      "Is there structured data search engines can read?",
      "Is Q&A content properly marked up?",
      "Are step-by-step instructions marked up?",
      "Is content optimized for voice assistants?",
      "Does the page look good when shared on social media?",
      "Are Twitter/X sharing tags set?",
      "Is the page summary well-optimized?",
      "Is duplicate protection set up?",
    ],
  },
  entity: {
    weight: 25,
    checks: [
      "Does content mention specific topics and names?",
      "Does the main topic appear in key places?",
      "Is the topic mentioned a healthy number of times?",
      "Are key terms defined and explained?",
      "Are there links to related content?",
      "Are authoritative sources referenced?",
      "Are related subtopics covered?",
    ],
  },
  readability: {
    weight: 20,
    checks: [
      "Is the writing clear and accessible?",
      "Are sentences a good length (15-25 words)?",
      "Is the writing direct and active (not passive)?",
      "Are there no overly long sentences?",
      "Does the content show who wrote it?",
      "Is there a publish or update date?",
      "Does the writing sound confident?",
      "Is there a clear conclusion?",
    ],
  },
};

export const PILLAR_COLORS: Record<string, { bg: string; border: string; text: string; light: string }> = {
  technical_seo: { bg: "bg-blue-500", border: "border-blue-400", text: "text-blue-600", light: "bg-blue-50" },
  onpage_seo: { bg: "bg-purple-500", border: "border-purple-400", text: "text-purple-600", light: "bg-purple-50" },
  links: { bg: "bg-emerald-500", border: "border-emerald-400", text: "text-emerald-600", light: "bg-emerald-50" },
  performance: { bg: "bg-amber-500", border: "border-amber-400", text: "text-amber-600", light: "bg-amber-50" },
  geo_readiness: { bg: "bg-violet-500", border: "border-violet-400", text: "text-violet-600", light: "bg-violet-50" },
};

export const PILLAR_FILTER_LABELS: Record<string, string> = {
  all: "All",
  "Technical SEO": "Site Foundation",
  "On-Page SEO": "Content",
  Links: "Links",
  Performance: "Speed",
  Structure: "AI Readiness",
  Schema: "AI Readiness",
  Entity: "AI Readiness",
  Readability: "AI Readiness",
};
