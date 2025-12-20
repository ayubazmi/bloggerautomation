
import { GeneratedBlog } from "../types";

/**
 * Publishes a post to Blogger using the Google Blogger API v3.
 */
export const publishToBlogger = async (
  blog: GeneratedBlog, 
  blogId: string, 
  accessToken: string
) => {
  const url = `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`;
  
  const body = {
    kind: "blogger#post",
    blog: { id: blogId },
    title: blog.title,
    content: convertBlogToFullHtml(blog),
    labels: [blog.style, "AI Generated", "TrendSetter"],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to publish to Blogger.");
  }

  return await response.json();
};

/**
 * Converts the blog content (Markdown) and associated images into a single HTML string.
 * This version uses extremely standard tags to ensure Blogger doesn't strip them.
 */
export function convertBlogToFullHtml(blog: GeneratedBlog): string {
  let html = ``;
  
  // Header Image
  if (blog.images?.[0]) {
    html += `<div style="text-align: center; margin-bottom: 30px;">
      <img src="${blog.images[0].url}" border="0" style="max-width: 100%; height: auto; border-radius: 12px;" alt="${blog.title}" />
    </div>`;
  }

  // Convert Markdown to standard HTML
  const contentHtml = blog.content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .split('\n\n').map(p => {
      if (p.startsWith('<h') || p.startsWith('<li')) return p;
      return `<p>${p}</p>`;
    }).join('');

  html += contentHtml;

  // Insert second image after first heading if possible
  if (blog.images?.[1]) {
    const insertionPoint = html.indexOf('</h2>');
    if (insertionPoint !== -1) {
      const split = insertionPoint + 5;
      html = html.slice(0, split) + 
        `<div style="text-align: center; margin: 30px 0;">
          <img src="${blog.images[1].url}" border="0" style="max-width: 100%; height: auto; border-radius: 12px;" />
        </div>` + 
        html.slice(split);
    } else {
      html += `<div style="text-align: center; margin-top: 30px;">
        <img src="${blog.images[1].url}" border="0" style="max-width: 100%; height: auto; border-radius: 12px;" />
      </div>`;
    }
  }

  // Add Schema as hidden block
  html += `<div style="display:none !important;">${blog.seoData.schema}</div>`;
  
  return html;
}
