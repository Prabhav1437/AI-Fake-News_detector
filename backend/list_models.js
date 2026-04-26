const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  try {
    // We can't use the genAI object to list models directly easily in some versions
    // But we can use fetch
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("embedContent")) {
          console.log(`- ${m.name} (${m.supportedGenerationMethods.join(", ")})`);
        }
      });
    } else {
      console.log("No models found or error:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

listModels();
