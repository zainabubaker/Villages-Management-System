import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import {jwtDecode} from "jwt-decode";

const GET_ADMINS = gql`
  query GetAdmins {
    users {
      id
      fullName
      role
    }
  }
`;

const UserChatPage = () => {
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const userId = decodedToken?.id;

  if (!userId) {
    console.error("User ID is missing in the token.");
  }

  const { data, loading, error } = useQuery(GET_ADMINS);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "login", userId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (
        selectedAdmin &&
        data.conversationId ===
          `${Math.min(userId, selectedAdmin.id)}_${Math.max(userId, selectedAdmin.id)}`
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);

    return () => ws.close();
  }, [userId, selectedAdmin]);

  const joinConversation = (admin) => {
    const conversationId =
      Math.min(userId, admin.id) + "_" + Math.max(userId, admin.id);
    setSelectedAdmin(admin);

    if (socket) {
      socket.send(
        JSON.stringify({ type: "join", conversationId, userId })
      );
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedAdmin || !socket) return;

    const conversationId =
      Math.min(userId, selectedAdmin.id) + "_" + Math.max(userId, selectedAdmin.id);

    const message = {
      type: "message",
      conversationId,
      senderId: userId,
      receiverId: selectedAdmin.id,
      message: newMessage,
    };

    socket.send(JSON.stringify(message));
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  if (loading) return <p>Loading admins...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const admins = data?.users?.filter((user) => user.role === "admin") || [];

  return (
    <div className="p-6 bg-gray-900 text-white h-screen">
      <h1 className="text-2xl font-bold mb-4">Chat with Admins</h1>
      <div className="mb-4">
        <div className="flex space-x-4">
          {admins.map((admin) => (
            <button
              key={admin.id}
              onClick={() => joinConversation(admin)}
              className={`px-4 py-2 rounded ${
                selectedAdmin?.id === admin.id ? "bg-blue-500" : "bg-gray-800"
              }`}
            >
              {admin.fullName}
            </button>
          ))}
        </div>
      </div>
      {selectedAdmin ? (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-4">Chat with: {selectedAdmin.fullName}</h2>
          <div className="bg-gray-800 p-4 rounded shadow mb-4 h-64 overflow-y-auto">
            {messages.map((msg, idx) => (
              <p key={idx} className={`text-${msg.senderId === userId ? "green" : "blue"}-400`}>
                {msg.senderId === userId ? "You" : selectedAdmin.fullName}: {msg.message}
              </p>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-2 mb-2 border rounded bg-gray-700 text-white"
          />
          <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600">
            Send
          </button>
        </div>
      ) : (
        <p>Please select an admin to start chatting.</p>
      )}
    </div>
  );
};

export default UserChatPage;
