// Intent guesser: pure keyword scoring, no network, no AI. Shared by all three chat lab designs.
// only posts from the last 5 years
window.POSTS = [{t:"Hands on the wheel",u:"/2026/10/hands-on-the-wheel",d:"Oct 2026"},{t:"Ryan Bigg is looking for work",u:"/2026/08/ryan-bigg-is-sorta-looking-for-work",d:"Aug 2026"},{t:"Comsol Customer Service",u:"/2026/06/comsol-customer-service",d:"Jun 2026"},{t:"Verify faster",u:"/2026/06/verify-faster",d:"Jun 2026"},{t:"NPM: putting the brown in brownout",u:"/2026/04/npm-putting-the-brown-in-brownout",d:"Apr 2026"},{t:"From Heroku to Render",u:"/2026/03/from-heroku-to-render",d:"Mar 2026"},{t:"Hearts & Clubs",u:"/2026/02/hearts-clubs",d:"Feb 2026"},{t:"Beware grpc gem and Ruby 4.0",u:"/2026/01/beware-grpc-gem-and-ruby-40",d:"Jan 2026"},{t:"Triaging bugs",u:"/2025/11/triaging-bugs",d:"Nov 2025"},{t:"Ruby Community Reflections",u:"/2025/10/ruby-community-reflections",d:"Oct 2025"},{t:"Hanami for Rails Developers: Part 4: Associations",u:"/2025/10/hanami-for-rails-developers-4-associations",d:"Oct 2025"},{t:"Hanami for Rails Developers: Part 3: Forms",u:"/2025/10/hanami-for-rails-developers-3-forms",d:"Oct 2025"},{t:"Hanami for Rails Developers: Part 2: Controllers",u:"/2025/10/hanami-for-rails-developers-2-controllers",d:"Oct 2025"},{t:"Hanami for Rails Developers: Part 1: Models",u:"/2025/10/hanami-for-rails-developers-1-models",d:"Oct 2025"},{t:"Show, Don't Tell",u:"/2025/05/show-dont-tell",d:"May 2025"},{t:"Cursor-based querying with Rails",u:"/2025/04/cursor-based-querying",d:"Apr 2025"},{t:"Note taking",u:"/2025/03/note-taking",d:"Mar 2025"},{t:"Decorating arrays with SimpleDelegator",u:"/2025/03/decorating-arrays-with-simpledelegator",d:"Mar 2025"},{t:"Ghosts 'n' Stuff",u:"/2025/02/ghosts-n-stuff",d:"Feb 2025"},{t:"Rails tagged logging",u:"/2025/02/rails-tagged-logging",d:"Feb 2025"},{t:"Scoping an Active Record join",u:"/2024/12/scoping-an-active-record-join",d:"Dec 2024"},{t:"Using Elastic Search's Profile API",u:"/2024/12/using-elastic-searchs-profile-api",d:"Dec 2024"},{t:"React is fine",u:"/2024/11/react-is-fine",d:"Nov 2024"},{t:"Ruby Retreat 2024",u:"/2024/10/ruby-retreat-2024",d:"Oct 2024"},{t:"Use classes to represent data",u:"/2024/09/use-classes-to-represent-data",d:"Sep 2024"},{t:"Debugging Checklist",u:"/2024/07/debugging-checklist",d:"Jul 2024"},{t:"Separation of data and view layers in React components",u:"/2024/07/separation-of-react-components-with-graphql",d:"Jul 2024"},{t:"Decreasing Ruby app build times",u:"/2024/06/make-rspec-tests-go-faster",d:"Jun 2024"},{t:"Scheduling with Ice Cube",u:"/2024/05/scheduling-with-ice-cube",d:"May 2024"},{t:"Thought Experiment: Without React or GraphQL",u:"/2024/05/without-react-or-graphql",d:"May 2024"},{t:"What was that branch?",u:"/2024/05/what-was-that-branch",d:"May 2024"},{t:"code is like garden",u:"/2024/05/code-is-like-garden",d:"May 2024"},{t:"One year with the Ergodox EZ",u:"/2024/04/one-year-with-the-ergodox-ez",d:"Apr 2024"},{t:"Tailwind has won",u:"/2024/03/tailwind-has-won",d:"Mar 2024"},{t:"View Components, Table Edition",u:"/2024/01/view-components-table-edition",d:"Jan 2024"},{t:"Audit Logging Notes",u:"/2023/12/audit-logging-notes",d:"Dec 2023"},{t:"NaNoWriMo Retro",u:"/2023/12/nanowrimo-retro",d:"Dec 2023"},{t:"Ruby 3, Hashes and Keyword Arguments",u:"/2023/11/ruby-32-hashes-and-keyword-arguments",d:"Nov 2023"},{t:"Saving time with fzf",u:"/2023/08/saving-time-with-fzf",d:"Aug 2023"},{t:"Ubuntu, Ruby, Selenium Manager, Chrome and ChromeDriver",u:"/2023/08/ubuntu-ruby-selenium-manager-chrome-and-chromedriver",d:"Aug 2023"},{t:"Alpine Linux, Selenium Manager, Chrome and ChromeDriver",u:"/2023/08/alpine-linux-selenium-manager-chrome-and-chromedriver",d:"Aug 2023"},{t:"Zoom's return to the office",u:"/2023/08/zooms-return-to-the-office",d:"Aug 2023"},{t:"How to fix: Chromedriver 115, cannot find chrome binary",u:"/2023/07/how-to-fix-chromedriver-115-cannot-find-chrome-binary",d:"Jul 2023"},{t:"Rails 7, React, TypeScript, ESBuild and View Components",u:"/2023/06/rails-7-react-typescript-setup",d:"Jun 2023"},{t:"Rails 7, Bootstrap CSS + JavaScript with ESBuild",u:"/2023/04/rails-7-bootstrap-css-javascript-with-esbuild",d:"Apr 2023"},{t:"Open Letter to the Rails Foundation",u:"/2023/03/open-letter-to-the-rails-foundation",d:"Mar 2023"},{t:"Please explain, Elastic Search",u:"/2023/03/please-explain-elasticsearch",d:"Mar 2023"},{t:"Why game programming and why Magic?",u:"/2023/02/why-game-programming-and-why-magic",d:"Feb 2023"},{t:"Are the switches on a Kinesis Gaming Freestyle Edge RGB Keyboard hot-swappable?",u:"/2023/01/are-the-switches-on-a-kinesis-gaming-freestyle-edge-rgb-keyboard-hot-swappable",d:"Jan 2023"},{t:"Ruby GraphQL field notes",u:"/2023/01/ruby-graphql-field-notes",d:"Jan 2023"},{t:"The method method",u:"/2023/01/the-method-method",d:"Jan 2023"},{t:"CSS :has selector for selects that have options",u:"/2022/12/using-a-css-has-selector-to-target-selects-that-have-selected-options",d:"Dec 2022"},{t:"Hanami 2.0 Thoughts",u:"/2022/11/hanami-20-thoughts",d:"Nov 2022"},{t:"The Gem Foundation",u:"/2022/11/the-gem-foundation",d:"Nov 2022"},{t:"A replacement for strong parameters",u:"/2022/11/a-replacement-for-strong-parameters",d:"Nov 2022"},{t:"Using Union Types with GraphQL Mutations in Ruby",u:"/2022/05/ruby-graphql-mutations-with-union-types",d:"May 2022"},{t:"Typed View Components with dry-types",u:"/2022/03/typed-view-components",d:"Mar 2022"},{t:"Culture and Values",u:"/2021/12/culture-and-values",d:"Dec 2021"},];

window.INTENTS = [
  { id: 'hire', label: 'Hire me / job enquiry',
    kw: ['hire','hiring','job','role','position','work with','contract','freelance','recruit','recruiter','opportunity','vacancy','employ','available','cv','resume','résumé'],
    reply: "Sounds like you're after someone for a role. Here's what I'm looking for, and my résumé.",
    links: [['What I\'m looking for','/work'],['Résumé','/real-resume'],['Email me','mailto:me@ryanbigg.com']] },
  { id: 'contact', label: 'Get in touch',
    kw: ['contact','email','e-mail','reach','talk to','message','mastodon','linkedin','get in touch','say hi','hello','hi','hey','dm'],
    reply: "Easiest way is email. I'm also on Mastodon if you'd rather do that.",
    links: [['me@ryanbigg.com','mailto:me@ryanbigg.com'],['Mastodon','https://ruby.social/@ryanbigg'],['LinkedIn','https://www.linkedin.com/in/ryanbigg/']] },
  { id: 'books', label: 'Books',
    kw: ['book','books','author','write','wrote','rails 4','rails in action','elixir','read about','learn rails','learn elixir','ebook','leanpub','twist'],
    reply: "I've written books on Ruby, Rails and Elixir. They're all listed on the books page.",
    links: [['All books','/books']] },
  { id: 'read', label: 'Read',
    kw: ['read','reading','blog','post','posts','article','articles','writing','essay','essays'],
    reply: "Here's the blog, my three latest posts, and my books.",
    get links() { return [['The blog','/blog']].concat(POSTS.slice(0, 3).map(p => [p.t, p.u]), [['My books','/books']]); } },
  { id: 'elastic', label: 'Elasticsearch',
    kw: ['elastic','elasticsearch','elastic search','opensearch','lucene','profile api','search performance'],
    reply: "I've done a lot of Elasticsearch work, mostly making slow queries fast. This post covers how I profile them.",
    links: [['Using Elastic Search\'s Profile API','/2024/12/using-elastic-searchs-profile-api']] },
  { id: 'ice', label: 'Scheduling & ice_cube',
    kw: ['ice cube','ice_cube','icecube','schedule','scheduling','recurring','recurrence','rrule','calendar'],
    reply: "I've written about recurring schedules in Ruby with ice_cube.",
    links: [['Scheduling with ice_cube','/2024/05/scheduling-with-ice-cube']] },
  { id: 'speed', label: 'Faster tests & builds',
    kw: ['rspec','faster','speed','speeding','slow','build times','build speed','test suite','tests','ci','build'],
    reply: "I like making slow test suites and builds fast. This is how I did it for RSpec.",
    links: [['Make RSpec tests go faster','/2024/06/make-rspec-tests-go-faster']] },
  { id: 'videos', label: 'Talks & videos',
    kw: ['talk','talks','video','videos','conference','speak','speaking','watch','youtube','presentation','keynote','railsconf','slides'],
    reply: "I've given a few talks. These three are the ones I'd point people at.",
    links: [['Hiring juniors','https://www.youtube.com/watch?v=aD6dci9rLXM'],['Magic is Ruby, Ruby is magic','https://www.youtube.com/watch?v=btIbue1JkA0'],['Railway-oriented programming','https://www.youtube.com/watch?v=94ELQLqWjxM']] },
  { id: 'oss', label: 'Open source & code',
    kw: ['github','open source','oss','gem','gems','i18n','mail','repo','repository','code','library','contribute','contributing','patch','pull request','pr','bug','issue'],
    reply: "I maintain the i18n and mail gems, and I've contributed to Rails over the years. I also build my own tools: Twist for writing books, and a Magic: The Gathering project.",
    links: [['i18n','https://github.com/ruby-i18n/i18n'],['mail','https://github.com/mikel/mail'],['Twist','https://github.com/radar/twist-v3'],['MTG','https://github.com/radar/mtg']] },
  { id: 'mentor', label: 'Mentoring & junior advice',
    kw: ['mentor','mentoring','junior','juniors','advice','career','learn','learning','beginner','bootcamp','new developer','coach','guidance','help me','start','getting started'],
    reply: "I like helping people get started. This page is where I'd begin.",
    links: [['Mentoring','/mentoring']] },
  { id: 'now', label: 'What I\'m up to',
    kw: ['now','currently','doing','up to','lately','these days','what are you','whats new',"what's new",'busy','project','projects','working on','status'],
    reply: "Here's what I'm up to at the moment.",
    links: [['/now','/now'],['Work','/work']] },
  { id: 'work', label: 'Past work',
    kw: ['experience','history','background','previous','previously','career','companies','fat zebra','culture amp','lifx','covidence','who are you','about','bio','portfolio','work'],
    reply: "Short version: fourteen years of full-time Rails at Covidence, Culture Amp and LIFX, then lead developer at Fat Zebra. The résumé has the detail.",
    links: [['Résumé','/real-resume'],['Work','/work']] },
  { id: 'ai', label: 'AI & Claude Code',
    kw: ['ai','claude','claude code','llm','copilot','chatgpt','gpt','agent','agents','prompt','vibe','vibe coding','robots','machine learning','model'],
    reply: "I use AI tools deliberately, with human review and the usual guardrails still in place. I wrote about it here.",
    links: [['Hands on the wheel','/2026/10/hands-on-the-wheel']] },
  { id: 'rss', label: 'Follow along',
    kw: ['rss','feed','subscribe','follow','newsletter','updates','atom'],
    reply: "There's an RSS feed. No newsletter, sorry.",
    links: [['RSS feed','/feed.xml']] }
];

const STOP = new Set('a an the and or of to in on for with is are be i me my you your it its at as by from this that what how do does can could should would about want need looking like why did does how has have'.split(' '));
const words = s => s.toLowerCase().replace(/elasticsearch/g, 'elastic search').replace(/[^a-z0-9\s'+#.]/g, ' ').split(/\s+/).filter(Boolean);

window.guess = function (text) {
  const q = text.toLowerCase().trim();
  const toks = words(q).filter(w => !STOP.has(w));
  const scored = INTENTS.map(it => {
    let score = 0;
    for (const k of it.kw) {
      if (k.includes(' ')) { if (q.includes(k)) score += 3; }
      else if (toks.includes(k)) score += 2;
      else if (k.length > 3 && toks.some(t => t.length > 3 && (t.startsWith(k) || k.startsWith(t)))) score += 1;
    }
    return { it, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  // "read" plus "books" means books only
  const booksHit = scored.find(x => x.it.id === 'books');
  if (booksHit && scored[0].it.id === 'read') scored.unshift(scored.splice(scored.indexOf(booksHit), 1)[0]);
  const top = scored[0];
  const confident = top && top.score >= 2;

  // blog posts whose titles share rare words with the query
  const posts = POSTS.map(p => {
    const tw = words(p.t).filter(w => !STOP.has(w) && w.length > 2);
    const hits = toks.filter(t => t.length > 2 && tw.some(w => w === t || (t.length > 4 && w.startsWith(t.slice(0, 5)))));
    return { p, hits: hits.length };
  }).filter(x => x.hits > 0).sort((a, b) => b.hits - a.hits);
  const best = posts.length ? posts[0].hits : 0;
  const postHits = posts.filter(x => x.hits >= (confident ? 2 : 1)).filter(x => best < 2 || x.hits >= best).map(x => x.p).filter(p => !(confident && top.it.links.some(l => l[1] === p.u))).slice(0, 3);

  return {
    intent: confident ? top.it : null,
    alts: top && top.it.id === 'books' && toks.includes('read') ? [] : scored.slice(confident ? 1 : 0, 3).filter(x => x.score >= 2).map(x => x.it),
    posts: top && top.it.id === 'read' || (top && top.it.id === 'books' && toks.includes('read')) ? [] : postHits,
    confidence: top ? Math.min(1, top.score / 6) : 0
  };
};

const BASE_SUGGESTIONS = ["I'm hiring a developer", "Show me your open source work", "Where can I watch your talks?", "What do you think of AI coding?", "Do you know Elasticsearch?"];

// Questions that land on posts from the last 5 years. A chip only shows if it still finds a post.
const POST_SUGGESTIONS = [
  "Hanami for Rails developers",
  "Has Tailwind won?"
];

window.SUGGESTIONS = BASE_SUGGESTIONS.concat(POST_SUGGESTIONS.filter(s => guess(s).posts.length > 0));
