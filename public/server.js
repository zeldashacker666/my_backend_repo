const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for deployment

app.use(cors()); // Enable CORS (for cross-origin requests)
app.use(express.static(path.join(__dirname, "frontend")));
app.use(express.json()); // Middleware to parse JSON bodies

const postsFile = path.join(__dirname, "posts.json");

// Read posts from file safely
function getPosts() {
  try {
    if (!fs.existsSync(postsFile)) return [];
    const data = fs.readFileSync(postsFile, "utf8");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading posts file:", error);
    return [];
  }
}

// Write posts to file safely
function savePosts(posts) {
  try {
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error("Error saving posts:", error);
  }
}

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "home.html"));
});

// Get all posts
app.get("/api/posts", (req, res) => {
  res.json(getPosts());
});

// Create a new post
app.post("/api/posts", (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Post content is required" });
  }

  const posts = getPosts();
  const newPost = {
    id: Date.now(),
    content,
    timestamp: new Date().toISOString(),
  };

  posts.push(newPost);
  savePosts(posts);
  res.status(201).json(newPost);
});

// Delete a post by ID
app.delete("/api/posts/:id", (req, res) => {
  let posts = getPosts();
  const filteredPosts = posts.filter((post) => post.id != req.params.id);

  if (posts.length === filteredPosts.length) {
    return res.status(404).json({ error: "Post not found" });
  }

  savePosts(filteredPosts);
  res.status(200).json({ message: "Post deleted" });
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
