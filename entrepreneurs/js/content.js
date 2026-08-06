// Course content for AI for Entrepreneurs.
// Level 5 in the I CAN + AI series: using AI to think through, launch, and grow
// a business. Still practical, still no coding required.

const COURSE = {
  title: "AI for Entrepreneurs",
  tagline: "Every business starts as someone's idea and a little courage. AI can't take the leap for you, but it can help you research faster, understand your customers, and build the thing you've been dreaming about — one real step at a time.",
  levels: [
    {
      id: "ai-as-thinking-partner",
      title: "AI as Your Thinking Partner",
      summary: "Research faster and pressure-test your ideas before you spend real money on them.",
      icon: "compass",
      lessons: [
        {
          title: "Faster market and competitor scans",
          html: `
            <p>Ask AI to map out who else is solving a similar problem, what they charge, and
            how they position themselves &mdash; then verify the specifics yourself, since AI
            can be out of date or wrong on details. Use it to get oriented quickly, not as your
            final source of truth.</p>
          `,
        },
        {
          title: "Pressure-test your idea, devil's-advocate style",
          html: `
            <p>Ask AI to argue against your plan: "What are the three strongest reasons this
            business could fail?" A model has no ego invested in your idea, which makes it a
            useful (if imperfect) stand-in for the skeptical questions a real advisor would
            ask.</p>
          `,
        },
        {
          title: "Turning a rough idea into a one-page plan",
          html: `
            <p>Feed AI your scattered notes and ask for a structured one-pager: problem,
            audience, offer, and how you'll reach the first 10 customers. A tight one-pager
            you can revise weekly beats a long business plan gathering dust.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's the right way to treat AI's competitor research?",
          options: [
            "As something to ignore entirely",
            "As a fast way to get oriented, with specifics still worth verifying",
            "As legally binding market data",
            "As the final, verified source of truth",
          ],
          answer: 1,
          explain: "AI is great for quickly orienting yourself, but specific facts should still be independently verified.",
        },
        {
          q: "Why is asking AI to argue against your business plan useful?",
          options: [
            "It's not useful, AI can't offer real criticism",
            "It only works for technology businesses",
            "It always predicts business outcomes with certainty",
            "It has no ego invested, making it a useful stand-in for skeptical questions",
          ],
          answer: 3,
          explain: "AI can surface challenging questions without the social friction of asking a real person to criticize your idea.",
        },
        {
          q: "What's the benefit of a tight one-page plan over a long business plan?",
          options: [
            "It's less useful than a long document",
            "It removes the need for any planning at all",
            "It's easier to actually revise regularly and keep current",
            "It's required by all investors",
          ],
          answer: 2,
          explain: "A concise one-pager you'll actually revisit and revise beats a lengthy plan that gets written once and forgotten.",
        },
      ],
    },
    {
      id: "know-your-customer",
      title: "Know Your Customer, Faster",
      summary: "Turn scattered feedback into patterns you can actually act on.",
      icon: "users",
      lessons: [
        {
          title: "Finding patterns in feedback",
          html: `
            <p>Paste a batch of reviews, support tickets, or survey responses into AI and ask
            for the recurring themes, sorted by how often they come up. Spotting patterns by
            hand in 200 comments takes hours; AI can surface a first-pass summary in minutes for
            you to sanity-check.</p>
          `,
        },
        {
          title: "Drafting a customer survey",
          html: `
            <p>Give AI your goal ("understand why trial users don't upgrade to paid") and ask for
            5&ndash;7 short, non-leading questions. Non-leading is the key phrase to include
            &mdash; AI drafts can accidentally suggest the answer inside the question if you
            don't ask it to avoid that.</p>
          `,
        },
        {
          title: "Sketching a simple customer persona",
          html: `
            <p>From real notes and conversations (not guesses), ask AI to help organize a simple
            persona: goals, frustrations, and what would make your offer an easy yes. Treat it as
            a working draft to test against real customers, not a finished, permanent
            description.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's a good use of AI when you have a large batch of customer feedback?",
          options: [
            "Automatically replying to every customer without review",
            "Ignoring it since AI can't process feedback",
            "Deleting anything negative",
            "Surfacing recurring themes quickly for you to sanity-check",
          ],
          answer: 3,
          explain: "AI can quickly surface patterns across large amounts of feedback, which you then verify and act on.",
        },
        {
          q: "Why is it important to ask for \"non-leading\" survey questions specifically?",
          options: [
            "Leading questions are required for good surveys",
            "AI drafts can accidentally suggest the answer inside the question unless told to avoid it",
            "It only matters for phone surveys",
            "It's not important, all questions are equally valid",
          ],
          answer: 1,
          explain: "Without that explicit instruction, draft survey questions can bias respondents toward a particular answer.",
        },
        {
          q: "How should a customer persona built with AI be treated?",
          options: [
            "As a working draft to test against real customers",
            "As something that never needs real customer input",
            "As a legal document",
            "As a finished, permanent description",
          ],
          answer: 0,
          explain: "A persona is most useful as a living draft, refined against real conversations rather than treated as final.",
        },
      ],
    },
    {
      id: "money-matters",
      title: "Money Matters",
      summary: "Use AI for a first-pass budget and pricing — then bring in a real professional.",
      icon: "coin",
      lessons: [
        {
          title: "A first-pass budget",
          html: `
            <p>Describe your business basics and ask AI to draft a simple starter budget:
            expected costs, rough revenue scenarios (conservative, expected, optimistic), and
            your break-even point. This gives you a starting framework to fill in with real
            numbers, not a substitute for actual financial planning.</p>
          `,
        },
        {
          title: "Pricing research",
          html: `
            <p>Ask AI to summarize common pricing models in your space (subscription, one-time,
            tiered, usage-based) and their typical trade-offs. Combine this with a look at 3&ndash;5
            real competitor prices before you land on your own number.</p>
          `,
        },
        {
          title: "The caveat that matters most",
          html: `
            <p>AI is not a substitute for an accountant, bookkeeper, or financial advisor,
            especially for tax questions, legal business structure decisions, or anything with
            real regulatory consequences. Use it to prepare better questions for that
            professional, not to replace them.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What is an AI-drafted starter budget best used as?",
          options: [
            "A starting framework to fill in with real numbers",
            "A legal filing",
            "A replacement for ever tracking real expenses",
            "A final, official financial document",
          ],
          answer: 0,
          explain: "An AI-drafted budget is a useful starting structure, not a finished, verified financial plan.",
        },
        {
          q: "What should you combine with AI pricing research before setting your own price?",
          options: [
            "Only your own gut feeling",
            "A look at real competitor prices",
            "Nothing else is needed",
            "A random number generator",
          ],
          answer: 1,
          explain: "AI can summarize common pricing models, but checking real competitor prices grounds the research in your actual market.",
        },
        {
          q: "For what kinds of decisions should you always involve a real professional instead of relying on AI alone?",
          options: [
            "Drafting a first-pass social media caption",
            "Tax questions, legal business structure, and regulatory matters",
            "Naming a new product feature",
            "Brainstorming blog post topics",
          ],
          answer: 1,
          explain: "High-stakes, regulated decisions like taxes and legal structure need a qualified professional, not just AI output.",
        },
      ],
    },
    {
      id: "marketing-on-a-budget",
      title: "Marketing on a Budget",
      summary: "Ad copy, email, and content calendars — without a marketing department.",
      icon: "megaphone",
      lessons: [
        {
          title: "Ad copy and email drafts",
          html: `
            <p>Give AI your offer, audience, and one clear goal per piece of copy ("get a click,"
            "get a reply," "get a sign-up") and ask for 5&ndash;6 variations. Testing several
            small variations against each other usually beats agonizing over one "perfect"
            version.</p>
          `,
        },
        {
          title: "A simple content calendar",
          html: `
            <p>Ask AI to draft a month of content topics around 2&ndash;3 recurring themes tied
            to your business (customer questions, behind-the-scenes, results/proof). Having a
            calendar to react to, rather than a blank page each week, is what actually keeps
            marketing consistent.</p>
          `,
        },
        {
          title: "A one-page brand voice guide",
          html: `
            <p>Write down 3&ndash;5 words that describe your brand's tone, a few phrases you'd
            never use, and one example of copy that nails it. Paste this into every AI marketing
            request &mdash; it's the fastest way to keep dozens of small pieces of content
            sounding like one consistent business.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's a better approach than agonizing over one \"perfect\" ad?",
          options: [
            "Never testing anything at all",
            "Writing only one version, ever",
            "Testing several small variations against each other",
            "Copying a competitor's ad exactly",
          ],
          answer: 2,
          explain: "Testing multiple variations against a clear goal typically outperforms trying to perfect a single version upfront.",
        },
        {
          q: "What makes a content calendar effective for staying consistent?",
          options: [
            "Avoiding any recurring themes",
            "Publishing everything on the same day",
            "Having something to react to instead of a blank page each week",
            "Writing content with no plan at all",
          ],
          answer: 2,
          explain: "A calendar built around a few recurring themes removes the blank-page problem that derails marketing consistency.",
        },
        {
          q: "What's the purpose of a one-page brand voice guide?",
          options: [
            "Keeping many pieces of AI-assisted content sounding like one consistent business",
            "It replaces the need for any actual marketing",
            "It's required by law for small businesses",
            "It's purely decorative and has no practical use",
          ],
          answer: 0,
          explain: "A short, reusable brand voice reference keeps output consistent across many different AI-assisted marketing pieces.",
        },
      ],
    },
    {
      id: "hiring-and-growing-a-team",
      title: "Hiring & Growing a Team",
      summary: "Job posts, interview prep, and onboarding docs — plus knowing what to delegate to AI.",
      icon: "team",
      lessons: [
        {
          title: "Writing a job description that attracts the right people",
          html: `
            <p>Give AI the actual day-to-day of the role, not just a title, and ask for a draft
            that's specific and honest rather than generic corporate language. Specific,
            realistic postings attract candidates who actually want that job &mdash; vague ones
            attract everyone and no one.</p>
          `,
        },
        {
          title: "Interview question prep",
          html: `
            <p>Ask AI to draft role-specific interview questions tied to the actual skills the
            job needs, plus follow-up questions that probe for real examples rather than
            rehearsed answers. Review and adjust based on what you already know matters most for
            your team.</p>
          `,
        },
        {
          title: "Onboarding docs that save you from repeating yourself",
          html: `
            <p>Turn your own scattered knowledge (the "how we do things here" in your head) into
            a first-draft onboarding doc with AI's help, covering tools, expectations, and who to
            ask what. Update it after each new hire's first month, when the gaps are freshest in
            everyone's mind.</p>
          `,
        },
        {
          title: "Knowing what to delegate to AI, not people",
          html: `
            <p>As you grow a team, the highest-leverage move is often handing repetitive,
            well-defined tasks to AI (first-draft replies, meeting summaries, routine reports) so
            your people's time goes toward judgment calls and relationships AI can't handle as
            well.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What makes a job description attract the right candidates?",
          options: [
            "Making it as vague as possible to attract more applicants",
            "Omitting the role's real responsibilities",
            "Generic corporate language with no specifics",
            "Specific, honest detail about the actual day-to-day work",
          ],
          answer: 3,
          explain: "Specific, realistic job postings attract candidates genuinely suited to and interested in that particular role.",
        },
        {
          q: "What should good interview follow-up questions aim to do?",
          options: [
            "Confirm a rehearsed answer without pushing further",
            "Avoid any follow-up entirely",
            "Probe for real examples rather than rehearsed answers",
            "Focus only on hypothetical scenarios",
          ],
          answer: 2,
          explain: "Follow-ups that ask for concrete real examples reveal more about a candidate's actual experience than surface-level answers.",
        },
        {
          q: "When is the best time to update an onboarding doc?",
          options: [
            "Only once a decade",
            "Never, once written it's finished forever",
            "After each new hire's first month, when gaps are freshest",
            "Before the business has any employees",
          ],
          answer: 2,
          explain: "Updating right after a new hire's first month captures gaps and confusion while they're still fresh and easy to fix.",
        },
        {
          q: "What's a smart way to delegate as a growing team scales?",
          options: [
            "Give AI repetitive, well-defined tasks so people can focus on judgment calls and relationships",
            "Only delegate tasks nobody wants to do",
            "Never use AI once you have employees",
            "Hand every task to AI regardless of type",
          ],
          answer: 0,
          explain: "Offloading repetitive, well-defined work to AI frees your team's time for the judgment and relationship work AI handles less well.",
        },
      ],
    },
    {
      id: "building-an-ai-ready-business",
      title: "Building an AI-Ready Business",
      summary: "Light guardrails, tool choices that scale, and a look at what's next.",
      icon: "shield",
      lessons: [
        {
          title: "A simple AI usage guideline for your team",
          html: `
            <p>You don't need a lengthy policy document to start &mdash; a short, plain-language
            note covering what's okay to paste into AI tools, which tools are approved, and who
            to ask when unsure prevents most real problems. Revisit it as your team and tool use
            grow.</p>
          `,
        },
        {
          title: "Choosing tools that scale with you",
          html: `
            <p>Favor AI tools with team/business plans, clear data-handling policies, and export
            options over ones that lock your work in. What's fine for a solo experiment isn't
            always right once client data or teammates are involved &mdash; revisit your tool
            choices as you grow.</p>
          `,
        },
        {
          title: "Staying compliant and ethical as you scale",
          html: `
            <p>As AI becomes part of how your business runs, keep the same habits from earlier
            levels at a team level: disclose AI involvement where expected, verify anything
            high-stakes, and protect customer and employee data the same way you'd protect it
            without AI in the picture.</p>
          `,
        },
        {
          title: "A look ahead",
          html: `
            <p>Everything in this level works without writing a line of code. When you're ready
            to go further &mdash; connecting AI directly to your own systems, building custom
            tools for your business, or working with a developer on something more advanced
            &mdash; that's genuinely valuable territory. It's just not required to get real,
            everyday value from what you've already learned here.</p>
            <p>It's worth pausing on how much has changed. Research, customer insight, financial
            modeling, marketing, hiring &mdash; the kind of support that used to require a team
            and a budget is now available to anyone willing to learn a few habits. The business
            you've been imagining is more within reach than it's ever been. Keep going.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's a practical first step for AI guidelines at a small business?",
          options: [
            "No guidelines are ever necessary",
            "A short, plain-language note on what's okay to share and which tools are approved",
            "Banning AI use entirely",
            "A lengthy formal policy document before using AI at all",
          ],
          answer: 1,
          explain: "A short, clear starting guideline prevents most real problems without requiring a heavy policy process upfront.",
        },
        {
          q: "What should you favor when choosing AI tools as your business grows?",
          options: [
            "Tools with no data-handling policy at all",
            "Tools that lock your work in permanently",
            "Whichever tool is cheapest regardless of features",
            "Tools with team plans, clear data policies, and export options",
          ],
          answer: 3,
          explain: "Tools built for teams, with clear data handling and export options, scale much better than solo-experiment tools.",
        },
        {
          q: "According to this level, what's required before getting real value from what you've learned?",
          options: [
            "Nothing further — everything covered works without writing code",
            "Hiring a developer immediately",
            "Waiting for an Advanced course to be released",
            "Learning to code first",
          ],
          answer: 0,
          explain: "The skills from this course are usable right away, with more advanced/technical territory available later but not required.",
        },
      ],
    },
  ],
};
