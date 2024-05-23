import express from "express";
import { Groq } from "groq-sdk";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_DOMAIN,
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.post("/get-respon", async (req, res) => {
  const { text } = req.body;
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: true,
      stop: null,
    });

    let response = "";
    for await (const chunk of chatCompletion) {
      response += chunk.choices[0]?.delta?.content || "";
    }

    res.send(response);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
