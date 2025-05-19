// app/routes/dashboard.chat.tsx
import { useState } from "react";

export default function DashboardChat() {
  // Placeholder state for chat messages
  const [messages, setMessages] = useState([
    { id: 1, sender: "AI", text: "Hello! How can I assist you today?" },
    {
      id: 2,
      sender: "User",
      text: "I need information about recent incidents.",
    },
    {
      id: 3,
      sender: "AI",
      text: "Sure, please specify the area or type of incident.",
    },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      // Add user message and a mock AI response
      setMessages([
        ...messages,
        { id: Date.now(), sender: "User", text: inputText },
        {
          id: Date.now() + 1,
          sender: "AI",
          text: "Processing your request...",
        }, // Mock response
      ]);
      setInputText("");
      // Here you would typically call an API to get a real response
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {" "}
      {/* Adjust height as needed */}
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        AI Assistant
      </h1>
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "User" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${
                message.sender === "User"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      {/* Chat input area */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          Send
        </button>
      </div>
    </div>
  );
}
