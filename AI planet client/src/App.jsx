import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Logo from "./Logo";
import { Message } from "./Message";

export default function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setIsLoading(true);

      //creating a new form data object
      const formData = new FormData();
      formData.append("file", file);

      try {
        // Add headers to the request
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        };

        //making a post request to the server to upload the pdf file
        const response = await axios.post(
          "http://localhost:8000/upload-pdf",
          formData,
          config
        );

        if (response.status === 200) {
          setMessages((prev) => [
            ...prev,
            {
              isAI: true,
              content: `PDF "${file.name}" has been uploaded successfully. How can I help you with this document?`,
            },
          ]);
        }
      } catch (error) {
        console.error("Error uploading file:", error);

        if (error.response) {
          console.error("Server error:", error.response.data);
          alert(
            `Server error: ${
              error.response.data.detail ||
              error.response.data.message ||
              "Unknown error"
            }`
          );
        } else if (error.request) {
          // No response received
          console.error("No response received:", error.request);
          alert(
            "Server is not responding. Please check if the server is running on port 8000"
          );
        } else {
          // Request setup error
          console.error("Request setup error:", error.message);
          alert(`Error setting up request: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Please upload a PDF file");
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !pdfFile || isLoading) return;

    const userMessage = message;
    setMessage("");
    setMessages((prev) => [...prev, { isAI: false, content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/chat", {
        message: userMessage,
      });

      if (response.status === 200) {
        setMessages((prev) => [
          ...prev,
          {
            isAI: true,
            content: response.data.response,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          isAI: true,
          content:
            "I apologize, but I encountered an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-5xl mx-auto px-4">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-3">
          {pdfFile && (
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 4.5V14C14 14.5523 13.5523 15 13 15H3C2.44772 15 2 14.5523 2 14V2C2 1.44772 2.44772 1 3 1H10.5L14 4.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              {pdfFile.name}
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          <button
            onClick={handleButtonClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-200 border border-gray-200 rounded-lg disabled:opacity-50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1V12M8 12L4 8M8 12L12 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M1 14H15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            {isLoading ? "Processing..." : "Upload PDF"}
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 py-6 overflow-y-auto" ref={chatContainerRef}>
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <Message
              key={index}
              isAI={msg.isAI}
              content={msg.content}
              sources={msg.sources}
            />
          ))}
          {isLoading && (
            <Message isAI={true} content="Processing your request..." />
          )}
        </div>
      </div>

      {/* Message Input and Submit Form */}
      <form onSubmit={handleSubmit} className="py-4 border-t border-gray-200">
        <div className="flex items-center gap-2 w-full px-4 py-2 rounded-lg border border-gray-200">
          <input
            type="text"
            placeholder={
              pdfFile ? "Send a message..." : "Upload a PDF to start chatting"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 outline-none text-gray-900 placeholder-gray-500"
            disabled={!pdfFile || isLoading}
          />
          <button
            type="submit"
            disabled={!pdfFile || isLoading || !message.trim()}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.3333 1.66667L9.16667 10.8333M18.3333 1.66667L12.5 18.3333L9.16667 10.8333M18.3333 1.66667L1.66667 7.5L9.16667 10.8333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
