
import express from "express";
import dotenv from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import fs from 'fs';
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter} from "@langchain/textsplitters"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";





dotenv.config();

const app = express();
const port = 5001;

app.use(express.json());
//exporting GOOGLE_API_KEY--------------------------->>>
// const ai = new GoogleGenAI({
//   apiKey: process.env.GOOGLE_API_KEY,
// });





//Now using Groq api ----------->
const llm =new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0.7,
  maxTokens: 1000,
  maxRetries: 2
})

//Embedding model integration ----->>>>

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001", // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: "Document title",
});


const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  collectionName: "grocery-store",
});
//Text extraction ----->>>>>>>

const upload = async()=>{
  const pdfpath="./Knowledge.pdf"
  const buffer =fs.readFileSync(pdfpath)//buffer used to store raw binary data
  const pdfResult= new PDFParse({data:buffer})
  const result = await pdfResult.getText()//extract text from image 

  //chunks ---> all data and them split in chunks 
  //step 1 -->> All data in one chunk 
  const text = result.text
  //step -2 ----> Text Spltter and the chunking 
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:1000, 
    chunkOverlap:100 //it is used for the Overlaping so that none of the data is lost during extr5action 


  })
 const docs = await splitter.createDocuments([text])
 await vectorStore.addDocuments(docs);


}




//LangGrap ----------------->>>>>
//State making (ab kaam ni karegi because i have to make conditional edge)
// const state = Annotation.Root({
//   prompt:Annotation,
//   aiMsg:Annotation
// })




app.post("/ai", async (req, res) => {

    const { input } = req.body;

    // Retrieve the 5 most similar document chunks
    const docs = await vectorStore.similaritySearch(input, 5);

    // Combine retrieved chunks into context
    const context = docs.map((d) => d.pageContent).join("\n");

    // Give the context to the LLM
    const response = await llm.invoke([     //Rules can be also fed in pdf and also here 
      new SystemMessage(`You are a RAG AI assistant. 

STRICT RULES:
- Answer ONLY from the provided context.
- Do not use outside knowledge.
- If the answer is not found, say:
  "I don't know from uploaded PDF."
When listing items, use this format:
      1). Rice
      2). Wheat Flour
      3). Multigrain Atta



Context:
${context}
`),
      new HumanMessage(input),
    ]);
    console.log("LLM Response:", response);
console.log("LLM Content:", response.content.replace(/\n/g, " "));

    return res.status(200).json({
      ai: response.content
    });
  

});



//Get enpoint ----------------->>>
app.get("/", (req, res) => {
  return res.json({
    message: "Hello from level 4",
  });
});

app.listen(port, () => {
  console.log("Server Started");
});
