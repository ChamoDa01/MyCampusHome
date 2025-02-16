import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { TrashIcon } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";

const socket = io(import.meta.env.VITE_BASE_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const Chat = () => {
  const { conversationId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const { accomodationUserId, message } = location.state || {};

  const receiver = state?.receiver || { _id: accomodationUserId };

  // Get userID from local storage
  const userDataString = localStorage.getItem("persist:root");
  let userId = null;
  if (userDataString) {
    const persistedData = JSON.parse(userDataString);
    const userData = JSON.parse(persistedData.user);
    userId = userData.currentUser._id;
  }

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const url = searchQuery
          ? `${import.meta.env.VITE_BASE_URL}/conversations/search/${userId}?searchQuery=${searchQuery}`
          : `${import.meta.env.VITE_BASE_URL}/conversations/${userId}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load conversations");
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId, navigate, conversationId, searchQuery]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/messages/${conversationId}`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        setMessages(await response.json());
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket.on("receiveMessage", (messageData) => {
      setMessages((prev) => [...prev, messageData]);
    });

    socket.on("messageDeleted", (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageDeleted");
    };
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !receiver) return;
    const messageData = { sender: userId, receiver: receiver._id, message: newMessage };
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const sentMessage = await response.json();
      setMessages((prev) => [...prev, sentMessage]);
      socket.emit("sendMessage", sentMessage);
      setNewMessage("");

      if (!conversationId) {
        const updatedConversations = await fetch(`${import.meta.env.VITE_BASE_URL}/conversations/${userId}`);
        if (!updatedConversations.ok) throw new Error("Failed to fetch conversations");
        const conversationsData = await updatedConversations.json();

        const newConversation = conversationsData.find((conv) =>
          conv.participants.some((p) => p._id === receiver._id)
        );

        if (newConversation) {
          navigate(`/newchat/${userId}/${newConversation._id}`, {
            state: { receiver },
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/messages/${messageId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error("Failed to delete message");

      const result = await response.json();
      if (result.success) {
        setMessages(messages.filter((msg) => msg._id !== messageId));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  useEffect(() => {
    if (!state?.receiver && accomodationUserId) {
      setNewMessage(message);
      sendMessage(message);
    }
  }, [accomodationUserId]);

  const handleSelectConversation = (convId, userID, otherUser) => {
    navigate(`/newchat/${userID}/${convId}`, {
      state: {
        receiver: otherUser,
        accomodationUserId: otherUser?._id,
        message: "",
      },
    });

    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteConversation = async (convId, userID) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/conversations/${convId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete conversation");

      setConversations((prev) => prev.filter((conv) => conv._id !== convId));

      navigate(`/newchat/${userID}`, { state: { receiver: null } });
      window.location.reload();
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const groupMessagesByDate = (messages) => {
    const groupedMessages = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const messageDate = new Date(msg.createdAt);
      const formattedDate = format(messageDate, "yyyy-MM-dd");

      if (formattedDate !== currentDate) {
        currentDate = formattedDate;
        groupedMessages.push({
          date: formattedDate,
          messages: [msg],
        });
      } else {
        groupedMessages[groupedMessages.length - 1].messages.push(msg);
      }
    });

    return groupedMessages;
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 w-full bg-gray-100 md:flex-row overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-1/4 bg-white border-r flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Recent chats
              <span className="ml-2 text-sm font-normal text-gray-400">{conversations.length || 0} conversations</span>
            </h2>

            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-2xl 
                 placeholder-gray-400 focus:outline-none focus:ring-2 
                 focus:ring-indigo-500 focus:border-transparent
                 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-red-500 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => {
                  const otherUser = conv.participants?.find((p) => p._id !== userId);
                  const isSelected = conversationId === conv._id;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv._id, userId, otherUser)}
                      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 
              ${isSelected
                          ? "bg-indigo-600 text-white shadow-lg"
                          : "bg-white hover:bg-gray-50 border border-gray-100 shadow-md"}`}
                    >
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium
              ${isSelected ? "bg-indigo-500" : "bg-indigo-100 text-indigo-600"}`}>
                        {otherUser?.firstname && otherUser?.lastname
                          ? `${otherUser.firstname[0]}${otherUser.lastname[0]}`
                          : "U"}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${isSelected ? "text-white" : "text-gray-900"}`}>
                            {otherUser?.firstname && otherUser?.lastname
                              ? `${otherUser.firstname} ${otherUser.lastname}`
                              : "Unknown User"}
                          </p>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv._id, userId);
                        }}
                        className={`p-2 rounded-full transition-all duration-200
                ${isSelected
                            ? "hover:bg-indigo-500 text-indigo-100 hover:text-white"
                            : "hover:bg-red-50 text-gray-400 hover:text-red-500"}`}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex flex-col flex-1 md:w-2/3 h-full bg-gray-50">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-medium">
                {receiver?.firstname && receiver?.lastname
                  ? `${receiver.firstname[0]}${receiver.lastname[0]}`
                  : "U"}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {receiver?.firstname && receiver?.lastname
                    ? `${receiver.firstname} ${receiver.lastname}`
                    : "Unkonwn User"}
                </h2>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-100">
            {groupedMessages.map((group) => (
              <div key={group.date} className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="px-4 py-1 rounded-full bg-gray-200 text-xs font-medium text-gray-500">
                    {format(new Date(group.date), "MMMM dd, yyyy")}
                  </div>
                </div>
                {group.messages.map((msg, index) => {
                  const formattedTime = format(new Date(msg.createdAt), "hh:mm a");
                  const isSender = msg.sender === userId;

                  return (
                    <div
                      key={index}
                      className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`relative group max-w-sm`}>
                        <div
                          className={`p-4 rounded-2xl shadow-lg
                    ${isSender
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none"}`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <span className={`text-xs block mt-1
                    ${isSender ? "text-indigo-200" : "text-gray-400"}`}>
                            {formattedTime}
                          </span>
                        </div>

                        {isSender && (
                          <button
                            className="absolute hidden group-hover:flex -top-2 -right-2 
                             w-6 h-6 items-center justify-center rounded-full 
                             bg-red-100 text-red-500 hover:bg-red-200"
                            onClick={() => deleteMessage(msg._id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1">
              <button className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <input
                type="text"
                className="flex-1 p-3 bg-transparent text-gray-800 placeholder-gray-400 outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
              />
              <button
                onClick={sendMessage}
                className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;