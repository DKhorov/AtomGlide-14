import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../system/axios";
import { Helmet } from "react-helmet-async";
import { Box, Typography, useMediaQuery, Avatar ,Divider} from '@mui/material';

import PostWithComments from "../post/PostWithComments";
import PostSkeleton from "../post/PostSkeleton";

const FullPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const isMobile = useMediaQuery('(max-width:900px)');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await axios.get(`/posts/${id}`);
        setPost(data);
      } catch (err) {
        console.error("Ошибка при получении поста:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (isLoading) return <PostSkeleton />;
  if (!post) return <div style={{ color: "white", padding: 20 }}>Пост не найден :(</div>;

  const title = post.title || "Пост на AtomGlide";
  const description =
    (post.text && post.text.replace(/<[^>]+>/g, "").slice(0, 160)) ||
    "Читайте новые посты на AtomGlide!";
  const imageUrl = post.imageUrl
    ? `https://atomglidedev.ru${post.imageUrl}`
    : "https://atomglidedev.ru/default-og-image.png";
  const url = `https://atomglide.com/post/${id}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": imageUrl,
    "url": url,
    "datePublished": post.createdAt,
    "dateModified": post.updatedAt || post.createdAt,
    "author": {
      "@type": "Person",
      "name": post.user?.fullName || "Пользователь AtomGlide",
      "url": post.user?._id ? `https://atomglide.com/account/${post.user._id}` : undefined
    },
    "publisher": {
      "@type": "Organization",
      "name": "AtomGlide",
      "logo": {
        "@type": "ImageObject",
        "url": "https://atomglide.com/1.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  return (
    <>
      <Helmet>
        <title>{`Пост — ${title}`}</title>
        <meta name="description" content={description} />
                <meta property="og:site_name" content="AtomGlide" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={`Пост — ${title}`} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={title} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Пост — ${title}`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={url} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <Box  sx={{
      width:'700px',
        height: isMobile ? '100vh' : '100vh',
        flex: isMobile ? 1 : 'none',
        overflowY: 'auto',mt:3,
      
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none', 
        '&::-webkit-scrollbar': {
          width: '0px', 
          background: 'transparent',
        },
        paddingBottom: isMobile ? '70px' : 0, 
        pl: 0, 
                pr: 0, 
  px:1,
        
      }}>
        <PostWithComments
          post={post}
          onPostUpdate={(updated) => setPost(updated)}
        />
      </Box>
    </>
  );
};

export default FullPost;
