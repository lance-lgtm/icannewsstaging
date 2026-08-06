// Course content for AI for Advanced.
// The sixth and final level of the I CAN + AI series. The first course that
// genuinely involves writing (AI-assisted) code — but still built for people
// with no prior programming background.

const COURSE = {
  title: "AI for Advanced",
  tagline: "You've made it to the edge of what's possible without code. Here's the good news: you don't need to already be a programmer to cross that line — AI will write the code right alongside you.",
  levels: [
    {
      id: "talking-to-ai-through-code",
      title: "Talking to AI Through Code",
      summary: "Move past the chat window and call AI directly — the foundation everything else in this level builds on.",
      icon: "terminal",
      lessons: [
        {
          title: "Why go beyond the chat window?",
          html: `
            <p>Everything so far has happened in a browser tab you operate by hand. An
            <strong>API</strong> (application programming interface) lets a program talk to an
            AI model directly &mdash; no copy-pasting, no manual clicking. That's what makes
            automation, custom tools, and the assistants you've built in earlier levels possible
            to run entirely on their own.</p>
          `,
        },
        {
          title: "What an API key actually is",
          html: `
            <p>An API key is essentially a password that identifies you (or your app) to an AI
            provider, and it's tied to your billing. Treat it exactly like a password: never
            paste it into code you share publicly, never post it in a chat, and store it as an
            <strong>environment variable</strong> &mdash; a setting your program reads at
            startup, kept separate from the code itself.</p>
          `,
        },
        {
          title: "The anatomy of an API call, in plain language",
          html: `
            <p>A call to an AI model usually includes: a <strong>system prompt</strong> (standing
            instructions, like the custom instructions from earlier levels), the
            <strong>user message</strong> (what you're asking right now), and a few settings like
            which model to use. The model sends back a response, and your program decides what
            to do with it &mdash; show it, save it, or feed it into the next step.</p>
          `,
        },
        {
          title: "Understanding tokens and cost",
          html: `
            <p>AI providers charge by <strong>tokens</strong> &mdash; small chunks of text,
            roughly a few characters each. Both what you send and what the model sends back cost
            tokens. Practical ways to manage cost: keep prompts focused, cap how long responses
            can be, and use smaller/cheaper models for simple tasks, saving bigger ones for
            harder problems.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What does an API let you do that a chat window doesn't?",
          options: [
            "Let a program talk to an AI model directly, without manual copy-pasting",
            "Remove the need for any billing",
            "Only generate images, never text",
            "Nothing meaningfully different",
          ],
          answer: 0,
          explain: "APIs let software call AI models programmatically, which is what makes automation and custom tools possible.",
        },
        {
          q: "How should you treat an API key?",
          options: [
            "Like a password — kept out of shared code and stored as an environment variable",
            "As a one-time code that expires after first use",
            "As something safe to paste into publicly shared code",
            "As something that never needs to be kept secret",
          ],
          answer: 0,
          explain: "An API key identifies you and is tied to billing, so it needs the same care as a password — never hardcoded into shared code.",
        },
        {
          q: "What is a \"system prompt\" in an API call?",
          options: [
            "Standing instructions for the model, similar to custom instructions in a chat tool",
            "A required payment method",
            "The model's internal training data",
            "An error message",
          ],
          answer: 0,
          explain: "The system prompt sets standing context and behavior for the model, similar to custom instructions in a chat interface.",
        },
        {
          q: "What's a practical way to manage AI API costs?",
          options: [
            "Use smaller, cheaper models for simple tasks and save bigger models for harder ones",
            "There's no way to influence API costs",
            "Always use the most expensive model for every task",
            "Cost has no relationship to how much text is sent or received",
          ],
          answer: 0,
          explain: "Matching model size to task difficulty, and keeping prompts/responses focused, are effective ways to manage token costs.",
        },
      ],
    },
    {
      id: "let-ai-write-the-code",
      title: "Let AI Write the Code With You",
      summary: "Build a real, working tool — without needing to already know how to program.",
      icon: "code",
      lessons: [
        {
          title: "You don't need to already know how to code",
          html: `
            <p>Modern AI coding assistants let you describe what you want in plain English and
            get working code back. This doesn't remove the need for judgment &mdash; but it
            means the barrier to building your first real tool is lower than it has ever been.
            Approach this level the way you approached your very first AI conversation: curious,
            not intimidated.</p>
          `,
        },
        {
          title: "Setting up a simple project",
          html: `
            <p>At its simplest, a coding project is just a folder with some files in it, plus a
            way to run them. AI coding tools (browser-based ones and downloadable ones alike)
            can walk you through this setup step by step &mdash; ask directly: "Walk me through
            setting this up, assuming I've never done it before."</p>
          `,
        },
        {
          title: "The build-run-fix loop",
          html: `
            <p>The core workflow: ask AI to write or change something, run it, and see what
            happens. If something breaks, paste the exact error message back to the AI and ask
            it to fix it. Errors are a normal, expected part of this loop &mdash; not a sign
            you've done something wrong.</p>
          `,
        },
        {
          title: "Reading just enough code to stay in control",
          html: `
            <p>You don't need to master programming to use it responsibly. Learn to spot a few
            red flags before running code: anything that deletes files, sends data somewhere,
            or asks for unexpected permissions. When unsure, simply ask the AI to explain, in
            plain English, exactly what a piece of code will do before you run it.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "Do you need to already know how to program to start this level?",
          options: [
            "Only on weekends",
            "Yes, prior programming experience is required",
            "No — AI coding assistants let you describe what you want in plain English",
            "Only if you're building something complex",
          ],
          answer: 2,
          explain: "AI coding tools are designed to lower the barrier to entry — describing your goal in plain language is the starting point.",
        },
        {
          q: "What is the \"build-run-fix loop\"?",
          options: [
            "Ask AI to write/change code, run it, and paste any errors back for a fix",
            "A way to avoid ever seeing an error message",
            "A process exclusive to professional developers",
            "A one-time process you never repeat",
          ],
          answer: 0,
          explain: "This iterative loop — write, run, fix based on real errors — is the core day-to-day workflow of AI-assisted coding.",
        },
        {
          q: "What's a red flag worth checking for before running AI-generated code?",
          options: [
            "Code that prints a friendly message",
            "Code with comments explaining what it does",
            "Code that runs in under a second",
            "Code that deletes files, sends data somewhere, or requests unexpected permissions",
          ],
          answer: 3,
          explain: "Actions with real-world consequences — deleting data, sending it elsewhere, unusual permission requests — deserve a second look before running.",
        },
      ],
    },
    {
      id: "your-knowledge-at-scale",
      title: "Giving AI Your Own Knowledge at Scale",
      summary: "What happens when a handful of uploaded files isn't enough anymore — an introduction to RAG.",
      icon: "database",
      lessons: [
        {
          title: "Why simple file uploads hit a ceiling",
          html: `
            <p>Uploading a few documents into a Project (from Level 3 of the Builders course)
            works well for small knowledge bases. It doesn't scale to thousands of documents, or
            to knowledge that changes constantly. That's the gap <strong>retrieval-augmented
            generation</strong>, or <strong>RAG</strong>, is built to close.</p>
          `,
        },
        {
          title: "How RAG works, in plain English",
          html: `
            <p>Think of RAG as a smart filing system paired with an AI. When you ask a question,
            the system first searches a large collection of documents for the most relevant
            snippets (this is the "retrieval" part), then hands just those relevant snippets to
            the AI to write an answer from (the "generation" part) &mdash; instead of trying to
            stuff every document into one conversation.</p>
          `,
        },
        {
          title: "What you'd actually need to build one",
          html: `
            <p>At a high level: your documents get broken into small chunks, each chunk is
            converted into a searchable numerical representation (an <strong>embedding</strong>),
            and those live in a specialized <strong>vector database</strong> built for fast
            similarity search. An AI coding assistant can scaffold all of this for you &mdash;
            you don't need to build the search algorithm from scratch.</p>
          `,
        },
        {
          title: "When RAG is (and isn't) the right tool",
          html: `
            <p>RAG earns its complexity for large, frequently changing knowledge bases &mdash;
            think a company wiki, a product catalog, or years of support tickets. For a handful
            of documents that don't change often, the simple upload approach from the Builders
            course is still the right, simpler choice. Reach for RAG when you've actually
            outgrown that, not by default.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "Why does RAG exist, given that simple file uploads already work?",
          options: [
            "There's no real difference between the two approaches",
            "Simple uploads don't scale to very large or constantly changing knowledge bases",
            "RAG is only useful for images",
            "RAG replaces file uploads in every situation",
          ],
          answer: 1,
          explain: "RAG solves the scale and freshness problems that simple file uploads run into with large or fast-changing document sets.",
        },
        {
          q: "In plain English, how does RAG generate an answer?",
          options: [
            "It feeds every document into one giant conversation every time",
            "It first retrieves the most relevant snippets, then generates an answer from just those",
            "It ignores your documents entirely",
            "It requires memorizing all documents in advance by hand",
          ],
          answer: 1,
          explain: "RAG searches for relevant snippets first (retrieval), then generates a response grounded in just those snippets.",
        },
        {
          q: "What is an \"embedding\" in the context of RAG?",
          options: [
            "A numerical representation of text that enables fast similarity search",
            "A video file format",
            "A type of API key",
            "A synonym for a chat window",
          ],
          answer: 0,
          explain: "Embeddings turn text chunks into searchable numerical representations, which is what powers fast retrieval.",
        },
        {
          q: "When is RAG the right tool to reach for?",
          options: [
            "For every single AI project, regardless of size",
            "Never — it's always unnecessary complexity",
            "For large, frequently changing knowledge bases that have outgrown simple uploads",
            "Only for personal, single-user projects",
          ],
          answer: 2,
          explain: "RAG is worth its added complexity once you've genuinely outgrown simple file uploads — not as a default starting point.",
        },
      ],
    },
    {
      id: "agents-that-take-action",
      title: "Agents That Take Action",
      summary: "From answering questions to taking multi-step action on your behalf — with guardrails.",
      icon: "network",
      lessons: [
        {
          title: "From answering to acting",
          html: `
            <p>An <strong>agent</strong> is an AI system that can use tools &mdash; search the
            web, run code, call other APIs &mdash; and decide what to do next based on the
            results, often across several steps, rather than replying once and stopping. This is
            the natural next step past the single-shot assistants from the Builders course.</p>
          `,
        },
        {
          title: "Giving an agent tools, safely",
          html: `
            <p>Every tool you give an agent expands what it can do &mdash; and what can go wrong
            if it misuses that tool. Start with the smallest set of tools that gets the job
            done, and add more only when a real need shows up. A narrowly-scoped agent is far
            easier to trust and debug than a maximally capable one.</p>
          `,
        },
        {
          title: "Multi-agent handoffs",
          html: `
            <p>Recall the "different hat" trick from the Builders course &mdash; a researcher
            persona, then an editor persona, in separate steps. Multi-agent systems automate
            exactly that: a research agent hands its findings to a writing agent, which hands a
            draft to a review agent. Each agent stays focused on one job, which tends to produce
            more reliable results than one agent trying to do everything.</p>
          `,
        },
        {
          title: "Keeping a human in the loop",
          html: `
            <p>For anything consequential &mdash; sending money, deleting data, publishing
            publicly, contacting a real customer &mdash; build in an explicit approval
            checkpoint where a person reviews before the agent proceeds. Full autonomy is
            something to earn gradually, the same way you'd extend trust to a new employee, not
            something to grant by default.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What distinguishes an agent from a single-shot AI assistant?",
          options: [
            "Nothing, they're identical",
            "An agent can use tools and take multi-step action based on results, not just reply once",
            "Agents never make any decisions",
            "Agents can only generate images",
          ],
          answer: 1,
          explain: "Agents use tools and decide on next steps across multiple turns, going beyond a single reply.",
        },
        {
          q: "What's the recommended approach to giving an agent tools?",
          options: [
            "Give it every available tool immediately",
            "Tools make no difference to an agent's risk",
            "Never give an agent any tools at all",
            "Start with the smallest set of tools that gets the job done",
          ],
          answer: 3,
          explain: "A narrowly-scoped tool set is easier to trust and debug than granting maximum capability upfront.",
        },
        {
          q: "What's the benefit of multi-agent handoffs (research → write → review)?",
          options: [
            "It's slower with no real benefit",
            "Each agent stays focused on one job, which tends to produce more reliable results",
            "It removes the need for any human review ever",
            "It only works for image generation",
          ],
          answer: 1,
          explain: "Splitting work across focused, single-purpose agents mirrors the effective 'different hat' pattern and improves reliability.",
        },
        {
          q: "When should you build in a human approval checkpoint for an agent?",
          options: [
            "For anything consequential — spending, deleting, publishing, contacting real people",
            "Only for agents that generate images",
            "Only after something has already gone wrong",
            "Never, agents should always run fully autonomously",
          ],
          answer: 0,
          explain: "High-stakes actions deserve an explicit human review step before an agent proceeds, with full autonomy earned gradually.",
        },
      ],
    },
    {
      id: "shipping-it-for-real",
      title: "Shipping It for Real",
      summary: "Take something from a prototype on your computer to a live tool anyone can use.",
      icon: "rocket",
      lessons: [
        {
          title: "From \"works on my machine\" to live",
          html: `
            <p><strong>Hosting</strong> simply means running your project on a computer
            somewhere else that stays on all the time, instead of your own laptop. Several
            free or low-cost hosting options exist specifically for small AI-powered projects
            &mdash; ask your AI coding assistant to recommend one suited to what you've built and
            walk you through deploying it.</p>
          `,
        },
        {
          title: "Secrets and environment variables, revisited",
          html: `
            <p>The same rule from Level 1 applies even more once something is live: API keys and
            other secrets belong in your hosting platform's environment variable settings, never
            written directly into code &mdash; especially code in a public repository anyone can
            view.</p>
          `,
        },
        {
          title: "A basic security gut-check",
          html: `
            <p>Before anything goes live, ask: what happens if someone sends unexpected or
            malicious input? Basic habits go a long way &mdash; validate what users submit,
            limit how often any one person can hit your tool (rate limiting), and never let raw
            user input directly trigger a high-stakes action without a check in between.</p>
          `,
        },
        {
          title: "Watching your costs",
          html: `
            <p>A live tool anyone can access can also run up a bill quickly if something goes
            wrong (a bug causing a request loop, or unexpectedly heavy use). Set usage limits
            and billing alerts with your AI provider from day one, and consider caching repeated
            identical requests instead of paying for them twice.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What does \"hosting\" mean in plain terms?",
          options: [
            "Running your project on a computer elsewhere that stays on all the time",
            "A synonym for writing code",
            "A type of API key",
            "Deleting your project once it's finished",
          ],
          answer: 0,
          explain: "Hosting means running your project on infrastructure other than your own laptop, so it stays available continuously.",
        },
        {
          q: "Where should API keys live once a project is live?",
          options: [
            "Directly in the code, inside a public repository",
            "Shared in a public chat for convenience",
            "In your hosting platform's environment variable settings",
            "Nowhere — live projects don't need API keys",
          ],
          answer: 2,
          explain: "Environment variable settings on your hosting platform keep secrets out of code anyone can view, especially public repositories.",
        },
        {
          q: "What's a basic security habit for a live tool that takes user input?",
          options: [
            "Security only matters for banking applications",
            "Trust all input completely with no checks",
            "Validate input, limit request rates, and add a check before high-stakes actions",
            "Never allow any user input at all",
          ],
          answer: 2,
          explain: "Basic validation, rate limiting, and a check before consequential actions prevent most common problems.",
        },
        {
          q: "Why set usage limits and billing alerts before going live?",
          options: [
            "Billing alerts are only relevant for large companies",
            "Usage limits make a tool slower for legitimate users",
            "A bug or heavy use could run up costs quickly without limits in place",
            "It's unnecessary since AI usage never costs much",
          ],
          answer: 2,
          explain: "Without limits, a bug or spike in usage can generate unexpectedly high costs — alerts and caps catch this early.",
        },
      ],
    },
    {
      id: "thinking-like-an-ai-engineer",
      title: "Thinking Like an AI Engineer",
      summary: "Evaluate systematically, choose wisely, stay current — and look back at how far you've come.",
      icon: "chart",
      lessons: [
        {
          title: "Evaluating AI output systematically",
          html: `
            <p>Eyeballing a few responses isn't enough once something is running for real. Build
            a small test set &mdash; a handful of example inputs with the answers you'd expect
            &mdash; and check your system against it whenever you change a prompt or switch
            models. This turns "it seems to work" into something you can actually verify.</p>
          `,
        },
        {
          title: "Choosing between models",
          html: `
            <p>Bigger, more capable models cost more and respond more slowly; smaller models are
            faster and cheaper but less capable on hard tasks. A strong default: use a fast,
            cheap model for simple, high-volume tasks, and reserve larger models for the harder
            steps that genuinely need them.</p>
          `,
        },
        {
          title: "Staying current without burning out",
          html: `
            <p>The same principle from the Intermediates course applies here, for a more
            technical audience: follow the release notes or changelog for the specific one or
            two tools you actually use, on a schedule, rather than trying to track the entire AI
            field in real time. Depth in a few tools beats shallow awareness of everything.</p>
          `,
        },
        {
          title: "Look how far you've come",
          html: `
            <p>Beginners. Intermediates. Builders. Creators. Entrepreneurs. Advanced. You started
            at "what does AI even mean" and you've arrived at building, shipping, and evaluating
            real AI-powered systems &mdash; skills that would have required a computer science
            degree to access not long ago. Whatever you build next, for your job, your business,
            or just for yourself, you're no longer waiting for permission or the perfect
            moment. You're already doing it.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "Why build a small test set of example inputs and expected answers?",
          options: [
            "It's only useful for image generation",
            "It replaces the need to ever use the system for real",
            "It's unnecessary busywork",
            "It lets you actually verify a system after changing a prompt or model, instead of just eyeballing it",
          ],
          answer: 3,
          explain: "A test set turns \"seems to work\" into something checkable, especially important after changes to a prompt or model.",
        },
        {
          q: "What's a sensible default when choosing between AI models for different tasks?",
          options: [
            "Use fast, cheap models for simple tasks and reserve larger models for genuinely hard steps",
            "Always use the smallest model regardless of task difficulty",
            "Always use the biggest, most expensive model for everything",
            "Model choice never affects cost or speed",
          ],
          answer: 0,
          explain: "Matching model size and cost to actual task difficulty is a practical default for both budget and performance.",
        },
        {
          q: "What's the recommended way to stay current with AI tools without burning out?",
          options: [
            "Ignore all updates permanently",
            "Try to track every development across the entire AI field in real time",
            "Switch your primary tools every week",
            "Follow the release notes for the one or two specific tools you actually use, on a schedule",
          ],
          answer: 3,
          explain: "Focused, scheduled check-ins on the tools you actually use are far more sustainable than tracking everything.",
        },
      ],
    },
  ],
};
