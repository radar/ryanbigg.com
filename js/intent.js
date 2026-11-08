---
---
// Intent guesser: pure keyword scoring, no network, no AI. Shared by all three chat lab designs.
{% assign cutoff = site.time | date: "%s" | minus: 157788000 %}// only posts from the last 5 years
window.POSTS = [{% for post in site.posts %}{% assign ts = post.date | date: "%s" | plus: 0 %}{% if ts >= cutoff %}{t:{{ post.title | jsonify }},u:{{ post.url | jsonify }},d:{{ post.date | date: "%b %Y" | jsonify }}},{% endif %}{% endfor %}];

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
