// Course content for the AI for Beginners program.
// Each module has lessons (rendered as HTML strings) and a short quiz.

const COURSE = {
  title: "AI for Beginners",
  tagline: "You don't need a technical background or a head start. In a few short lessons, you'll go from uncertain to confident — and start seeing what's possible for you.",
  modules: [
    {
      id: "welcome",
      title: "Welcome to AI",
      summary: "What \"AI\" actually means, where it came from, and the myths worth dropping.",
      icon: "sparkles",
      lessons: [
        {
          title: "What does \"AI\" actually mean?",
          html: `
            <p>Artificial Intelligence (AI) is a broad term for software that performs tasks
            which normally require human thinking &mdash; recognizing images, understanding
            language, making recommendations, or generating text.</p>
            <p>There's no single "AI brain." Instead, AI is a family of techniques. The version
            most people mean today when they say "AI" is <strong>generative AI</strong>: systems
            like ChatGPT, Claude, and Gemini that can write, summarize, brainstorm, and hold a
            conversation.</p>
            <ul>
              <li><strong>Narrow AI</strong> &mdash; built for one job (spam filters, spell check, face unlock).</li>
              <li><strong>Generative AI</strong> &mdash; creates new text, images, code, or audio from a prompt.</li>
              <li><strong>General AI</strong> &mdash; a human-level, do-anything AI. This does not exist yet.</li>
            </ul>
          `,
        },
        {
          title: "A very short history",
          html: `
            <p>AI has gone through several waves:</p>
            <ol>
              <li><strong>1950s&ndash;1980s &mdash; Rule-based AI.</strong> Programmers hand-wrote every rule ("if X, then Y"). Rigid, but predictable.</li>
              <li><strong>1990s&ndash;2010s &mdash; Machine Learning.</strong> Instead of hand-written rules, systems learned patterns from data (e.g. spam detection, recommendation engines).</li>
              <li><strong>2010s &mdash; Deep Learning.</strong> Neural networks with many layers unlocked huge jumps in image and speech recognition.</li>
              <li><strong>2020s &mdash; Generative AI.</strong> Large Language Models (LLMs) trained on massive amounts of text learned to write, reason, and chat &mdash; putting powerful AI into a simple chat box anyone can use.</li>
            </ol>
          `,
        },
        {
          title: "Myths worth dropping",
          html: `
            <p>Before going further, let's clear up a few common misconceptions:</p>
            <ul>
              <li><strong>"AI understands like a human."</strong> It recognizes patterns in language extremely well, but it doesn't have beliefs, feelings, or true understanding.</li>
              <li><strong>"AI is always right."</strong> AI can sound confident and still be wrong. Always double-check important facts.</li>
              <li><strong>"AI will replace all human judgment."</strong> AI is a tool that's best used <em>with</em> a person reviewing and deciding, not instead of one.</li>
              <li><strong>"You need to code to use AI."</strong> Most people use AI daily through plain chat &mdash; no code required, which is exactly what this course focuses on.</li>
            </ul>
          `,
        },
      ],
      quiz: [
        {
          q: "What is \"generative AI\" best known for?",
          options: [
            "Filtering spam emails only",
            "Creating new text, images, code, or audio from a prompt",
            "Unlocking your phone with your face",
            "Running a spreadsheet formula",
          ],
          answer: 1,
          explain: "Generative AI (like ChatGPT or Claude) creates new content in response to a prompt, rather than just classifying or filtering existing data.",
        },
        {
          q: "Which best describes \"narrow AI\"?",
          options: [
            "An AI that can do literally anything a human can",
            "An AI built to do one specific job well",
            "An AI that only exists in movies",
            "An AI that never makes mistakes",
          ],
          answer: 1,
          explain: "Narrow AI is designed for a single task, like spam filtering or spell check — it doesn't generalize beyond that.",
        },
        {
          q: "True or false: today's AI chat assistants truly \"understand\" the world the way humans do.",
          options: [
            "True &mdash; they think just like people",
            "False &mdash; they recognize patterns in language, not genuine understanding",
          ],
          answer: 1,
          explain: "AI models are extremely good pattern-matchers over language, but they don't have beliefs, consciousness, or lived experience.",
        },
      ],
    },
    {
      id: "how-it-thinks",
      title: "How AI \"Thinks\"",
      summary: "Machine learning and large language models, explained without the jargon.",
      icon: "brain",
      lessons: [
        {
          title: "Machine learning in plain language",
          html: `
            <p>Traditional software follows rules a programmer wrote. Machine learning flips
            that around: instead of writing rules, you show the computer thousands (or billions)
            of examples, and it learns the patterns itself.</p>
            <p>Example: to teach a traditional program to recognize cats in photos, you'd have to
            manually describe "whiskers, pointy ears, fur..." &mdash; nearly impossible to get
            right. A machine learning model instead looks at millions of labeled cat photos and
            learns the pattern of "cat" on its own.</p>
          `,
        },
        {
          title: "What is a Large Language Model (LLM)?",
          html: `
            <p>ChatGPT, Claude, and Gemini are all <strong>Large Language Models</strong>. At a
            basic level, an LLM is trained on huge amounts of text (books, articles, websites)
            and learns to predict <em>the next most likely word</em>, given everything written
            so far.</p>
            <p>Do that prediction really well, at a massive scale, and something surprising
            happens: the model becomes capable of writing essays, explaining concepts,
            translating languages, and holding a conversation &mdash; all from that one core
            skill of "what word comes next."</p>
          `,
        },
        {
          title: "Training vs. using an AI model",
          html: `
            <p>There are two very different phases:</p>
            <ul>
              <li><strong>Training</strong> &mdash; the (extremely expensive, months-long) process where the model learns from data. This is done once by the company that builds the model.</li>
              <li><strong>Inference</strong> &mdash; every time you type a message and the AI replies. This uses the already-trained model; no new learning happens from your single conversation.</li>
            </ul>
            <p>This is why an AI's knowledge has a "cutoff date," and why it won't automatically know about things that happened after it was trained (unless it has a tool to search the web).</p>
          `,
        },
        {
          title: "Why AI sometimes gets things wrong",
          html: `
            <p>Because an LLM is predicting plausible-sounding text rather than looking facts up
            in a database, it can produce answers that sound confident but are wrong. This is
            often called <strong>hallucination</strong>.</p>
            <p>Practical takeaway: treat AI like a very well-read, very fast assistant who
            occasionally misremembers details. For anything important &mdash; numbers, dates,
            citations, legal or medical facts &mdash; verify with a trusted source.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What is the core skill an LLM is trained to do?",
          options: [
            "Search a fixed database of facts",
            "Predict the next most likely word given the text so far",
            "Run mathematical simulations of the physical world",
            "Store every website it has ever seen, word for word",
          ],
          answer: 1,
          explain: "LLMs are trained to predict the next word; at large scale this produces surprisingly capable writing, reasoning, and conversation.",
        },
        {
          q: "What happens during \"inference\"?",
          options: [
            "The company retrains the model from scratch",
            "The model permanently learns from your specific conversation",
            "The already-trained model generates a response to your input",
            "The model downloads new facts from the internet automatically",
          ],
          answer: 2,
          explain: "Inference is just using the already-trained model to generate a response. Your chat doesn't retrain the underlying model.",
        },
        {
          q: "What is a \"hallucination\" in AI?",
          options: [
            "When the AI refuses to answer",
            "When the AI produces a confident-sounding but incorrect answer",
            "When the AI crashes",
            "When the AI asks a clarifying question",
          ],
          answer: 1,
          explain: "Hallucination refers to the model generating plausible-sounding but false or made-up information.",
        },
        {
          q: "Why might an AI not know about very recent events?",
          options: [
            "It refuses to discuss the news",
            "Its knowledge comes from training data with a cutoff date, unless it can search the web",
            "It's against the rules to know about current events",
            "AI models never know any dates",
          ],
          answer: 1,
          explain: "Unless connected to a live search tool, an AI's knowledge reflects the data it was trained on up to a certain date.",
        },
      ],
    },
    {
      id: "meet-assistants",
      title: "Meet the AI Assistants",
      summary: "A quick tour of ChatGPT, Claude, Gemini, and friends &mdash; what they're good at.",
      icon: "chat",
      lessons: [
        {
          title: "The big chat assistants",
          html: `
            <p>Several companies offer free, browser-based AI chat assistants:</p>
            <ul>
              <li><strong>ChatGPT</strong> (OpenAI) &mdash; general-purpose chat, writing, and coding help.</li>
              <li><strong>Claude</strong> (Anthropic) &mdash; strong at careful writing, analysis, and following detailed instructions.</li>
              <li><strong>Gemini</strong> (Google) &mdash; integrates well with Google apps like Docs and Gmail.</li>
              <li><strong>Copilot</strong> (Microsoft) &mdash; built into Windows and Microsoft 365 apps.</li>
            </ul>
            <p>All of these have free tiers that are more than enough for a beginner to learn
            with. You don't need a paid subscription to complete this course or to get real value
            day-to-day.</p>
          `,
        },
        {
          title: "What they're good at",
          html: `
            <ul>
              <li>Explaining a concept in simple terms</li>
              <li>Drafting and editing writing (emails, essays, resumes)</li>
              <li>Summarizing long documents or articles</li>
              <li>Brainstorming ideas</li>
              <li>Helping debug or explain code</li>
              <li>Translating and rephrasing text</li>
            </ul>
          `,
        },
        {
          title: "What they're not good at (yet)",
          html: `
            <ul>
              <li>Guaranteeing 100% factual accuracy, especially for obscure or very recent facts</li>
              <li>Doing precise arithmetic on very large numbers reliably without a tool</li>
              <li>Knowing anything private about you unless you tell it in the conversation</li>
              <li>Replacing professional advice (medical, legal, financial) for high-stakes decisions</li>
            </ul>
            <p>Think of an AI assistant as a knowledgeable collaborator, not an infallible oracle.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "Do you need a paid subscription to meaningfully learn and use AI assistants?",
          options: [
            "Yes, free tiers are unusable",
            "No, free tiers are generally enough for beginners",
          ],
          answer: 1,
          explain: "Free tiers of tools like ChatGPT, Claude, and Gemini are more than sufficient to learn the basics and get real everyday value.",
        },
        {
          q: "Which of these is a realistic strength of a modern AI chat assistant?",
          options: [
            "Guaranteeing every fact it states is correct",
            "Summarizing a long article into key points",
            "Knowing private details about you it was never told",
            "Replacing a doctor for medical diagnoses",
          ],
          answer: 1,
          explain: "Summarizing, drafting, and explaining are core strengths. Guaranteed accuracy and knowing private, untold information are not.",
        },
        {
          q: "What's the best mental model for an AI assistant?",
          options: [
            "An infallible oracle that is always correct",
            "A knowledgeable collaborator whose output you still review",
            "A random text generator with no useful patterns",
            "A replacement for all professional expert advice",
          ],
          answer: 1,
          explain: "Treating AI as a capable collaborator — helpful, fast, but not infallible — leads to the most productive and safe use.",
        },
      ],
    },
    {
      id: "prompting-101",
      title: "Prompting 101",
      summary: "How to ask AI for what you actually want, on the first or second try.",
      icon: "wand",
      lessons: [
        {
          title: "The anatomy of a good prompt",
          html: `
            <p>A strong prompt usually includes some combination of:</p>
            <ul>
              <li><strong>Context</strong> &mdash; who you are, or the situation ("I'm a first-time small business owner...")</li>
              <li><strong>Task</strong> &mdash; exactly what you want done ("...write a 3-sentence product description...")</li>
              <li><strong>Format</strong> &mdash; how you want the answer shaped ("...as a bulleted list, under 100 words")</li>
              <li><strong>Examples</strong> &mdash; a sample of the style or output you're looking for, if you have one</li>
            </ul>
            <p><strong>Vague:</strong> "Write about dogs."<br>
            <strong>Better:</strong> "Write a friendly, 150-word blog intro about why golden
            retrievers make great family pets, aimed at first-time dog owners."</p>
          `,
        },
        {
          title: "Iterate &mdash; don't expect perfection on try one",
          html: `
            <p>Treat your first message as a draft, not a final answer. If the response isn't
            quite right, just say so:</p>
            <ul>
              <li>"Make this shorter and more casual."</li>
              <li>"Can you give three alternative versions?"</li>
              <li>"That's too technical &mdash; explain it like I'm new to this."</li>
            </ul>
            <p>Because the AI remembers the conversation, refining is usually faster than
            starting over with one giant, perfect prompt.</p>
          `,
        },
        {
          title: "Handy techniques",
          html: `
            <ul>
              <li><strong>Give it a role:</strong> "Act as a patient math tutor..." shapes the tone and depth of the answer.</li>
              <li><strong>Ask for step-by-step reasoning:</strong> "Walk through this step by step" often improves accuracy on harder problems.</li>
              <li><strong>Set a format:</strong> "Reply in a table" or "Give me 5 bullet points" keeps answers scannable.</li>
              <li><strong>Ask it to ask you:</strong> "Ask me clarifying questions before answering" helps when your request is fuzzy.</li>
            </ul>
          `,
        },
        {
          title: "Before &amp; after examples",
          html: `
            <table class="lesson-table">
              <thead><tr><th>Vague prompt</th><th>Improved prompt</th></tr></thead>
              <tbody>
                <tr>
                  <td>"Help with my resume"</td>
                  <td>"Review my resume for a marketing internship. Point out 3 specific weaknesses and suggest rewrites for each bullet."</td>
                </tr>
                <tr>
                  <td>"Explain photosynthesis"</td>
                  <td>"Explain photosynthesis to a curious 10-year-old, using a simple everyday analogy."</td>
                </tr>
                <tr>
                  <td>"Write an email"</td>
                  <td>"Write a polite email to my landlord asking to fix a leaking faucet, keep it under 80 words."</td>
                </tr>
              </tbody>
            </table>
          `,
        },
      ],
      quiz: [
        {
          q: "Which of these is the most complete, well-formed prompt?",
          options: [
            "\"Write something good.\"",
            "\"Write a 100-word, upbeat product description for a reusable water bottle, aimed at outdoor hikers.\"",
            "\"Bottle.\"",
            "\"Make it better.\"",
          ],
          answer: 1,
          explain: "It includes context (outdoor hikers), task (product description), tone (upbeat), and format (100 words).",
        },
        {
          q: "If the AI's first answer isn't quite right, what should you do?",
          options: [
            "Give up on AI entirely",
            "Refine your prompt or ask it to adjust the response",
            "Assume it's impossible to fix",
            "Always start an entirely new conversation from scratch",
          ],
          answer: 1,
          explain: "Iterating within the same conversation is usually the fastest way to a great result.",
        },
        {
          q: "What does giving the AI a \"role\" (e.g. \"act as a tutor\") do?",
          options: [
            "Nothing, it's ignored",
            "It shapes the tone and depth of the response",
            "It makes the AI slower",
            "It's only useful for coding tasks",
          ],
          answer: 1,
          explain: "Assigning a role helps steer the style, tone, and level of detail in the response.",
        },
        {
          q: "Why might you ask an AI to 'think step by step'?",
          options: [
            "It has no effect on answer quality",
            "It can improve accuracy on harder, multi-step problems",
            "It's required for every single prompt",
            "It makes responses shorter",
          ],
          answer: 1,
          explain: "Encouraging step-by-step reasoning often helps the model work through harder problems more reliably.",
        },
      ],
    },
    {
      id: "everyday-ai",
      title: "Using AI Every Day",
      summary: "Real, practical ways beginners use AI for work, learning, and life.",
      icon: "calendar",
      lessons: [
        {
          title: "Six everyday categories",
          html: `
            <ul>
              <li><strong>Writing &amp; editing</strong> &mdash; emails, cover letters, social posts, proofreading.</li>
              <li><strong>Learning &amp; research</strong> &mdash; simplifying a hard topic, summarizing an article, quizzing yourself.</li>
              <li><strong>Planning &amp; organizing</strong> &mdash; trip itineraries, weekly schedules, meal plans, budgets.</li>
              <li><strong>Brainstorming</strong> &mdash; baby names, business ideas, gift ideas, party themes.</li>
              <li><strong>Coding help</strong> &mdash; explaining error messages, writing small scripts, learning to code.</li>
              <li><strong>Creative &amp; visual</strong> &mdash; image generation, story writing, poems.</li>
            </ul>
          `,
        },
        {
          title: "Worked example: planning a trip",
          html: `
            <p><strong>Prompt:</strong> "I'm planning a 4-day budget trip to Kyoto in November
            for two adults who love food and quiet temples, not crowded tourist spots. Suggest a
            simple day-by-day plan."</p>
            <p>The AI can draft an itinerary in seconds. You then review it, cut what doesn't fit,
            and ask follow-ups like "swap day 2 for something more low-key" &mdash; much faster
            than researching everything from scratch, though you should still verify opening
            hours and prices independently.</p>
          `,
        },
        {
          title: "Start small",
          html: `
            <p>You don't need a big project to get value from AI. Good first tasks:</p>
            <ul>
              <li>Ask it to proofread your next email before sending.</li>
              <li>Ask it to explain a confusing paragraph from something you're reading.</li>
              <li>Ask it to turn a messy list of notes into a clean summary.</li>
            </ul>
            <p>Small, low-stakes tasks are the fastest way to build comfort and intuition for
            what AI can (and can't) do well.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "Which of these is a good \"low-stakes\" first task for a beginner to try with AI?",
          options: [
            "Filing official legal paperwork unsupervised",
            "Asking it to proofread an email before sending",
            "Diagnosing a serious medical symptom with no follow-up",
            "Making a final financial investment decision alone",
          ],
          answer: 1,
          explain: "Proofreading is low-stakes, easy to verify yourself, and a great way to build comfort with AI.",
        },
        {
          q: "When AI drafts a travel itinerary, what should you still do?",
          options: [
            "Nothing, trust it completely",
            "Verify details like opening hours and prices independently",
            "Ignore the draft entirely",
            "Only use it for hotels, never activities",
          ],
          answer: 1,
          explain: "AI is great for a fast first draft, but real-world details should still be verified before you rely on them.",
        },
        {
          q: "Which is NOT one of the six everyday categories covered in this lesson?",
          options: [
            "Brainstorming",
            "Planning & organizing",
            "Performing surgery",
            "Coding help",
          ],
          answer: 2,
          explain: "Surgery is a highly specialized, high-stakes professional task — not an everyday beginner AI use case.",
        },
        {
          q: "What's a good strategy for building comfort with AI as a beginner?",
          options: [
            "Only ever attempt huge, complex projects first",
            "Start with small, low-stakes tasks",
            "Avoid using it until you're an expert",
            "Never review or edit anything it produces",
          ],
          answer: 1,
          explain: "Starting small builds intuition for AI's strengths and limits before you rely on it for bigger tasks.",
        },
      ],
    },
    {
      id: "safety-ethics",
      title: "AI Safety, Ethics & Limits",
      summary: "Using AI responsibly: privacy, bias, fact-checking, and giving credit.",
      icon: "shield",
      lessons: [
        {
          title: "Fact-check anything important",
          html: `
            <p>Because AI can hallucinate, always verify facts that matter &mdash; statistics,
            quotes, legal or medical claims, historical dates &mdash; against a trusted, primary
            source before relying on them or sharing them further.</p>
          `,
        },
        {
          title: "Bias in AI",
          html: `
            <p>AI models learn from huge amounts of human-written text, which means they can
            absorb and repeat biases present in that data (cultural, gender, and other biases).
            Be a thoughtful reader: if an answer seems one-sided or stereotyped, question it and
            ask for a more balanced perspective.</p>
          `,
        },
        {
          title: "Privacy: what not to share",
          html: `
            <p>Avoid pasting sensitive personal information into an AI chat unless you understand
            that tool's privacy policy &mdash; things like passwords, medical records, financial
            account numbers, or other people's private data. When in doubt, anonymize details
            (use placeholders like "[Name]" or "[Company]") before sharing.</p>
          `,
        },
        {
          title: "Copyright, authenticity &amp; giving credit",
          html: `
            <p>AI-generated text or images can raise questions about originality and copyright.
            Good habits:</p>
            <ul>
              <li>Don't submit AI-generated work as entirely your own where originality is
              expected (school assignments, professional certifications) &mdash; check the rules
              that apply to you.</li>
              <li>Be transparent when AI played a significant role in something you're sharing
              publicly.</li>
              <li>Treat AI output as a draft to make your own through review and editing, not a
              finished, ready-to-publish product.</li>
            </ul>
          `,
        },
        {
          title: "A simple responsible-use checklist",
          html: `
            <ul>
              <li>Would I be comfortable if someone saw exactly what I typed into this chat?</li>
              <li>Have I verified any important facts independently?</li>
              <li>Am I being transparent about AI's role where it matters?</li>
              <li>Am I still the one making the final decision?</li>
            </ul>
            <p>You've just covered, in a single sitting, what many people spend months feeling
            unsure about. That's not nothing &mdash; it's a real head start. Whatever you build,
            write, plan, or explore next, you now get to do it with a genuinely capable partner
            at your side. The rest is just practice.</p>
          `,
        },
      ],
      quiz: [
        {
          q: "What should you do before relying on an important fact an AI gave you?",
          options: [
            "Nothing, AI is always accurate",
            "Verify it against a trusted, primary source",
            "Share it immediately with others",
            "Assume it's false by default",
          ],
          answer: 1,
          explain: "Fact-checking important claims protects you from AI hallucinations.",
        },
        {
          q: "Why can AI models show bias?",
          options: [
            "They are programmed to be biased on purpose",
            "They learn from human-written data, which can contain biases",
            "Bias is impossible in software",
            "Only image-generating AI can be biased",
          ],
          answer: 1,
          explain: "Because models learn patterns from real-world text, they can reflect biases present in that data.",
        },
        {
          q: "What's a good practice around privacy when using AI chat tools?",
          options: [
            "Share passwords so the AI can help faster",
            "Avoid pasting sensitive personal or financial information",
            "Privacy doesn't matter with AI",
            "Only worry about privacy with image generation",
          ],
          answer: 1,
          explain: "Avoid sharing sensitive personal data unless you understand the specific tool's privacy handling.",
        },
        {
          q: "How should you treat AI-generated writing before publishing or submitting it?",
          options: [
            "As a finished, ready-to-publish product",
            "As a draft to review, verify, and make your own",
            "As something to never edit",
            "As something that never needs disclosure, ever",
          ],
          answer: 1,
          explain: "AI output is best treated as a strong first draft you review, fact-check, and personalize.",
        },
        {
          q: "Which question belongs on a responsible AI-use checklist?",
          options: [
            "\"Am I still the one making the final decision?\"",
            "\"Can I skip fact-checking entirely?\"",
            "\"Should I share my passwords with the AI?\"",
            "\"Should I hide AI's role, no matter the context?\"",
          ],
          answer: 0,
          explain: "Staying the final decision-maker is a core principle of responsible AI use.",
        },
      ],
    },
  ],
};
