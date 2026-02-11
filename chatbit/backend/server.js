const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
console.log("Loaded API Key:", process.env.API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const prompt = `
You are SafeBuddy – a Privacy and Cyber Safety Advisor.

User Question: ${userMessage}

Instructions:
- Give simple, practical advice
- Focus on online privacy and safety
- Use Indian context when relevant
- No illegal or unethical guidance
- Short and clear answers
- Provide safer alternatives
`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const reply =
      response.data.candidates[0].content.parts[0].text;

    res.json({ reply });
  } catch (error) {
    console.log("------ GEMINI FULL ERROR ------");
  console.log(error);
  console.log("------ RESPONSE DATA ------");
  console.log(error.response?.data);
  console.log("------ MESSAGE ------");
  console.log(error.message);

  res.json({ reply: "AI service error. Try again." });
    // res.json({ reply: "AI service error. Try again." });
  }
});

app.listen(5000, () => console.log("Backend running on port 5000"));
