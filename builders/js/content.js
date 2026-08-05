// Course content for AI for Builders.
// The step after Intermediates: actually building things with AI — still no
// coding, still fun, but hands-on. Ends with a light preview of what Advanced
// will cover, without teaching advanced material yet.

const COURSE = {
  title: "AI for Builders",
  tagline: "You know the moves. Now let's actually build things with AI — a real assistant, a real workflow, something you'll keep using. Still fun. Still not a coding class.",
  levels: [
    {
      id: "build-your-first-assistant",
      title: "Build Your First Custom Assistant",
      summary: "Go from a blank Project to a working AI assistant built for one real job.",
      icon: "wrench",
      lessons: [
        {
          title: "Pick one job worth building for",
          html: `
            <p>The best first build is narrow and real: one recurring task you already do by
            hand. Good candidates: answering the same 10 customer questions, drafting replies in
            your team's voice, planning meals for the week, or turning your class notes into
            flashcards.</p>
            <p>Avoid "an assistant that does everything" &mdash; a focused assistant is easier to
            build well and far more useful day to day.</p>
          `,
        },
        {
          title: "Set it up end to end",
          html: `
            <p>In your AI tool's Custom GPT / Project feature, fill in four things:</p>
            <ol>
              <li><strong>Name</strong> &mdash; specific, not generic ("Client FAQ Bot," not "Helper").</li>
              <li><strong>Instructions</strong> &mdash; the job, the tone, and anything it should
              never do.</li>
              <li><strong>Knowledge</strong> &mdash; upload the 2&ndash;5 files it actually needs
              (a price list, a style guide, your notes).</li>
              <li><strong>Starter prompts</strong> &mdash; two or three example questions, so it's
              obvious how to use it.</li>
            </ol>
          `,
        },
        {
          title: "Test it like a stranger would",
          html: `
            <p>Before trusting a build, throw a few curveballs at it: an edge-case question, a
            slightly rude message, a question outside its knowledge. See what it does. If it
            guesses instead of admitting it doesn't know, add an instruction like "if you're not
            sure, say so and suggest who to ask instead."</p>
          `,
        },
        {
          title: "Ship it, then improve it",
          html: `
            <p>Start using your build for real instead of endlessly tweaking it in private.
            Real use surfaces the gaps that testing alone won't. Keep a running note of odd
            answers it gives, and revisit the instructions every couple of weeks &mdash; small,
            regular tune-ups beat one perfect setup on day one.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What makes a good first assistant to build?",
          options: [
            "One that tries to handle absolutely everything",
            "A narrow assistant built for one real, recurring task",
            "One with no instructions, so it stays flexible",
            "One that never gets tested before use",
          ],
          answer: 1,
          explain: "A focused assistant built around one real, recurring job is easier to build well and more useful than a do-everything attempt.",
        },
        {
          q: "Which of these is NOT one of the four setup basics for a custom assistant?",
          options: [
            "A specific name",
            "Clear instructions covering job, tone, and limits",
            "A public social media account",
            "Starter prompts showing how to use it",
          ],
          answer: 2,
          explain: "The four setup basics are name, instructions, knowledge files, and starter prompts — not a social media account.",
        },
        {
          q: "What should you do if your assistant guesses instead of admitting uncertainty?",
          options: [
            "Nothing, guessing is fine",
            "Delete the assistant entirely",
            "Add an instruction telling it to say so and suggest who to ask instead",
            "Remove all its knowledge files",
          ],
          answer: 2,
          explain: "An explicit instruction to admit uncertainty (rather than guess) makes the assistant far more trustworthy.",
        },
        {
          q: "What's the recommended approach after your first build is working?",
          options: [
            "Never touch it again",
            "Keep tweaking it privately forever before ever using it",
            "Start using it for real and revisit the instructions periodically based on what you learn",
            "Rebuild it from scratch every week",
          ],
          answer: 2,
          explain: "Real use surfaces gaps testing alone misses — regular small tune-ups beat chasing a perfect setup before ever shipping.",
        },
      ],
    },
    {
      id: "design-a-workflow",
      title: "Design a Multi-Step AI Workflow",
      summary: "Chain a few focused steps together to get results one prompt can't reach alone.",
      icon: "flow",
      lessons: [
        {
          title: "Why chaining beats one giant prompt",
          html: `
            <p>A single, overloaded prompt asking for research, a draft, and polish all at once
            usually produces a mediocre version of all three. Breaking it into separate steps
            &mdash; each with one clear job &mdash; consistently produces better results, because
            the AI can focus fully on each one.</p>
          `,
        },
        {
          title: "A simple three-step pattern",
          html: `
            <p>A workflow that works for almost any writing or planning task:</p>
            <ol>
              <li><strong>Draft</strong> &mdash; get the raw content down, roughly.</li>
              <li><strong>Critique</strong> &mdash; ask the AI (or a second, differently-prompted
              conversation) to critique the draft against a specific standard: "what would a
              skeptical editor cut?"</li>
              <li><strong>Refine</strong> &mdash; apply the critique in a final pass.</li>
            </ol>
          `,
        },
        {
          title: "Storyboard before you automate",
          html: `
            <p>Before wiring anything up, sketch the workflow on paper or in a notes app: what
            goes in at each step, what comes out, and what a human needs to check. This 10-minute
            habit catches design problems early &mdash; much cheaper to fix on paper than after
            you've built it.</p>
          `,
        },
        {
          title: "Give each step a different \"hat\"",
          html: `
            <p>A powerful trick: assign each step a distinct role, even within the same tool. "As
            a first-draft writer, write X" for step one; "As a strict editor who hates fluff,
            review this draft" for step two. Different framing produces meaningfully different,
            complementary output &mdash; even from the same underlying model.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "Why does breaking a task into separate steps often beat one giant prompt?",
          options: [
            "It doesn't — one prompt is always better",
            "Each step gets the AI's full focus on one clear job, improving results",
            "It's required by every AI tool",
            "It only matters for coding tasks",
          ],
          answer: 1,
          explain: "Focused, single-purpose steps consistently outperform one overloaded prompt trying to do everything at once.",
        },
        {
          q: "In the draft → critique → refine pattern, what is the critique step for?",
          options: [
            "Starting over from scratch",
            "Evaluating the draft against a specific standard before the final pass",
            "Skipping straight to publishing",
            "Deleting the original draft",
          ],
          answer: 1,
          explain: "The critique step evaluates the draft against a clear standard, generating specific notes to apply in the refine step.",
        },
        {
          q: "What's the benefit of \"storyboarding\" a workflow before automating it?",
          options: [
            "It wastes time better spent building",
            "It catches design problems early, when they're cheap to fix",
            "It's only useful for large teams",
            "It replaces the need to ever test the workflow",
          ],
          answer: 1,
          explain: "A quick sketch of inputs, outputs, and checkpoints catches problems while they're still cheap to fix.",
        },
        {
          q: "What does giving each workflow step a different \"hat\" (role) accomplish?",
          options: [
            "Nothing, it's purely decorative",
            "It produces meaningfully different, complementary output even from the same model",
            "It slows down every response significantly",
            "It only works with multiple different AI tools",
          ],
          answer: 1,
          explain: "Distinct role framing at each step produces genuinely different angles on the same content, even within one tool.",
        },
      ],
    },
    {
      id: "work-with-your-own-data",
      title: "Work With Your Own Documents",
      summary: "Turn a pile of files into something you can actually ask questions.",
      icon: "folder",
      lessons: [
        {
          title: "From one file to a knowledge base",
          html: `
            <p>You already know how to upload one file and ask about it. The next step is
            uploading a small related set &mdash; a handful of policies, past reports, or
            product sheets &mdash; into one Project or Custom GPT, so you can ask questions that
            span all of them at once.</p>
          `,
        },
        {
          title: "Ask across documents, not just within one",
          html: `
            <p>Once several files are loaded, try questions that require connecting them: "Which
            of these three proposals has the lowest total cost?" or "Summarize how our return
            policy changed between these two versions." This cross-document reasoning is where a
            real knowledge base starts paying off versus single-file lookups.</p>
          `,
        },
        {
          title: "Keep it current, or say so",
          html: `
            <p>An assistant built on outdated files will confidently give outdated answers.
            Either commit to refreshing the files on a schedule (monthly is often enough), or add
            an instruction reminding it &mdash; and the people using it &mdash; that the
            knowledge has a "last updated" date.</p>
          `,
        },
        {
          title: "Mind what goes in",
          html: `
            <p>Before uploading anything, apply the same check from earlier in this journey:
            would you be comfortable if this file's contents were seen by someone outside your
            organization? Skip anything confidential unless the tool is specifically approved for
            it, and prefer sanitized or summarized versions when in doubt.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's the benefit of loading a small set of related files instead of just one?",
          options: [
            "There's no benefit, one file is always enough",
            "It enables cross-document questions that span all of them at once",
            "It makes the AI forget its instructions",
            "It's required before you can ask any questions",
          ],
          answer: 1,
          explain: "A small related set of files unlocks cross-document reasoning — questions that a single file couldn't answer alone.",
        },
        {
          q: "What's a risk of a knowledge base built on outdated files?",
          options: [
            "None, files never go out of date",
            "It will confidently give outdated answers unless refreshed or flagged",
            "It automatically updates itself",
            "It stops working entirely",
          ],
          answer: 1,
          explain: "Outdated source files lead to confidently wrong answers — refresh on a schedule or clearly flag the \"last updated\" date.",
        },
        {
          q: "Before uploading a document to a knowledge base, what should you check?",
          options: [
            "Nothing, all documents are safe to upload anywhere",
            "Whether you'd be comfortable if its contents were seen outside your organization",
            "Only the file size",
            "Only whether it's in PDF format",
          ],
          answer: 1,
          explain: "The same privacy check from earlier applies here — confidential material should only go into approved tools.",
        },
      ],
    },
    {
      id: "connect-the-dots",
      title: "Connect the Dots with Automation",
      summary: "Sketch a real trigger-to-action recipe, and meet the words 'API' and 'webhook' without fear.",
      icon: "link",
      lessons: [
        {
          title: "The anatomy of an automation recipe",
          html: `
            <p>Every no-code automation follows the same shape: a <strong>trigger</strong>
            (something that happens), an optional <strong>AI step</strong> (something gets
            drafted, summarized, or categorized), and an <strong>action</strong> (something
            happens as a result). Example: new form response &rarr; AI drafts a reply &rarr;
            reply saved as a draft email for you to review.</p>
          `,
        },
        {
          title: "Sketch your own recipe",
          html: `
            <p>Pick one repetitive task from your week and write it as trigger &rarr; AI step
            &rarr; action, in plain English, before opening any tool. If you can't state it in
            one sentence like that, it's probably two automations, not one &mdash; and that's a
            useful thing to notice before you build anything.</p>
          `,
        },
        {
          title: "API and webhook, in plain English",
          html: `
            <p>An <strong>API</strong> is just a way for two pieces of software to hand data back
            and forth in a structured way &mdash; think of it as a very precise order form
            between two apps. A <strong>webhook</strong> is a message one app sends
            automatically the moment something happens, so another app doesn't have to keep
            checking. You don't need to build either yourself &mdash; no-code tools like Zapier
            and Make handle both behind a simple interface.</p>
          `,
        },
        {
          title: "Keep a human checkpoint",
          html: `
            <p>For anything that leaves your control &mdash; sending an email, posting publicly,
            updating a customer record &mdash; keep a review step in the loop, at least at first.
            Automations that draft-and-hold for approval are almost always the right starting
            point; full auto-send is something to earn once you trust the pattern.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What are the three parts of a basic automation recipe?",
          options: [
            "Input, output, error",
            "Trigger, AI step, action",
            "Start, middle, end",
            "Login, process, logout",
          ],
          answer: 1,
          explain: "The standard shape is: something happens (trigger), AI does something with it (AI step), then something results (action).",
        },
        {
          q: "In plain English, what is a webhook?",
          options: [
            "A type of computer virus",
            "A message one app sends automatically the moment something happens",
            "A physical cable connecting two computers",
            "A password reset mechanism",
          ],
          answer: 1,
          explain: "A webhook is an automatic notification from one app to another when a specific event occurs, avoiding constant manual checking.",
        },
        {
          q: "Why keep a human review checkpoint in early automations?",
          options: [
            "It's not necessary, full automation is always safer",
            "For anything leaving your control, a review step is a safer starting point until you trust the pattern",
            "It's required by law for all automations",
            "Only for automations involving payments",
          ],
          answer: 1,
          explain: "Draft-and-hold for approval is a sensible default for anything that leaves your control, especially early on.",
        },
        {
          q: "If a task can't be described as one trigger → one AI step → one action, what does that suggest?",
          options: [
            "The task is impossible to automate",
            "It's probably two automations, not one",
            "You need to hire a developer",
            "The task should never be automated",
          ],
          answer: 1,
          explain: "Struggling to fit a task into one simple recipe sentence is a sign it's really two (or more) separate automations.",
        },
      ],
    },
    {
      id: "present-and-share",
      title: "Present & Share Your AI Work",
      summary: "Turn AI output into something polished, and share your builds responsibly.",
      icon: "megaphone",
      lessons: [
        {
          title: "From AI draft to finished deliverable",
          html: `
            <p>AI is excellent at drafts, weaker at final polish. Before sharing something
            AI-assisted, run it through a short finishing pass: match your team's formatting,
            re-read it in your own voice, and check that examples and numbers are accurate for
            your actual situation, not just plausible-sounding.</p>
          `,
        },
        {
          title: "Explaining your AI use to others",
          html: `
            <p>If you've built something useful, a short explainer helps others trust and adopt
            it: what it does, what it doesn't do, what data it uses, and how to flag a bad
            answer. A few honest sentences go further than a polished pitch &mdash; people trust
            tools whose limits are stated plainly.</p>
          `,
        },
        {
          title: "Sharing a build with a team",
          html: `
            <p>When you share a Custom GPT or Project link with colleagues, walk them through one
            real example first rather than just sending the link cold. Set expectations about
            what to double-check, and invite them to report odd answers back to you &mdash; that
            feedback is how the build keeps improving.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What is AI generally weaker at compared to drafting?",
          options: [
            "Coming up with initial ideas",
            "Final polish and situational accuracy",
            "Producing any output at all",
            "Following simple formatting rules perfectly every time",
          ],
          answer: 1,
          explain: "AI drafts well but a human finishing pass — checking accuracy for your specific situation and matching your voice — is still valuable.",
        },
        {
          q: "What should a good explainer of your AI build include?",
          options: [
            "Only a marketing pitch, no limitations",
            "What it does, what it doesn't do, what data it uses, and how to flag bad answers",
            "The underlying model's technical architecture",
            "Nothing — let people figure it out themselves",
          ],
          answer: 1,
          explain: "Stating capabilities and limits plainly builds more trust than an unqualified pitch.",
        },
        {
          q: "What's a good practice when first sharing a build with teammates?",
          options: [
            "Send the link with no explanation",
            "Walk them through one real example first and invite feedback on odd answers",
            "Require them to read a technical manual before using it",
            "Never let anyone else use it",
          ],
          answer: 1,
          explain: "A guided first example plus an open feedback channel helps colleagues trust and correctly use a shared build.",
        },
      ],
    },
    {
      id: "whats-next",
      title: "A Peek at What's Next",
      summary: "A light preview of Advanced territory — no need to learn it yet, just to know it's there.",
      icon: "telescope",
      lessons: [
        {
          title: "You've covered a lot of ground",
          html: `
            <p>Between Beginners, Intermediates, and this level, you've gone from "what is AI"
            to building a working assistant, chaining multi-step workflows, working with your own
            documents, sketching real automations, and sharing your work responsibly. That's a
            genuinely useful, practical skill set on its own.</p>
          `,
        },
        {
          title: "A glimpse of what \"Advanced\" will cover",
          html: `
            <p>When you're ready to go further, an Advanced track would explore things like:
            calling AI directly through code for full control, building automations with real
            logic and branching instead of simple recipes, and combining multiple specialized
            AI agents that hand off work to each other. None of that is required to keep getting
            value from everything you've already learned.</p>
          `,
        },
        {
          title: "No rush &mdash; here's your homework instead",
          html: `
            <p>Rather than jumping ahead, the highest-value next step is boring in the best way:
            keep using what you've built. Revisit your assistant in two weeks. Try the
            draft-critique-refine pattern on your next real project. Advanced skills matter far
            more once you have real, everyday habits under you &mdash; and you now do.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "According to this level, what's required before moving on to \"Advanced\" material?",
          options: [
            "Nothing — you should skip straight to Advanced immediately",
            "Nothing is strictly required; real habits from this level matter most first",
            "A coding certification",
            "Completing this course five times",
          ],
          answer: 1,
          explain: "The recommendation is to build real habits with what you've already learned before chasing more advanced material.",
        },
        {
          q: "Which of these is mentioned as part of a future Advanced track?",
          options: [
            "Basic prompt writing",
            "Calling AI directly through code and multi-agent workflows",
            "How to type in a chat box",
            "What AI stands for",
          ],
          answer: 1,
          explain: "Advanced territory includes things like coding against AI directly, branching automation logic, and multi-agent workflows — all previewed, not taught, here.",
        },
        {
          q: "What's the suggested \"homework\" at the end of this level?",
          options: [
            "Immediately start an Advanced course",
            "Keep using what you've built and revisit it in a couple of weeks",
            "Delete your custom assistant and start over",
            "Stop using AI until Advanced content is available",
          ],
          answer: 1,
          explain: "Continued real-world use of what you've already built is the highest-value next step before chasing more advanced skills.",
        },
      ],
    },
  ],
};
