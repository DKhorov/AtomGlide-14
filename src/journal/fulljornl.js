import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from "../system/axios.js";

const RESOURCE_URL = 'https://atomglidedev.ru';

// 1. КОМПОНЕНТ 404 ОШИБКИ
const NotFoundComponent = () => (
  <div style={{ textAlign: 'center', padding: '15vh 20px', fontFamily: 'sans-serif' }}>
    <h2 style={{ fontSize: '2rem', marginTop: '10px' }}>Статья не найдена</h2>
    <p style={{ color: '#888', marginBottom: '30px' }}>
      Возможно, она была удалена, или вы перешли по неверной ссылке.
    </p>
    <Link to="/jrnl" style={{
      padding: '12px 24px', backgroundColor: '#3b82f6', color: '#fff', 
      textDecoration: 'none', borderRadius: '100px', fontWeight: 'bold'
    }}>
      На главную
    </Link>
  </div>
);

// 2. Рендеринг блоков
const RenderBlocks = ({ blocks }) => {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case 'header':
            const Tag = `h${block.data.level || 2}`;
            return (
              <Tag 
                key={block.id} 
                className="article-header"
                style={{ margin: '1.5em 0 0.5em', fontWeight: 800, lineHeight: '1.3' }}
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
              />
            );
          case 'paragraph':
            return (
              <p 
                key={block.id} 
                style={{ marginBottom: '1.2em', lineHeight: '1.7' }}
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }} 
              />
            );
          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag key={block.id} style={{ paddingLeft: '25px', marginBottom: '1.2em' }}>
                {block.data.items?.map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.5em', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ListTag>
            );
          case 'image':
            const imageUrl = block.data.file?.url.startsWith('http') 
              ? block.data.file?.url 
              : `${RESOURCE_URL}${block.data.file?.url}`;
            return (
              <figure key={block.id} style={{ margin: '2em 0', textAlign: 'center' }}>
                <img
                  src={imageUrl}
                  alt={block.data.caption || 'Изображение'}
                  style={{ maxWidth: '100%', borderRadius: '8px', display: 'block', margin: '0 auto' }}
                />
              </figure>
            );
          case 'delimiter':
            return <hr key={block.id} style={{ border: '0', borderTop: '2px dotted #eee', margin: '2.5em 0' }} />;
          case 'quote':
            return (
              <blockquote key={block.id} style={{ 
                borderLeft: '4px solid #3b82f6', 
                paddingLeft: '20px', 
                margin: '1.5em 0', 
                fontStyle: 'italic',
                lineHeight: '1.6'
              }}>
                <p dangerouslySetInnerHTML={{ __html: block.data.text || '' }} />
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </>
  );
};

// 3. Основной компонент
const FullJournal = () => {
  const { id } = useParams();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Авто-скролл вверх при загрузке статьи
    window.scrollTo(0, 0);
    
    setLoading(true);
    axios.get(`/dev/Journal/${id}`)
      .then(res => {
        setJournal(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Ошибка загрузки статьи:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>Загрузка статьи...</div>;
  }

  if (!journal) {
    return <NotFoundComponent />;
  }

  let content;
  let parsedBlocks = [];
  try {
    const parsed = typeof journal.text === 'string' ? JSON.parse(journal.text) : journal.text;
    parsedBlocks = parsed.blocks || [];
    content = parsedBlocks.length > 0 ? <RenderBlocks blocks={parsedBlocks} /> : journal.text;
  } catch (e) {
    content = journal.text;
  }

  const author = journal.author;
  const authorName = typeof author === 'object' ? author?.fullName : author || 'Аноним';
  const avatarUrl = typeof author === 'object' && author?.avatarUrl 
    ? (author.avatarUrl.startsWith('http') ? author.avatarUrl : `${RESOURCE_URL}${author.avatarUrl}`)
    : null;

  return (
    <>
      <style>{`
        /* Убираем глобальные блокировки скролла */
        html, body {
            overflow-y: visible !important;
            height: auto !important;
        }

        .journal-article {
          min-width: 80%; /* Ограничиваем ширину для красоты, а не в % */
          width: 100%;
          margin: 0 auto;
          padding: 20px 20px 100px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #1a1a1a;
          box-sizing: border-box;
          /* Убрали жесткие высоты, чтобы страница листалась */
          overflow: visible !important;
        }

        /* Адаптация для мобильных устройств */
      /* Адаптация для мобильных устройств */
@media (max-width: 768px) {
  .journal-article {
    padding-top: 20px !important; /* Увеличь это число (80, 100, 120), пока заголовок не выйдет из-под сайдбара */
    padding-left: 15px;
    padding-right: 15px;
    padding-bottom: 150px;
  }
  .article-title {
    font-size: 2.1rem !important;
    line-height: 1.1 !important;
    margin-top: 0; /* Обнуляем маржин, т.к. мы используем паддинг у родителя */
  }
}

        @media (prefers-color-scheme: dark) {
          .journal-article {
            color: #ffffff !important;
          }
          .journal-article p, 
          .journal-article h1, 
          .journal-article h2, 
          .journal-article h3, 
          .journal-article li,
          .journal-article blockquote {
            color: #ffffff !important;
          }
        }
      `}</style>

      <main className="journal-article" >
        <header style={{ marginBottom: '30px' }}>
          <h1 className="article-title" style={{ 
            fontSize: '2.8rem', 
            fontWeight: 900, 
            marginBottom: '15px', 
            letterSpacing: '-0.02em',
            textAlign: 'left',
            lineHeight: '1.2',
            wordBreak: 'break-word',
            width: '100%',
            color: 'white'
          }}>
            {journal.title}
          </h1>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            alignItems: 'center', 
            gap: '15px', 
            color: '#787777', 
            fontSize: '0.9rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={authorName} 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <span>👤</span>
              )}
              <span style={{ fontWeight: 500 }}>{authorName}</span>
            </div>

            <span>{new Date(journal.createdAt).toLocaleDateString('ru-RU')}</span>
            <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              {journal.topic}
            </span>
          </div>
        </header>

        <article style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'white', width: '100%' }}>
          {content}
        </article>

        <footer style={{ 
          marginTop: '60px', 
          borderTop: '1px solid rgba(238, 238, 238, 0.1)', 
          paddingTop: '30px', 
          paddingBottom: '100px' 
        }}>
          <Link to="/jrnl" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem' }}>
            Назад в журнал
          </Link>
        </footer>
      </main>
    </>
  );
};

export default FullJournal;