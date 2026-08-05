// Course content for AI for Intermediates.
// Same engine as the Beginners course, but framed as "levels" and "challenges"
// for a lighter, more energetic tone. Still no coding required.

const COURSE = {
  title: "AI for Intermediates",
  tagline: "You've got the basics down. Now let's put AI to real use — for your job, your business, or just your everyday life. No boring parts, promise.",
  levels: [
    {
      id: "prompting-like-a-pro",
      title: "Prompting Like a Pro",
      summary: "Level up your prompts with techniques that get sharper answers, faster.",
      icon: "wand",
      lessons: [
        {
          title: "Give it an example, not just an instruction",
          html: `
            <p>Beginners write instructions. Pros show examples. This is called
            <strong>few-shot prompting</strong> &mdash; giving the AI one or two samples of
            exactly the output you want before asking for more.</p>
            <p><strong>Instruction only:</strong> "Write a product tagline."<br>
            <strong>With an example:</strong> "Write a product tagline in this style: 'Nike
            &mdash; Just Do It.' Short, punchy, one idea. Now write one for a reusable coffee
            cup brand called Warmly."</p>
            <p>The example does more work than paragraphs of description ever could &mdash;
            the AI matches the pattern, not just the words.</p>
          `,
        },
        {
          title: "Set up custom instructions once, benefit forever",
          html: `
            <p>Most AI assistants let you save standing preferences &mdash; called
            <strong>custom instructions</strong> or a <strong>system prompt</strong> &mdash; so
            you don't have to repeat yourself every conversation.</p>
            <p>Good things to set once: your role ("I run a 3-person landscaping business"),
            your tone preference ("keep replies casual, skip the corporate filler"), and format
            defaults ("default to bullet points, not paragraphs").</p>
            <p>Look for "Custom Instructions," "Personalization," or "Projects" in your AI
            tool's settings &mdash; five minutes of setup saves you from re-explaining yourself
            for months.</p>
          `,
        },
        {
          title: "The refine-in-place loop",
          html: `
            <p>Intermediate users treat the first AI response as a rough draft, then run a tight
            refinement loop instead of starting over:</p>
            <ol>
              <li>Get a first draft.</li>
              <li>Name <em>one</em> specific thing to fix ("cut this in half," "make the second
              paragraph the opener instead").</li>
              <li>Repeat 2&ndash;3 times, one change at a time.</li>
            </ol>
            <p>One precise note per round beats one giant list of notes &mdash; it's easier for
            the AI to nail, and easier for you to judge whether it worked.</p>
          `,
        },
        {
          title: "Build a reusable prompt template",
          html: `
            <p>If you do the same kind of task often (weekly summaries, client emails, meeting
            notes), turn your best prompt into a fill-in-the-blank template you reuse:</p>
            <blockquote>
            "Summarize the meeting notes below into: 1) three decisions made, 2) action items
            with owners, 3) open questions. Keep it under 150 words. Notes: [PASTE NOTES]"
            </blockquote>
            <p>Save it in a notes app or your AI tool's saved-prompts feature. This is the
            single highest-leverage habit in this level &mdash; a few good templates will save
            you hours every month.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What is \"few-shot prompting\"?",
          options: [
            "Asking the AI very briefly, in a few words",
            "Giving the AI one or two examples of the output you want before asking for more",
            "Only using AI a few times a day",
            "A technique exclusive to coding tasks",
          ],
          answer: 1,
          explain: "Few-shot prompting means showing examples of the desired output — the AI matches the pattern shown, which is often more effective than describing it in words.",
        },
        {
          q: "What's the benefit of setting up custom instructions once?",
          options: [
            "It makes responses slower",
            "You stop being able to change your mind later",
            "You avoid repeating your role, tone, and format preferences every conversation",
            "It's required to use any AI tool",
          ],
          answer: 2,
          explain: "Custom instructions are saved standing preferences, so you don't have to re-explain your context and preferences in every new chat.",
        },
        {
          q: "In the \"refine-in-place\" loop, what's the recommended approach?",
          options: [
            "Give one giant list of every fix you want at once",
            "Start a brand new conversation for every small change",
            "Give one specific, focused fix per round",
            "Never ask for revisions, accept the first draft",
          ],
          answer: 2,
          explain: "One precise note per round is easier for the AI to execute correctly and easier for you to evaluate than a long list of simultaneous changes.",
        },
        {
          q: "Why build a reusable prompt template for a recurring task?",
          options: [
            "It's required by most AI tools",
            "It saves time by turning your best prompt into a fill-in-the-blank you reuse",
            "Templates produce worse results than fresh prompts every time",
            "It only works for coding-related tasks",
          ],
          answer: 1,
          explain: "A saved, reusable template for recurring tasks (like weekly summaries) is one of the highest-leverage habits for regular AI users.",
        },
      ],
    },
    {
      id: "build-your-toolkit",
      title: "Build Your AI Toolkit",
      summary: "Move past a single chatbot tab — set up the tools that fit how you actually work.",
      icon: "toolbox",
      lessons: [
        {
          title: "Beyond the default chat window",
          html: `
            <p>Most beginners use AI through one plain chat window. At the intermediate level,
            it's worth knowing three upgrades most major tools offer for free or low cost:</p>
            <ul>
              <li><strong>Custom GPTs / Projects</strong> &mdash; a saved space with its own
              instructions, files, and memory for one specific job (e.g. "Client Email
              Assistant").</li>
              <li><strong>Browser extensions</strong> &mdash; let you trigger AI directly on a
              webpage or document, without copy-pasting.</li>
              <li><strong>File uploads</strong> &mdash; drop in a PDF, spreadsheet, or slide deck
              and ask questions about it directly.</li>
            </ul>
          `,
        },
        {
          title: "Create one dedicated \"space\" for a recurring job",
          html: `
            <p>Pick one task you do often &mdash; replying to customer emails, drafting weekly
            reports, brainstorming social posts &mdash; and set up a dedicated Project or Custom
            GPT for just that job.</p>
            <p>Give it: a name, a short description of the job, your standing preferences (tone,
            format, things to avoid), and, if useful, a few example files. Now every new
            conversation in that space starts already knowing the context &mdash; no re-briefing
            required.</p>
          `,
        },
        {
          title: "Choosing the right tool for the task",
          html: `
            <p>Not every AI tool is interchangeable. A rough rule of thumb:</p>
            <ul>
              <li><strong>Long, careful writing or analysis</strong> &mdash; a chat assistant
              like Claude or ChatGPT.</li>
              <li><strong>Working inside a document you're already editing</strong> &mdash; a
              built-in assistant (Google Docs, Microsoft Word/Excel Copilot).</li>
              <li><strong>Searching for current information</strong> &mdash; a tool with live
              web search enabled, not a model relying on training data alone.</li>
              <li><strong>Images</strong> &mdash; a dedicated image generator, not a text chat
              assistant.</li>
            </ul>
          `,
        },
        {
          title: "A simple two-tool workflow",
          html: `
            <p>You don't need ten tools. A lot of real work gets done with just two, chained
            together: one tool to <em>research or draft</em>, one to <em>polish or reformat</em>.
            Example: draft a report's content in a chat assistant, then paste the final version
            into your document editor's AI to match your team's formatting and tone guide.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What is a \"Custom GPT\" or \"Project\" useful for?",
          options: [
            "Nothing beyond the regular chat window",
            "A dedicated space with saved instructions and context for one specific recurring job",
            "Only for programmers",
            "Generating images exclusively",
          ],
          answer: 1,
          explain: "A dedicated Project/Custom GPT keeps standing context and instructions for a specific recurring task, so you don't re-explain yourself each time.",
        },
        {
          q: "For finding current, up-to-date information, what should you look for?",
          options: [
            "Any chat assistant, since they always know the news",
            "A tool with live web search enabled",
            "An image generator",
            "It doesn't matter which tool you use",
          ],
          answer: 1,
          explain: "A model's training data has a cutoff date — for current information, you need a tool with live web search, not the base model alone.",
        },
        {
          q: "What's a practical two-tool workflow example from this lesson?",
          options: [
            "Using ten different AI tools for a single task",
            "Drafting content in a chat assistant, then polishing/reformatting in your document editor's built-in AI",
            "Only ever using one tool for everything",
            "Avoiding AI tools inside documents entirely",
          ],
          answer: 1,
          explain: "Chaining a drafting tool with a formatting/polishing tool covers a lot of real workplace tasks without needing a huge toolkit.",
        },
      ],
    },
    {
      id: "ai-at-work",
      title: "AI at Work",
      summary: "Real workplace tasks: meetings, reports, spreadsheets, and research.",
      icon: "briefcase",
      lessons: [
        {
          title: "Turn messy notes into a clean summary",
          html: `
            <p>Paste raw meeting notes, a rambling email thread, or voice-to-text transcript
            into an AI assistant and ask for: key decisions, action items with owners, and open
            questions. This single habit is one of the biggest time-savers for anyone in
            meetings regularly.</p>
          `,
        },
        {
          title: "Drafting reports and proposals",
          html: `
            <p>Give the AI your rough bullet points and ask it to expand them into a structured
            first draft &mdash; then you edit, rather than writing from a blank page. Specify
            the audience ("for a non-technical client") and the goal ("to get sign-off on
            budget") so the tone lands right.</p>
          `,
        },
        {
          title: "Getting help inside a spreadsheet",
          html: `
            <p>Modern spreadsheet tools (Excel, Google Sheets) increasingly have built-in AI that
            can explain a formula, suggest one for what you're trying to calculate, or summarize
            a data range in plain English. Try asking it to explain what an existing formula
            does before you edit it &mdash; a great way to learn as you go.</p>
          `,
        },
        {
          title: "Research with a paper trail",
          html: `
            <p>When using AI for research, ask it to cite sources or use a tool with live web
            search so you can click through and verify. Treat the AI's summary as a starting
            map of a topic, not the final word &mdash; especially for anything you'll present or
            publish.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's a high-value habit for anyone who attends a lot of meetings?",
          options: [
            "Never taking notes at all",
            "Pasting raw notes into AI and asking for decisions, action items, and open questions",
            "Recording every meeting but never reviewing it",
            "Manually retyping notes with no AI help",
          ],
          answer: 1,
          explain: "Turning messy notes into a structured summary (decisions, owners, open questions) is one of the biggest everyday time-savers.",
        },
        {
          q: "When drafting a report with AI, what should you specify for best results?",
          options: [
            "Nothing — just say \"write a report\"",
            "The audience and the goal of the document",
            "Only the desired page count",
            "The exact font to use",
          ],
          answer: 1,
          explain: "Naming the audience and goal helps the AI match the right tone and structure for the document's actual purpose.",
        },
        {
          q: "When using AI for research you plan to present or publish, what should you do?",
          options: [
            "Treat its summary as the final, verified word",
            "Ask for sources or use live web search, and verify before relying on it",
            "Avoid using AI for research entirely",
            "Only trust research from image generators",
          ],
          answer: 1,
          explain: "For anything you'll share publicly, verify AI-assisted research against real, checkable sources.",
        },
      ],
    },
    {
      id: "automate-the-boring-stuff",
      title: "Automate the Boring Stuff",
      summary: "Light, no-code automation — let AI and simple tools handle the repetitive parts.",
      icon: "gear",
      lessons: [
        {
          title: "What \"no-code automation\" means",
          html: `
            <p>Tools like Zapier and Make let you connect apps together with simple "when this
            happens, do that" rules &mdash; no programming required. Example: "when I get an
            email with an attachment, save it to a folder and summarize it with AI."</p>
            <p>You don't need to master these tools today &mdash; just know they exist, and that
            AI steps (summarize, categorize, draft a reply) can slot into them.</p>
          `,
        },
        {
          title: "Batching instead of one-at-a-time",
          html: `
            <p>If you have ten similar items to process (product descriptions, review replies,
            short bios), paste them all into one prompt with clear separators and ask for the
            same transformation on each &mdash; rather than doing ten separate conversations.
            It's faster and keeps the style consistent across all of them.</p>
          `,
        },
        {
          title: "A simple custom chatbot for one repeatable job",
          html: `
            <p>Recall the "dedicated space" idea from Level 2 &mdash; the natural next step is
            turning it into something teammates can use too. Many tools let you share a
            Custom GPT or Project link, effectively giving a coworker a mini AI assistant
            pre-loaded with your team's context, without them needing to build anything.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What does no-code automation (like Zapier or Make) let you do?",
          options: [
            "Write custom software from scratch",
            "Connect apps with simple \"when this happens, do that\" rules, no programming required",
            "Only automate email, nothing else",
            "Replace all human review of AI output",
          ],
          answer: 1,
          explain: "No-code tools let non-programmers connect apps and trigger actions — including AI steps — through simple rule-based automations.",
        },
        {
          q: "What's the advantage of \"batching\" similar AI tasks together?",
          options: [
            "It always produces worse results",
            "It's faster and keeps style consistent across all items versus one-at-a-time",
            "It only works for image generation",
            "AI tools don't allow batching",
          ],
          answer: 1,
          explain: "Processing similar items together in one prompt is more efficient and keeps output consistent.",
        },
        {
          q: "How can a dedicated AI space help a whole team, not just you?",
          options: [
            "It can't be shared with others",
            "It can be shared as a link, giving teammates a pre-loaded mini assistant without setup",
            "Only the original creator can ever use it",
            "Sharing requires teaching everyone to code",
          ],
          answer: 1,
          explain: "Many tools support sharing a Custom GPT/Project link so teammates get the same pre-loaded context instantly.",
        },
      ],
    },
    {
      id: "think-like-an-editor",
      title: "Think Like an Editor",
      summary: "Sharper skills for catching mistakes, bias, and bad advice before they cost you.",
      icon: "magnifier",
      lessons: [
        {
          title: "Spotting hallucinations in the wild",
          html: `
            <p>Hallucinations often look confident, specific, and plausible &mdash; that's what
            makes them risky. Red flags worth a second look: oddly precise statistics with no
            source, quotes you can't find elsewhere, citations that don't exist when you search
            for them, and dates or numbers that don't quite add up.</p>
          `,
        },
        {
          title: "A 60-second fact-check habit",
          html: `
            <p>For anything that matters, spend 60 seconds before you hit send or publish: pick
            the one or two claims doing the most work, and check them against an independent
            source. This habit catches most costly mistakes for a small, consistent time cost.</p>
          `,
        },
        {
          title: "Recognizing bias in AI output",
          html: `
            <p>Ask yourself: does this answer represent only one perspective as if it were the
            only one? Would a different phrasing of my question have gotten a noticeably
            different answer? If something feels one-sided, ask the AI directly for
            counterpoints or alternative viewpoints &mdash; it usually can provide them when
            asked.</p>
          `,
        },
        {
          title: "What not to paste into AI tools at work",
          html: `
            <p>Before pasting something into an AI tool, ask: would I be comfortable if this
            appeared in a screenshot? Avoid pasting client data, unreleased financials,
            passwords, or anything covered by a confidentiality agreement unless your
            organization has explicitly approved that tool for it. When unsure, anonymize
            details or check with your IT/compliance team first.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's a red flag that might indicate an AI hallucination?",
          options: [
            "The AI says it's not fully sure",
            "An oddly precise statistic with no source, or a citation that doesn't exist when checked",
            "A short, simple answer",
            "The AI asks a clarifying question",
          ],
          answer: 1,
          explain: "Confident, specific-sounding but unsourced or unverifiable details are classic hallucination red flags.",
        },
        {
          q: "What is the recommended \"60-second fact-check habit\"?",
          options: [
            "Never fact-check AI output, it wastes time",
            "Check the one or two most load-bearing claims against an independent source before publishing",
            "Fact-check every single word in a response",
            "Only fact-check numbers, never text claims",
          ],
          answer: 1,
          explain: "Focusing a quick check on the claims doing the most work catches most costly mistakes efficiently.",
        },
        {
          q: "What should you do before pasting sensitive work information into an AI tool?",
          options: [
            "Paste it — AI tools are always fully private",
            "Check if it's appropriate to share, and avoid it unless your organization has approved that tool for it",
            "Only avoid this for financial data, everything else is fine",
            "Ask a coworker to paste it for you instead",
          ],
          answer: 1,
          explain: "Confidential or sensitive data should only go into tools your organization has explicitly approved for that use.",
        },
      ],
    },
    {
      id: "make-ai-a-habit",
      title: "Make AI a Habit",
      summary: "Turn everything so far into a routine that actually sticks.",
      icon: "compass",
      lessons: [
        {
          title: "Small, repeatable habits beat big one-off efforts",
          html: `
            <p>The people who get the most value from AI aren't the ones who use it constantly
            &mdash; they're the ones who've built two or three small, repeatable habits: a
            weekly summary prompt, a proofreading pass before sending important emails, a
            monthly review of what's working and what isn't.</p>
          `,
        },
        {
          title: "Staying current without the overwhelm",
          html: `
            <p>AI tools change fast, but you don't need to track every release. Pick one trusted
            source (a newsletter, a single tool's official blog) and check in monthly rather
            than trying to follow everything in real time. Most core skills from this course
            will stay useful regardless of which specific tool is trending.</p>
          `,
        },
        {
          title: "Using AI professionally and ethically",
          html: `
            <p>A simple standard to hold yourself to at work: be transparent when AI played a
            significant role in something you're presenting as your own; keep sensitive data out
            of tools your organization hasn't approved; and always apply your own judgment as
            the final check before something goes out the door.</p>
          `,
        },
        {
          title: "Where to go from here",
          html: `
            <p>You've now covered sharper prompting, a real toolkit, workplace applications,
            light automation, critical evaluation, and habit-building. The best next step is
            simple: pick one habit from this level and use it for a week before adding another.
            Small, consistent use beats a single big binge every time.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "According to this lesson, who tends to get the most value from AI long-term?",
          options: [
            "People who use it constantly for everything",
            "People who build a few small, repeatable habits around it",
            "People who never use the same prompt twice",
            "People who only use the newest tool available",
          ],
          answer: 1,
          explain: "A few consistent, repeatable habits tend to compound into more value than sporadic heavy use.",
        },
        {
          q: "What's a sustainable way to stay current with fast-changing AI tools?",
          options: [
            "Try to track every single release in real time",
            "Pick one trusted source and check in monthly",
            "Ignore all updates permanently",
            "Switch your primary tool every week",
          ],
          answer: 1,
          explain: "Checking in periodically with one trusted source is far more sustainable than trying to follow everything as it happens.",
        },
        {
          q: "What's the recommended way to start applying everything from this course?",
          options: [
            "Try to adopt every habit at once immediately",
            "Pick one habit, use it for a week, then add another",
            "Wait until you have a full free week to start",
            "Only apply these skills if given formal training first",
          ],
          answer: 1,
          explain: "Starting with one habit and building consistency beats trying to overhaul your whole workflow at once.",
        },
      ],
    },
  ],
};
