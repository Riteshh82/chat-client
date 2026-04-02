import React, { useState, useEffect, useCallback, useRef } from 'react';
import JoinModal from '../Modal/JoinModal';
import './NewsFeed.css';

const NEWS_API_KEY  = process.env.REACT_APP_NEWS_API_KEY  || '';
const NEWS_CATEGORY = process.env.REACT_APP_NEWS_CATEGORY || 'technology';

const FALLBACK_ARTICLES = [
  {
    id: 1,
    title: 'The Future of Artificial Intelligence in Everyday Life',
    description: 'As AI systems become more capable, researchers and ethicists grapple with questions about autonomy, privacy, and what it means to delegate decisions to machines.',
    source: { name: 'Tech Insights' },
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    urlToImage: null,
    category: 'Technology',
    readTime: 5,
  },
  {
    id: 2,
    title: 'Open Source Software: The Backbone of the Modern Internet',
    description: 'From Linux servers to React frontends, open source powers nearly everything online — yet most of its maintainers are volunteers working in their spare time.',
    source: { name: 'Dev Weekly' },
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    urlToImage: null,
    category: 'Development',
    readTime: 4,
  },
  {
    id: 3,
    title: 'WebSockets vs Server-Sent Events: Which Should You Use?',
    description: 'Both protocols enable real-time communication between client and server, but they serve very different use cases. Here\'s a deep-dive comparison.',
    source: { name: 'Smashing Magazine' },
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    urlToImage: null,
    category: 'Engineering',
    readTime: 7,
  },
  {
    id: 4,
    title: 'Why Mobile-First Design is No Longer Optional',
    description: 'With over 60% of web traffic coming from mobile devices, designing for smaller screens first isn\'t just good practice — it\'s essential for survival.',
    source: { name: 'UX Planet' },
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    urlToImage: null,
    category: 'Design',
    readTime: 6,
  },
  {
    id: 5,
    title: 'MongoDB Atlas: Scaling from Zero to Million Users',
    description: 'A practical guide to configuring indexes, aggregation pipelines, and Atlas Search for applications that need to grow without pain.',
    source: { name: 'MongoDB Blog' },
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
    urlToImage: null,
    category: 'Database',
    readTime: 8,
  },
  {
    id: 6,
    title: 'The Psychology of Chat Interfaces: Why We\'re Hooked',
    description: 'Variable reward schedules, social proof, and the dopamine loop — chat apps exploit human psychology in ways we\'re only beginning to understand.',
    source: { name: 'Wired' },
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
    urlToImage: null,
    category: 'Psychology',
    readTime: 6,
  },
  {
    id: 7,
    title: 'Node.js Performance Optimization: 12 Proven Techniques',
    description: 'From clustering and caching to efficient event loop management, these strategies will help you squeeze maximum throughput from your Node servers.',
    source: { name: 'Node Weekly' },
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    urlToImage: null,
    category: 'Backend',
    readTime: 9,
  },
  {
    id: 8,
    title: 'React 19: What\'s New and What\'s Changing',
    description: 'The React team has been busy. From the new compiler to server components reaching stability, here\'s everything you need to know about the latest release.',
    source: { name: 'React Newsletter' },
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    urlToImage: null,
    category: 'Frontend',
    readTime: 5,
  },
];

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const GRADIENTS = [
  'linear-gradient(135deg, #1a1f35 0%, #0d2137 100%)',
  'linear-gradient(135deg, #1a2820 0%, #0d2a1a 100%)',
  'linear-gradient(135deg, #2a1a35 0%, #1a0d2a 100%)',
  'linear-gradient(135deg, #35201a 0%, #2a150d 100%)',
  'linear-gradient(135deg, #1a2535 0%, #0d1a2a 100%)',
];

export default function NewsFeed({ onJoin, currentUser }) {
  const [articles,      setArticles]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]      = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [tapCount,      setTapCount]      = useState(0);
  const tapTimerRef   = useRef(null);
  const logoRef       = useRef(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      if (!NEWS_API_KEY || NEWS_API_KEY === 'your_gnews_api_key_here') {
        await new Promise((r) => setTimeout(r, 600)); // simulate network
        setArticles(FALLBACK_ARTICLES);
      } else {
        const url = `https://gnews.io/api/v4/top-headlines?category=${NEWS_CATEGORY}&lang=en&max=10&apikey=${NEWS_API_KEY}`;
        const res  = await fetch(url);
        const data = await res.json();

        if (data.articles?.length) {
          const normalized = data.articles.map((a, i) => ({
            id:          i,
            title:       a.title,
            description: a.description,
            source:      a.source,
            publishedAt: a.publishedAt,
            urlToImage:  a.image,
            url:         a.url,
            readTime:    Math.max(2, Math.ceil((a.content?.length || 500) / 1000)),
          }));
          setArticles(normalized);
        } else {
          setArticles(FALLBACK_ARTICLES);
        }
      }
    } catch {
      setArticles(FALLBACK_ARTICLES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);
  useEffect(() => {
    if (articles.length < 2) return;
    const timer = setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % Math.min(3, articles.length));
    }, 6000);
    return () => clearInterval(timer);
  }, [articles.length]);
  const handleLogoTap = useCallback(() => {
    setTapCount((c) => {
      const next = c + 1;
      if (next >= 5) {
        setShowModal(true);
        return 0;
      }
      return next;
    });
    clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => setTapCount(0), 1500);
  }, []);

  useEffect(() => () => clearTimeout(tapTimerRef.current), []);

  const featured = articles[featuredIndex];

  return (
    <div className="news-feed">
      <header className="news-header">
        <div className="news-header__left">
          <button
            ref={logoRef}
            className="news-logo"
            onClick={handleLogoTap}
            aria-label="Pulse — tap 3 times to open chat"
          >
            <span className="news-logo__icon">⚡</span>
            <span className="news-logo__text">Pulse</span>
          </button>
          {tapCount > 0 && (
            <span className="tap-hint">
              {tapCount === 1}
            </span>
          )}
        </div>

        <nav className="news-header__right">
          {/* {currentUser && (
            <button
              className="chat-resume-btn"
              onClick={() => setShowModal(true)}
              title="Return to chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )} */}
          <button className="news-icon-btn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </nav>
      </header>
      <div className="news-tabs">
        {['For You', 'Tech', 'Science', 'Design', 'World'].map((tab, i) => (
          <button key={tab} className={`news-tab ${i === 0 ? 'news-tab--active' : ''}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="news-scroll">
        {loading ? (
          <SkeletonFeed />
        ) : (
          <>
            {featured && (
              <div className="news-featured">
                <div
                  className="news-featured__image"
                  style={{
                    background: featured.urlToImage
                      ? `url(${featured.urlToImage}) center/cover no-repeat`
                      : GRADIENTS[featuredIndex % GRADIENTS.length],
                  }}
                >
                  <div className="news-featured__overlay" />
                  <div className="news-featured__dots">
                    {articles.slice(0, 3).map((_, i) => (
                      <span
                        key={i}
                        className={`news-dot ${i === featuredIndex ? 'news-dot--active' : ''}`}
                        onClick={() => setFeaturedIndex(i)}
                      />
                    ))}
                  </div>
                  <div className="news-featured__content">
                    <span className="news-tag">{NEWS_CATEGORY}</span>
                    <h2 className="news-featured__title">{featured.title}</h2>
                    <div className="news-featured__meta">
                      <span>{featured.source?.name}</span>
                      <span>·</span>
                      <span>{relativeTime(featured.publishedAt)}</span>
                      <span>·</span>
                      <span>{featured.readTime} min read</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <section className="news-section">
              <h3 className="news-section__title">Latest Stories</h3>
              <div className="news-list">
                {articles.slice(1).map((article, idx) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    gradient={GRADIENTS[(idx + 1) % GRADIENTS.length]}
                    delay={idx * 40}
                  />
                ))}
              </div>
            </section>
            <div style={{ height: 100 }} />
          </>
        )}
      </div>
      {/* <button
        className="chat-fab"
        onClick={() => setShowModal(true)}
        aria-label="Open secure chat"
        title="Open chat"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {currentUser && <span className="chat-fab__badge" />}
      </button> */}
      {showModal && (
        <JoinModal
          onJoin={onJoin}
          onClose={() => setShowModal(false)}
          savedUser={currentUser}
        />
      )}
    </div>
  );
}

const ArticleCard = React.memo(function ArticleCard({ article, gradient, delay }) {
  return (
    <article
      className="article-card"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="article-card__thumb"
        style={{
          background: article.urlToImage
            ? `url(${article.urlToImage}) center/cover no-repeat`
            : gradient,
        }}
      />
      <div className="article-card__body">
        <p className="article-card__source">{article.source?.name} · {relativeTime(article.publishedAt)}</p>
        <h4 className="article-card__title">{article.title}</h4>
        <p className="article-card__meta">{article.readTime} min read</p>
      </div>
    </article>
  );
});

function SkeletonFeed() {
  return (
    <div className="skeleton-feed">
      <div className="skeleton skeleton-hero" />
      <div className="skeleton-list">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-thumb" />
            <div className="skeleton-card__body">
              <div className="skeleton skeleton-line skeleton-line--sm" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line skeleton-line--md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
