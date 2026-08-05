// Course content for AI for Creators.
// Level 4 in the I CAN + AI series: using AI for images, video, design, and
// writing without losing your own voice. Still no coding required.

const COURSE = {
  title: "AI for Creators",
  tagline: "The idea you've been sitting on doesn't have to stay in your head. AI can help you finally make it — images, video, design, and writing that still sound and look like you.",
  levels: [
    {
      id: "your-creative-voice",
      title: "Finding Your Creative Voice with AI",
      summary: "Use AI to explore more ideas, faster — without losing what makes your work yours.",
      icon: "spark",
      lessons: [
        {
          title: "AI as a brainstorming partner, not a replacement",
          html: `
            <p>The biggest creative win from AI isn't the final piece &mdash; it's the volume of
            rough options it can generate before you've committed to one direction. Ask for 8
            headline options, 6 color directions, or 5 different openings for an essay, then pick
            and combine what resonates. You're still the editor making the calls.</p>
          `,
        },
        {
          title: "Describe your style, not just your subject",
          html: `
            <p>Generic prompts get generic results. Instead of "write a caption," try "write a
            caption in my style: short sentences, a little dry humor, no exclamation points."
            The more specifically you can name your own style, the more the output will actually
            sound like you &mdash; or at least give you something worth editing into your voice.</p>
          `,
        },
        {
          title: "Build a personal style sheet",
          html: `
            <p>Keep a short running note of what "sounds like you": words you'd never use, a
            tone you always want (warm? blunt? playful?), and 2&ndash;3 examples of past work
            you're proud of. Paste this into any AI conversation as context, and reuse it &mdash;
            it's the single fastest way to keep AI-assisted work from sounding generic.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's the biggest creative advantage of using AI for brainstorming?",
          options: [
            "It replaces the need for your own judgment",
            "It generates a high volume of rough options quickly, for you to pick and combine from",
            "It only works for professional writers",
            "It guarantees the first idea is the best one",
          ],
          answer: 1,
          explain: "AI is excellent at generating many rough options fast — you still act as the editor choosing and combining what works.",
        },
        {
          q: "Why does describing your style (not just your subject) improve results?",
          options: [
            "It doesn't make a difference",
            "It helps the output actually sound like you instead of generic AI text",
            "It's only relevant for image generation",
            "It slows down the response significantly",
          ],
          answer: 1,
          explain: "Naming specific stylistic preferences steers the output toward something closer to your own voice.",
        },
        {
          q: "What's a \"personal style sheet\" used for?",
          options: [
            "Tracking your AI subscription costs",
            "A running note of your tone and style preferences to paste into AI conversations as context",
            "A legal document required to use AI tools",
            "A list of AI tools you're not allowed to use",
          ],
          answer: 1,
          explain: "A personal style sheet is a reusable reference that keeps AI-assisted output consistent with your actual voice.",
        },
      ],
    },
    {
      id: "ai-images-101",
      title: "AI-Generated Images 101",
      summary: "Write prompts that get you closer to the image in your head, and know the limits.",
      icon: "image",
      lessons: [
        {
          title: "The anatomy of an image prompt",
          html: `
            <p>Strong image prompts usually cover: <strong>subject</strong> (what's in it),
            <strong>style</strong> (photo, illustration, watercolor, 3D render), <strong>mood
            or lighting</strong> (warm, moody, bright and airy), and <strong>composition</strong>
            (close-up, wide shot, from above). Layering these gets you much closer than a single
            vague sentence.</p>
          `,
        },
        {
          title: "Iterate instead of restarting",
          html: `
            <p>Treat your first image as a starting point. Most tools let you refine: "make the
            background simpler," "warmer lighting," "move the subject to the left." Small,
            specific adjustments get you to a usable result faster than regenerating from scratch
            each time.</p>
          `,
        },
        {
          title: "Know the current limits",
          html: `
            <p>AI image tools still commonly struggle with: readable text inside images, exact
            hand and finger details, and staying perfectly consistent across multiple generations
            of "the same" character or product. Plan around these rather than fighting them &mdash;
            add text separately in a design tool, for example.</p>
          `,
        },
        {
          title: "Using images commercially, responsibly",
          html: `
            <p>Before using an AI image in something you'll publish or sell, check your specific
            tool's usage rights &mdash; they vary by provider and plan. Avoid generating images
            that closely mimic a specific living artist's style for commercial use, and disclose
            AI involvement where it's expected or required.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "Which combination makes for a strong image prompt?",
          options: [
            "Subject only, nothing else",
            "Subject, style, mood/lighting, and composition together",
            "Just the word \"nice\"",
            "Only technical camera settings",
          ],
          answer: 1,
          explain: "Layering subject, style, mood, and composition gets you far closer to the image you have in mind than a single vague description.",
        },
        {
          q: "What's a more effective approach than regenerating from scratch each time?",
          options: [
            "Making small, specific refinements to your current result",
            "Always starting over with a completely new prompt",
            "Never adjusting anything after the first generation",
            "Only using the tool's random button",
          ],
          answer: 0,
          explain: "Iterating with specific, targeted adjustments usually gets you to a usable image faster than starting over repeatedly.",
        },
        {
          q: "What's a commonly known current limitation of AI image tools?",
          options: [
            "They can never generate any image at all",
            "Readable text, exact hand details, and consistency across generations",
            "They only work in black and white",
            "They require a coding background to use",
          ],
          answer: 1,
          explain: "Text rendering, hand/finger accuracy, and staying visually consistent across multiple generations remain common weak spots.",
        },
        {
          q: "What should you check before using an AI image commercially?",
          options: [
            "Nothing, all AI images are automatically free to use anywhere",
            "Your specific tool's usage rights, since they vary by provider and plan",
            "Only the image's file size",
            "Whether it's your favorite color",
          ],
          answer: 1,
          explain: "Commercial usage rights differ between AI image tools and plans, so it's worth checking before publishing or selling work that uses them.",
        },
      ],
    },
    {
      id: "video-and-audio",
      title: "Video & Audio, Made Easier",
      summary: "Scripts, captions, voice, and simple edits — AI as a production assistant.",
      icon: "clapper",
      lessons: [
        {
          title: "Scripting and storyboarding",
          html: `
            <p>Before touching any video tool, use AI to turn a rough idea into a short script or
            beat-by-beat outline: hook, main point, call to action. Ask for 2&ndash;3 alternate
            hooks so you can test which grabs attention fastest &mdash; the first few seconds
            matter most.</p>
          `,
        },
        {
          title: "Captions and subtitles",
          html: `
            <p>AI-generated captions and transcripts save enormous editing time and make content
            accessible to more viewers. Always do a quick read-through pass afterward &mdash;
            names, jargon, and numbers are the most common places auto-captions get things
            wrong.</p>
          `,
        },
        {
          title: "AI voice, used thoughtfully",
          html: `
            <p>AI voice generation is useful for narration, placeholder audio while editing, or
            translating content into another language in your own cloned voice (where the tool
            supports it, with your consent). Be transparent with your audience when a voice is
            AI-generated, and check your platform's disclosure requirements.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's a good first step before touching a video editing tool?",
          options: [
            "Start filming immediately with no plan",
            "Use AI to turn a rough idea into a short script or beat-by-beat outline",
            "Skip planning entirely for short videos",
            "Only plan the ending",
          ],
          answer: 1,
          explain: "A quick AI-assisted script or outline, including alternate hooks, saves time and improves the finished video.",
        },
        {
          q: "What should you always do after generating AI captions or a transcript?",
          options: [
            "Publish immediately without checking",
            "Do a quick read-through pass, especially for names, jargon, and numbers",
            "Delete the original audio",
            "Nothing further is needed",
          ],
          answer: 1,
          explain: "Auto-captions most often make mistakes on names, jargon, and numbers — a quick check catches these before publishing.",
        },
        {
          q: "What's important when using AI-generated voice narration publicly?",
          options: [
            "Nothing, disclosure is never necessary",
            "Being transparent with your audience and checking platform disclosure requirements",
            "It must always be your own real voice legally",
            "AI voice can never be used for narration",
          ],
          answer: 1,
          explain: "Transparency about AI-generated voice, plus following your platform's specific disclosure rules, is the responsible approach.",
        },
      ],
    },
    {
      id: "design-without-a-degree",
      title: "Design Without a Design Degree",
      summary: "Layouts, palettes, and simple graphics — AI as a design collaborator.",
      icon: "palette",
      lessons: [
        {
          title: "Getting a starting layout",
          html: `
            <p>Describe the goal, not just "make it pretty": "a one-page flyer for a weekend
            farmers market, friendly and colorful, easy to read from a distance." AI-assisted
            design tools (and design-savvy chat assistants) can suggest a starting layout and
            hierarchy you then adjust, rather than staring at a blank canvas.</p>
          `,
        },
        {
          title: "Picking a color palette that actually works",
          html: `
            <p>Ask for a palette built around one anchor color plus a stated mood ("calm and
            trustworthy" vs. "bold and energetic") and a use case (web, print, social). Request
            hex codes directly so you can reuse the exact palette consistently across everything
            you make.</p>
          `,
        },
        {
          title: "Simple graphics and slides",
          html: `
            <p>For icons, simple illustrations, and presentation slides, AI tools can generate a
            usable first pass fast. Keep a consistent style (same illustration style, same icon
            set, same slide template) across a project &mdash; consistency reads as
                more professional than any single perfect graphic.</p>
          `,
        },
        {
          title: "Iterating on a logo concept",
          html: `
            <p>Use AI to explore logo directions &mdash; shapes, moods, symbol ideas &mdash;
            before ever hiring a designer or committing to software. Treat the output as mood
            board material, not a finished, launch-ready logo; a professional pass (human or
            vector software) is usually still worth it for something you'll use long-term.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What makes a design prompt more effective than \"make it pretty\"?",
          options: [
            "Adding more exclamation points",
            "Describing the actual goal, audience, and context",
            "Removing all details from the request",
            "Only specifying a file format",
          ],
          answer: 1,
          explain: "A goal-oriented, specific prompt gives the AI a real design brief to work from instead of a vague aesthetic wish.",
        },
        {
          q: "What should you request when asking AI for a color palette?",
          options: [
            "Nothing specific, colors don't need names",
            "An anchor color, a stated mood, a use case, and hex codes for reuse",
            "Only the color black",
            "A random palette generator with no input",
          ],
          answer: 1,
          explain: "Anchoring the request with a color, mood, use case, and exact hex codes makes the palette usable and consistent going forward.",
        },
        {
          q: "Why does consistency matter more than any single \"perfect\" graphic?",
          options: [
            "It doesn't, only individual pieces matter",
            "Consistent style across a project reads as more professional overall",
            "Consistency is only relevant for large companies",
            "It's impossible to be consistent with AI tools",
          ],
          answer: 1,
          explain: "A consistent visual style across a project builds a more professional, cohesive impression than isolated standout pieces.",
        },
        {
          q: "How should you treat an AI-generated logo concept?",
          options: [
            "As a final, launch-ready logo",
            "As mood board material worth a professional pass before long-term use",
            "As something that can never be useful",
            "As a legally protected trademark automatically",
          ],
          answer: 1,
          explain: "AI logo output is a great starting point for direction, but a professional finishing pass is usually worth it for a logo you'll use long-term.",
        },
      ],
    },
    {
      id: "writing-that-sounds-like-you",
      title: "Writing That Doesn't Sound Like AI",
      summary: "Edit past the generic tone, and repurpose one piece of writing many ways.",
      icon: "pen",
      lessons: [
        {
          title: "Spotting \"generic AI voice\"",
          html: `
            <p>Common tells: overly balanced "on one hand, on the other hand" phrasing, stacks of
            adjectives, and a relentlessly upbeat tone regardless of subject. Once you can name
            these patterns, you can specifically ask AI to avoid them &mdash; or edit them out
            yourself in a fast pass.</p>
          `,
        },
        {
          title: "Writing hooks and headlines that earn attention",
          html: `
            <p>Ask for 8&ndash;10 headline or opening-line options at once, then pick the one
            that's most specific and surprising &mdash; specificity almost always beats a vague,
            broad claim. "Generic" and "specific" versions of the same idea make the difference
            obvious side by side.</p>
          `,
        },
        {
          title: "One piece, many formats",
          html: `
            <p>Write the long-form version once (an article, a video script, a talk), then ask AI
            to repurpose it: a short social caption, a 3-slide carousel outline, a one-paragraph
            email version. This is one of the highest-leverage habits for creators who publish
            across multiple platforms.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "Which of these is a common sign of \"generic AI voice\"?",
          options: [
            "Very specific, concrete details",
            "Overly balanced phrasing and stacks of generic adjectives",
            "A short, punchy sentence",
            "A clear point of view",
          ],
          answer: 1,
          explain: "Excessive hedging and generic adjective stacking are classic tells of unedited AI-generated text.",
        },
        {
          q: "When choosing between headline options, what usually wins?",
          options: [
            "The vaguest, broadest claim",
            "The most specific and surprising option",
            "The longest option",
            "Whichever uses the most exclamation points",
          ],
          answer: 1,
          explain: "Specific, surprising headlines consistently outperform vague, broad ones.",
        },
        {
          q: "What's the benefit of writing a long-form piece once and repurposing it?",
          options: [
            "It's not useful, each format needs a fresh start",
            "It's one of the highest-leverage habits for creators publishing across platforms",
            "It only works for video content",
            "It requires rewriting from scratch each time anyway",
          ],
          answer: 1,
          explain: "Repurposing one solid long-form piece into multiple formats saves significant time across platforms.",
        },
      ],
    },
    {
      id: "building-a-body-of-work",
      title: "Building a Body of Work",
      summary: "Consistency, credit, and avoiding burnout — the long game of creating with AI.",
      icon: "stack",
      lessons: [
        {
          title: "Batching and a simple content calendar",
          html: `
            <p>Use AI to draft a month of content ideas around a few themes at once, rather than
            starting from zero each time you sit down. A simple calendar &mdash; even just a
            spreadsheet with dates and topics &mdash; keeps a body of work feeling coherent
            instead of scattered.</p>
          `,
        },
        {
          title: "Keeping a consistent voice across platforms",
          html: `
            <p>Reuse your personal style sheet from Level 1 across every platform you post to.
            Audiences build trust through recognizable consistency &mdash; a voice that shifts
            wildly between posts reads as less trustworthy, even if each individual piece is
            good.</p>
          `,
        },
        {
          title: "Giving credit and disclosing AI use",
          html: `
            <p>Norms vary by platform and audience, but a simple default works well: be upfront
            when AI played a substantial role in something you're presenting as creative work,
            and always credit any real photographers, artists, or writers whose work informed
            yours, even indirectly.</p>
          `,
        },
        {
          title: "Avoiding creative burnout",
          html: `
            <p>AI can help you produce more, but more isn't always better for you or your
            audience. Protect time for work with no AI involvement at all &mdash; it keeps your
            underlying voice sharp, and prevents your entire body of work from starting to sound
            interchangeable with everyone else's AI-assisted output.</p>
            <p>Here's the real news: the barrier between "I have an idea" and "I made a thing"
            has never been lower. Whatever you've been meaning to start &mdash; the video series,
            the little shop, the newsletter, the portfolio &mdash; you now have a genuinely
            capable partner to help you get the first version out into the world. That's worth
            celebrating.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What's the benefit of batching content ideas with AI?",
          options: [
            "It removes the need for any planning at all",
            "It avoids starting from zero each time and keeps a body of work coherent",
            "It guarantees higher engagement automatically",
            "It only works for video content",
          ],
          answer: 1,
          explain: "Batching a month of ideas around a few themes at once creates more coherence than ad hoc, one-off content.",
        },
        {
          q: "Why does a consistent voice across platforms matter?",
          options: [
            "It doesn't matter to audiences",
            "Recognizable consistency builds audience trust over time",
            "Platforms require identical content everywhere",
            "It's only relevant for large brands",
          ],
          answer: 1,
          explain: "A voice that shifts wildly between posts reads as less trustworthy, even when individual pieces are good on their own.",
        },
        {
          q: "What's a good default practice around disclosing AI involvement in creative work?",
          options: [
            "Never mention it under any circumstances",
            "Be upfront when AI played a substantial role, and credit real people whose work informed yours",
            "Only disclose if legally forced to",
            "Disclosure is never relevant to creative work",
          ],
          answer: 1,
          explain: "Being transparent about substantial AI involvement, and crediting human influences, is a sound default practice.",
        },
        {
          q: "Why protect time for work with no AI involvement at all?",
          options: [
            "It has no real benefit",
            "It keeps your underlying voice sharp and your work from sounding interchangeable with others'",
            "AI-free work is required by law",
            "It's only relevant for beginners",
          ],
          answer: 1,
          explain: "Regular AI-free creative practice keeps your distinct voice sharp instead of letting output blur together with everyone else's AI-assisted work.",
        },
      ],
    },
  ],
};
