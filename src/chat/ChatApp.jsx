import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "../components/ChatbotIcon";
import ChatForm from "../components/ChatForm";
import ChatMessage from "../components/ChatMessage";
import { companyInfo } from "../companyInfo";
import "./chat.css";

const ChatApp = () => {
  const chatBodyRef = useRef();
  const [showChatbot, setShowChatbot] = useState(false);
  const [pharmaData, setPharmaData] = useState(null);
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
    {
      role: "model",
      text: "Hey there! 👋 How can I help you with MedCare Assist today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataFetchError, setDataFetchError] = useState(null);

  // Fetch the db.json data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/db.json');
        if (!response.ok) {
          throw new Error(`Failed to load database (Status: ${response.status})`);
        }
        const data = await response.json();
        setPharmaData(data);
      } catch (error) {
        console.error("Error loading database:", error);
        setDataFetchError(error.message);
      }
    };
    
    fetchData();
  }, []);

  // Function to search medicine information with fuzzy matching
  const searchMedicineInfo = (medicineName) => {
    if (!pharmaData?.medicines?.length) return [];
    
    // Convert search term to lowercase for case-insensitive searching
    const searchTerm = medicineName.toLowerCase().trim();
    if (!searchTerm) return [];
    
    // Search through pharmaData for matching medicines
    return pharmaData.medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchTerm) ||
      (medicine.composition && medicine.composition.toLowerCase().includes(searchTerm))
    );
  };

  const generateBotResponse = async (history) => {
    setIsLoading(true);
    
    // Add a thinking message
    setChatHistory(prev => [
      ...prev,
      { role: "model", text: "Thinking...", isThinking: true }
    ]);

    // Helper function to update chat history
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => !msg.isThinking), 
        { role: "model", text, isError }
      ]);
      setIsLoading(false);
    };

    try {
      // Extract the user's latest message
      const userMessage = history[history.length - 1].text || '';
      
      // Handle database fetch errors
      if (dataFetchError && (
          userMessage.toLowerCase().includes("medicine") ||
          userMessage.toLowerCase().includes("pharmacy")
      )) {
        updateHistory(`I'm having trouble accessing our database at the moment. Please try again later or contact support if this issue persists.`);
        return;
      }
      
      // Check if it's a medicine-related query
      if (userMessage.toLowerCase().includes("medicine") ||
          userMessage.toLowerCase().includes("drug") ||
          userMessage.toLowerCase().includes("medication")) {
        
        // Extract potential medicine name from query
        const medicineQuery = userMessage
          .replace(/.*(?:about|find|search|tell me about|what is|information on|details for|do you know|lookup)\s+(?:medicine|drug|medication)(?:\s+called|named|\s+is)?\s+/i, "")
          .replace(/\?+$/, "")
          .trim();
        
        if (medicineQuery) {
          const medicineResults = searchMedicineInfo(medicineQuery);
          
          if (medicineResults.length > 0) {
            // Format medicine information for chat
            let response = '';
            
            if (medicineResults.length === 1) {
              const med = medicineResults[0];
              response = `Here's what I found about **${med.name}**:\n\n` +
                `**Composition:** ${med.composition || 'Information not available'}\n` +
                `**Manufacturer:** ${med.manufacturer || 'Information not available'}\n` +
                `**Uses:** ${med.uses || 'Information not available'}\n` +
                `**Side Effects:** ${med.side_effects || 'Information not available'}\n` +
                `**Price:** $${med.price || 'Price not available'}\n` +
                `**Average Review:** ${med.average_review || 'No reviews yet'}%`;
            } else {
              response = `I found ${medicineResults.length} medicines that match "${medicineQuery}":\n\n` +
                medicineResults.slice(0, 3).map(med => 
                  `**${med.name}**\n` +
                  `**Manufacturer:** ${med.manufacturer || 'Information not available'}\n` +
                  `**Uses:** ${med.uses?.substring(0, 100) || 'Information not available'}${med.uses?.length > 100 ? '...' : ''}\n` +
                  `**Price:** $${med.price || 'Price not available'}`
                ).join("\n\n");
              
              if (medicineResults.length > 3) {
                response += `\n\nPlease ask for a specific medicine if you want more detailed information.`;
              }
            }
            
            updateHistory(response);
            return;
          } else {
            updateHistory(`I couldn't find any information about "${medicineQuery}" in our database. Would you like information about another medication or service?`);
            return;
          }
        }
      }

      // Check if it's a pharmacy-related query
      if (userMessage.toLowerCase().includes("pharmacy") || 
          userMessage.toLowerCase().includes("pharmacies")) {
        
        if (pharmaData?.pharmacies?.length > 0) {
          // Filter for open pharmacies if requested
          let filteredPharmacies = pharmaData.pharmacies;
          if (userMessage.toLowerCase().includes("open") || 
              userMessage.toLowerCase().includes("available") ||
              userMessage.toLowerCase().includes("24 hour")) {
            filteredPharmacies = pharmaData.pharmacies.filter(p => 
              p.status?.toLowerCase() === "open" || 
              p.status?.toLowerCase().includes("24 hour")
            );
          }
          
          if (filteredPharmacies.length === 0) {
            updateHistory("I couldn't find any pharmacies matching your criteria. Would you like to see all available pharmacies instead?");
            return;
          }
          
          const pharmacyInfo = filteredPharmacies.map(pharmacy => 
            `**${pharmacy.name}**\n` +
            `**Address:** ${pharmacy.address || 'Address not available'}\n` +
            `**Phone:** ${pharmacy.phone || 'Phone not available'}\n` +
            `**Status:** ${pharmacy.status || 'Status not available'}\n` +
            `**Website:** ${pharmacy.link || 'Website not available'}`
          ).join("\n\n");
          
          updateHistory(`Here's information about ${filteredPharmacies.length === pharmaData.pharmacies.length ? 'our' : 'the matching'} partner pharmacies:\n\n${pharmacyInfo}`);
          return;
        } else {
          updateHistory("I don't have any pharmacy information available at the moment. You can check our website or contact customer support for the latest pharmacy details.");
          return;
        }
      }

      // Check for dialysis-related queries
      if (userMessage.toLowerCase().includes("dialysis") || 
          userMessage.toLowerCase().includes("dialysis center")) {
        updateHistory("To find the nearest dialysis center, please visit our website at www.medcareassist.com or call our support line at +1 (555) 789-1234 for immediate assistance.");
        return;
      }

      // Check for contact or support queries
      if (userMessage.toLowerCase().includes("contact") || 
          userMessage.toLowerCase().includes("support") ||
          userMessage.toLowerCase().includes("help") ||
          userMessage.toLowerCase().includes("phone") ||
          userMessage.toLowerCase().includes("email")) {
        updateHistory("You can reach our support team via email at support@medcareassist.com or call us at +1 (555) 789-1234. Our team is available to assist you 24/7.");
        return;
      }

      // Format chat history for API request for non-database queries
      // Remove the thinking message and hidden messages before sending to API
      const filteredHistory = history.filter(msg => !msg.isThinking && !msg.hideInChat);
      const formattedHistory = filteredHistory.map(({ role, text }) => ({ role, parts: [{ text }] }));
      
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: formattedHistory }),
      };

      // Make the API call to get the bot's response
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || `API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Clean and update chat history with bot's response
      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\\*(.?)\\*/g, "$1")
        .trim();
      
      updateHistory(apiResponseText);
    } catch (error) {
      // Update chat history with the error message
      console.error("Chat error:", error);
      updateHistory("I'm sorry, I encountered an error while processing your request. Please try again later.", true);
    }
  };

  useEffect(() => {
    // Auto-scroll whenever chat history updates
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        onClick={() => setShowChatbot((prev) => !prev)}
        id="chatbot-toggler"
        aria-label={showChatbot ? "Close chat" : "Open chat"}
      >
        <span className="material-symbols-rounded">{showChatbot ? "close" : "chat"}</span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Healthmate Assist</h2>
          </div>
          <button
            onClick={() => setShowChatbot((prev) => !prev)}
            className="material-symbols-rounded"
            aria-label="Minimize chat"
          >
            keyboard_arrow_down
          </button>
        </div>
        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          {/* Render the chat history dynamically */}
          {chatHistory.map((chat, index) => (
            !chat.hideInChat && <ChatMessage key={index} chat={chat} />
          ))}
          {isLoading && chatHistory.every(msg => !msg.isThinking) && (
            <div className="message bot-message thinking">
              <ChatbotIcon />
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatApp;