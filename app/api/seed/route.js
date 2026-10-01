import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Category from '@/lib/models/Category';
import Article from '@/lib/models/Article';
import Comment from '@/lib/models/Comment';

const sampleCategories = [
  { name: 'Politics', slug: 'politics', description: 'Government and political affairs', color: '#ef4444', icon: '🏛️' },
  { name: 'Technology', slug: 'technology', description: 'Latest in tech and innovation', color: '#3b82f6', icon: '💻' },
  { name: 'Sports', slug: 'sports', description: 'Sports news and updates', color: '#22c55e', icon: '⚽' },
  { name: 'Entertainment', slug: 'entertainment', description: 'Movies, music, and culture', color: '#a855f7', icon: '🎬' },
  { name: 'Business', slug: 'business', description: 'Economy and markets', color: '#f59e0b', icon: '📈' },
  { name: 'Health', slug: 'health', description: 'Health and wellness', color: '#06b6d4', icon: '🏥' },
  { name: 'Science', slug: 'science', description: 'Scientific discoveries', color: '#8b5cf6', icon: '🔬' },
  { name: 'World', slug: 'world', description: 'International news', color: '#ec4899', icon: '🌍' },
];

const sampleArticles = [
  {
    title: 'Global Summit 2026: World Leaders Agree on Climate Action Framework',
    content: `<h2>Historic Agreement Reached</h2><p>In a landmark decision at the Global Summit 2026, world leaders from over 190 nations have unanimously agreed on a comprehensive climate action framework that aims to reduce global carbon emissions by 60% before 2035.</p><p>The agreement, dubbed the "Earth Accord," includes binding commitments for developed nations to transition to renewable energy sources and provide financial assistance to developing countries for green infrastructure.</p><h3>Key Provisions</h3><p>The framework outlines several critical measures including a global carbon tax, mandatory emissions reporting for corporations, and a $500 billion green transition fund. Environmental groups have cautiously welcomed the agreement while calling for stronger enforcement mechanisms.</p><p>"This is the most significant climate agreement since the Paris Accord," said UN Secretary General during the closing ceremony. "But the real work begins now."</p>`,
    excerpt: 'World leaders unanimously agree on a comprehensive climate action framework aimed at reducing global carbon emissions by 60% before 2035.',
    tags: ['climate', 'summit', 'environment', 'global'],
    isBreaking: true,
    isTrending: true,
    status: 'published',
    views: 15420,
    coverImage: 'https://images.unsplash.com/photo-1569163139394-de4e5f43e5ca?w=800',
  },
  {
    title: 'Revolutionary AI Chip Achieves 100x Performance Breakthrough',
    content: `<h2>A New Era in Computing</h2><p>Tech giant NeuralCore has unveiled its next-generation AI processor that delivers 100 times the performance of current chips while consuming 90% less energy. The breakthrough could accelerate AI development across industries.</p><p>The chip, codenamed "Prometheus," uses a novel quantum-classical hybrid architecture that allows it to process complex neural network operations at unprecedented speeds.</p><h3>Industry Impact</h3><p>Analysts predict the chip will transform everything from autonomous vehicles to drug discovery. "This isn't just an incremental improvement — it's a paradigm shift," said Dr. Sarah Chen, Chief Technology Analyst at TechReview.</p><p>The company plans to begin mass production in Q1 2027, with early access available to select research institutions.</p>`,
    excerpt: 'NeuralCore unveils next-generation AI processor delivering 100x performance improvement with 90% less energy consumption.',
    tags: ['ai', 'technology', 'chips', 'innovation'],
    isBreaking: false,
    isTrending: true,
    status: 'published',
    views: 23150,
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  },
  {
    title: 'Championship Finals: Underdogs Triumph in Historic Victory',
    content: `<h2>An Unforgettable Night</h2><p>In what sports analysts are calling the greatest upset in championship history, the underdog Phoenix Rising defeated the heavily favored Dynasty Warriors 4-3 in a thrilling seven-game series.</p><p>The decisive Game 7 saw rookie sensation Marcus Rodriguez score a hat-trick, including a stunning last-minute goal that sealed the historic victory.</p><h3>A Season of Miracles</h3><p>Phoenix Rising entered the playoffs as the lowest-ranked seed, making their championship run even more remarkable. The team overcame a 3-1 series deficit, becoming only the third team in history to achieve such a comeback.</p>`,
    excerpt: 'Phoenix Rising defeat Dynasty Warriors 4-3 in a thrilling seven-game series, marking the greatest upset in championship history.',
    tags: ['sports', 'championship', 'soccer', 'underdogs'],
    isBreaking: false,
    isTrending: true,
    status: 'published',
    views: 18900,
    coverImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
  },
  {
    title: 'Blockbuster Film Breaks All-Time Box Office Record in Opening Weekend',
    content: `<h2>Record-Shattering Debut</h2><p>The highly anticipated film "Echoes of Tomorrow" has shattered all-time box office records with a staggering $520 million global opening weekend, surpassing all previous records by a significant margin.</p><p>Directed by acclaimed filmmaker Aria Nguyen, the sci-fi epic has received universal critical acclaim with a 97% rating on major review platforms.</p><h3>Cultural Phenomenon</h3><p>The film's success reflects growing audience demand for original storytelling and spectacular visual experiences. Studios are already in discussions for a trilogy continuation.</p>`,
    excerpt: 'Echoes of Tomorrow shatters box office records with a $520 million global opening weekend and 97% critical rating.',
    tags: ['movies', 'entertainment', 'box-office', 'cinema'],
    status: 'published',
    views: 12340,
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
  },
  {
    title: 'Central Bank Announces Major Interest Rate Decision Amid Economic Shifts',
    content: `<h2>Markets React</h2><p>The Federal Reserve has announced a surprising 50 basis point cut in interest rates, signaling a significant shift in monetary policy as economic indicators point to slowing growth.</p><p>The decision came amid growing concerns about global supply chain disruptions and their impact on domestic economic output.</p><h3>Expert Analysis</h3><p>Financial analysts are divided on the long-term implications of the rate cut. While some view it as a necessary stimulus measure, others warn it could fuel inflationary pressures in an already volatile market.</p>`,
    excerpt: 'Federal Reserve announces a surprising 50 basis point interest rate cut amid economic uncertainty and supply chain concerns.',
    tags: ['economy', 'finance', 'interest-rates', 'markets'],
    status: 'published',
    views: 9870,
    coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
  },
  {
    title: 'Breakthrough Gene Therapy Shows Promise for Rare Diseases',
    content: `<h2>Medical Milestone</h2><p>Researchers at the Global Health Institute have developed a revolutionary gene therapy that has shown remarkable efficacy in treating several previously incurable rare genetic diseases.</p><p>Clinical trials involving 500 patients across 12 countries demonstrated a 94% success rate, with most patients showing complete symptom reversal within six months of treatment.</p><h3>The Road Ahead</h3><p>While the therapy represents a significant breakthrough, researchers caution that further long-term studies are needed before widespread clinical adoption. Regulatory approval applications have been filed in multiple countries.</p>`,
    excerpt: 'Revolutionary gene therapy shows 94% success rate in clinical trials for rare genetic diseases across 12 countries.',
    tags: ['health', 'medicine', 'genetics', 'research'],
    status: 'published',
    views: 7650,
    coverImage: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=800',
  },
  {
    title: 'Space Agency Reveals Plans for First Permanent Lunar Base',
    content: `<h2>A New Frontier</h2><p>NASA in collaboration with ESA has revealed detailed plans for "Artemis Station," humanity's first permanent base on the lunar surface. The ambitious project aims to establish a self-sustaining habitat by 2032.</p><p>The station will initially house 12 astronauts and serve as a staging ground for future Mars missions.</p><h3>Technical Innovations</h3><p>The base will utilize advanced 3D printing technology to construct buildings from lunar regolith, significantly reducing the need to transport materials from Earth. Solar arrays and nuclear micro-reactors will provide reliable power.</p>`,
    excerpt: 'NASA and ESA unveil plans for Artemis Station, humanity\'s first permanent lunar base, targeting completion by 2032.',
    tags: ['space', 'nasa', 'moon', 'science'],
    status: 'published',
    views: 21300,
    coverImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800',
  },
  {
    title: 'Draft: Upcoming Elections Could Reshape Policy Landscape',
    content: `<h2>Political Analysis</h2><p>As the election season approaches, political analysts are predicting significant shifts in policy direction regardless of the outcome. Key issues including healthcare reform, immigration, and digital privacy are at the forefront of voter concerns.</p>`,
    excerpt: 'Political analysts predict significant policy shifts as election season approaches with healthcare and digital privacy as key issues.',
    tags: ['politics', 'elections', 'policy'],
    status: 'draft',
    views: 0,
    coverImage: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800',
  },
  {
    title: 'Pending Review: Electric Vehicle Sales Surge 300% Globally',
    content: `<h2>The EV Revolution</h2><p>Global electric vehicle sales have surged by 300% compared to the previous year, driven by falling battery costs, expanded charging infrastructure, and stricter emissions regulations.</p><p>China continues to lead the market with 45% of global EV sales, followed by Europe and North America.</p>`,
    excerpt: 'Global EV sales surge 300% driven by falling battery costs and expanded charging infrastructure worldwide.',
    tags: ['technology', 'ev', 'automotive', 'green-energy'],
    status: 'pending',
    views: 0,
    coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
  },
];

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    await dbConnect();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Article.deleteMany({}),
      Comment.deleteMany({}),
    ]);

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@newshub.com',
      password: 'admin123',
      role: 'admin',
    });

    const author1 = await User.create({
      name: 'Sarah Johnson',
      email: 'sarah@newshub.com',
      password: 'author123',
      role: 'author',
      bio: 'Senior technology and science correspondent with 10 years of experience.',
    });

    const author2 = await User.create({
      name: 'Michael Chen',
      email: 'michael@newshub.com',
      password: 'author123',
      role: 'author',
      bio: 'Political analyst and investigative journalist.',
    });

    const reader = await User.create({
      name: 'Jane Reader',
      email: 'jane@example.com',
      password: 'reader123',
      role: 'reader',
    });

    // Create categories
    const categories = await Category.insertMany(sampleCategories);
    const categoryMap = {};
    categories.forEach((c) => (categoryMap[c.name] = c._id));

    // Create articles
    const catAssignment = [
      'World', 'Technology', 'Sports', 'Entertainment',
      'Business', 'Health', 'Science', 'Politics', 'Technology',
    ];

    const authors = [author1, author2];
    const articles = [];

    for (let i = 0; i < sampleArticles.length; i++) {
      const art = await Article.create({
        ...sampleArticles[i],
        author: authors[i % 2]._id,
        category: categoryMap[catAssignment[i]],
        likedBy: i < 5 ? [reader._id, authors[(i + 1) % 2]._id] : [],
        publishedAt: sampleArticles[i].status === 'published' ? new Date(Date.now() - i * 86400000) : undefined,
      });
      articles.push(art);
    }

    // Create comments
    const sampleComments = [
      { body: 'This is a groundbreaking agreement! Hope they follow through.', author: reader._id, article: articles[0]._id },
      { body: 'Incredible performance gains. Can\'t wait to see real-world benchmarks.', author: reader._id, article: articles[1]._id },
      { body: 'What a game! Rodriguez is going to be a legend.', author: reader._id, article: articles[2]._id },
      { body: 'Already bought my tickets for opening night!', author: author1._id, article: articles[3]._id },
      { body: 'This rate cut was definitely needed given current conditions.', author: author2._id, article: articles[4]._id },
      { body: 'Amazing progress in gene therapy. Science is incredible.', author: reader._id, article: articles[5]._id },
      { body: 'This is offensive content that should be moderated.', author: reader._id, article: articles[0]._id, isApproved: false },
    ];

    await Comment.insertMany(sampleComments);

    return NextResponse.json({
      message: 'Database seeded successfully!',
      data: {
        users: 4,
        categories: categories.length,
        articles: articles.length,
        comments: sampleComments.length,
      },
      credentials: {
        admin: { email: 'admin@newshub.com', password: 'admin123' },
        author1: { email: 'sarah@newshub.com', password: 'author123' },
        author2: { email: 'michael@newshub.com', password: 'author123' },
        reader: { email: 'jane@example.com', password: 'reader123' },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
