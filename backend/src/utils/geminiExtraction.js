import { GoogleGenerativeAI } from "@google/generative-ai"
import {APIError} from "./APIError.js"
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const EXTRACTION_PROMPT = `
You are analyzing a course syllabus. Extract the topics and their weightage.
 
Return ONLY strict JSON, no markdown, no backticks, no explanation, in this exact shape:
{
  "topics": [
    { "name": "string", "weightagePercent": number, "subtopics": ["string"] }
  ]
}
 
Rules:
- If the syllabus table has weightage spanning multiple rows (merged cells), split
  that weightage proportionally across all topics in that group.
- weightagePercent values across all topics must sum to 100.
- Preserve the order topics appear in the syllabus.
- If no explicit weightage is given anywhere, distribute 100 evenly across topics.
`;

export async function extractTopicsFromFile(fileBuffer, mimeType) {
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash"});

    const result = await model.generateContent([
        {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType,
            },
        },
        { text: EXTRACTION_PROMPT },
    ])

    const rawResponse = result.response.text().trim();

    const cleaned = rawResponse.replace(/^```json\s*|```\s*$/g, "");

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch (err) {
        throw new APIError(400, "Gemini returned invalid JSON")
    }

    if (!Array.isArray(parsed.topics) || parsed.topics.length === 0) {
        throw new APIError(400, "gemini generated missing topics array")
    }

    return parsed.topics;
}