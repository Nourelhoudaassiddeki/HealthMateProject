import { useState } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse, isLoading }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Add user message to chat history
    const updatedHistory = [
      ...chatHistory,
      { role: "user", text: message, parts: [{ text: message }] }
    ];
    
    setChatHistory(updatedHistory);
    setMessage("");
    
    // Generate bot response
    generateBotResponse(updatedHistory);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="Send a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
        required
      ></textarea>
      <button type="submit" className="send-btn" disabled={isLoading}>
        <span className="material-symbols-rounded">
          {isLoading ? "hourglass_empty" : "send"}
        </span>
      </button>
    </form>
  );
};

export default ChatForm;