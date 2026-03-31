import React, { useState } from 'react';
import { Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { customIcons } from '../../../components/icon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PostText = ({ children, postId }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const renderMarkdown = (content, key) => (
    <ReactMarkdown
      key={key}
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ node, ...props }) => (
          <p
            style={{
              margin: "0px 0",
              maxWidth: "520px",
              overflowWrap: "break-word",
              fontSize: '25px',
              fontFamily: 'sf'
            }}
            {...props}
          />
        ),
        h1: ({ node, ...props }) => <h1 style={{ fontSize: "1.6em", margin: "15px 0", maxWidth: "480px", fontWeight: 'bold' }} {...props} />,
        h2: ({ node, ...props }) => <h2 style={{ fontSize: "1.3em", margin: "13px 0", maxWidth: "480px" }} {...props} />,
        h3: ({ node, ...props }) => <h3 style={{ fontSize: "1.1em", margin: "11px 0", maxWidth: "480px" }} {...props} />,
        li: ({ node, ...props }) => <li style={{ marginLeft: "18px", maxWidth: "480px" }} {...props} />,
        code: ({ inline, children, ...props }) => (
          <code
            style={{
              backgroundColor: "rgba(34,34,34,0.85)",
              padding: inline ? "2px 6px" : "10px",
              borderRadius: "6px",
              fontSize: "1.1em",
              display: inline ? "inline" : "block",
              overflowX: "auto",
              whiteSpace: inline ? "normal" : "pre-wrap",
              maxWidth: "480px",
            }}
            {...props}
          >
            {children}
          </code>
        ),
        img: ({ node, ...props }) => (
          <img
            {...props}
            style={{
              maxWidth: "480px",
              borderRadius: "8px",
              display: "block",
              margin: "10px 0"
            }}
          />
        )
      }}
    >
      {content}
    </ReactMarkdown>
  );

  const renderContent = (child, i) => {
    if (typeof child === "string") {
      return child.split(/(\[[^\]]+\])/).map((part, idx) => {
        if (part.startsWith("[") && part.endsWith("]")) {
          const keyword = part.slice(1, -1).toLowerCase();
          const IconComponent = customIcons[keyword]?.component;
          return IconComponent ? (
            <IconComponent
              key={`icon-${i}-${idx}`}
              style={{ display: "inline", verticalAlign: "middle", margin: "0 2px" }}
            />
          ) : part;
        }
        return renderMarkdown(part, `${i}-${idx}`);
      });
    }
    return child;
  };

  const fullText = React.Children.toArray(children).join(" ");
  const isLong = fullText.length > 1200;

  // ✅ переход на полный пост
  const handleNavigate = () => {
    if (postId) navigate(`/post/${postId}`);
  };

  return (
    <Box sx={{ position: "relative",               maxWidth: "500px",
 }}>
      <Typography
        onClick={handleNavigate}
        sx={{
          fontFamily: "sf",
          fontWidth:700,
          marginTop: "0",
          color: "rgba(237, 237, 237, 1)",
          ml: 1,
          mb: 1,
          cursor: postId ? 'pointer' : 'default',
          transition: '0.2s',
          "&:hover": postId ? { color: "#4ea1ff" } : {},
          maxHeight: !expanded && isLong ? "150px" : "none",
          overflow: !expanded && isLong ? "hidden" : "visible",
          position: "relative",
        }}
      >
        {React.Children.map(children, renderContent)}
      </Typography>

      {!expanded && isLong && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "50px",
          }}
        />
      )}

      {isLong && (
        <Button
          onClick={() => setExpanded((prev) => !prev)}
          sx={{
            mt: 1,
            fontSize: "12px",
            color: "#4ea1ff",
            textTransform: "none",
            mr: 2,
          }}
        >
          {expanded ? "Скрыть" : "Показать ещё"}
        </Button>
      )}
    </Box>
  );
};

export default PostText;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
