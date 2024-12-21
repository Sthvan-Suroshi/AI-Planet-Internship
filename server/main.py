from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains import ConversationalRetrievalChain
from pydantic import BaseModel
import os
import tempfile
import shutil

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store conversation state
conversation_chain = None
chat_history = []


class ChatRequest(BaseModel):
    message: str


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    global conversation_chain

    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    # Create a temporary directory
    temp_dir = tempfile.mkdtemp()
    try:
        # Save uploaded file to temporary directory
        temp_pdf_path = os.path.join(temp_dir, "temp.pdf")
        with open(temp_pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Initialize PDF processing
        loader = PyPDFLoader(temp_pdf_path)
        documents = loader.load()

        # Split documents
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_documents(documents)

        # Create embeddings and vector store
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        vector_store = FAISS.from_documents(texts, embeddings)
        print(embeddings)
        # Initialize conversation chain
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
        conversation_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=vector_store.as_retriever(),
            return_source_documents=True
        )

        return {"message": "PDF processed successfully"}

    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Clean up temporary directory
        shutil.rmtree(temp_dir)
        file.file.close()


@app.post("/chat")
async def chat(request: ChatRequest):
    global conversation_chain, chat_history

    if not conversation_chain:
        raise HTTPException(
            status_code=400, detail="Please upload a PDF first")

    try:
        # Get response from conversation chain
        result = conversation_chain.invoke({
            "question": request.message,
            "chat_history": chat_history
        })

        # Update chat history
        chat_history.append((request.message, result["answer"]))

        return {
            "response": result["answer"],
            "source_documents": [
                {
                    "page": doc.metadata.get("page", 0),
                    "content": doc.page_content[:200] + "..."
                }
                for doc in result.get("source_documents", [])
            ]
        }

    except Exception as e:
        print(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
