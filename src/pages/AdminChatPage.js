import React, { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import {jwtDecode} from "jwt-decode";

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      fullName
      role
    }
  }
`;

const AdminChatPage = () => {
  const token = localStorage.getItem("token");
  const decodedToken = token ? jwtDecode(token) : null;
  const adminId = decodedToken?.id;

  if (!adminId) {
    console.error("Admin ID is missing in the token.");
  }

  const { data, loading, error } = useQuery(GET_USERS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "login", userId: adminId }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (
        selectedUser &&
        data.conversationId ===
          `${Math.min(adminId, selectedUser.id)}_${Math.max(adminId, selectedUser.id)}`
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setSocket(ws);

    return () => ws.close();
  }, [adminId, selectedUser]);

  const joinConversation = (user) => {
    const conversationId =
      Math.min(adminId, user.id) + "_" + Math.max(adminId, user.id);
    setSelectedUser(user);

    if (socket) {
      socket.send(
        JSON.stringify({ type: "join", conversationId, userId: adminId })
      );
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !socket) return;

    const conversationId =
      Math.min(adminId, selectedUser.id) + "_" + Math.max(adminId, selectedUser.id);

    const message = {
      type: "message",
      conversationId,
      senderId: adminId,
      receiverId: selectedUser.id,
      message: newMessage,
    };

    socket.send(JSON.stringify(message));
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const users = data?.users?.filter((user) => user.role === "user") || [];

  return (
    <div className="p-6 bg-gray-900 text-white h-screen">
      <h1 className="text-2xl font-bold mb-4">Chat with Users</h1>
      <div className="mb-4">
        <div className="flex space-x-4">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => joinConversation(user)}
              className={`px-4 py-2 rounded ${
                selectedUser?.id === user.id ? "bg-blue-500" : "bg-gray-800"
              }`}
            >
              {user.fullName}
            </button>
          ))}
        </div>
      </div>
      {selectedUser ? (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-4">Chat with: {selectedUser.fullName}</h2>
          <div className="bg-gray-800 p-4 rounded shadow mb-4 h-64 overflow-y-auto">
            {messages.map((msg, idx) => (
              <p key={idx} className={`text-${msg.senderId === adminId ? "blue" : "green"}-400`}>
                {msg.senderId === adminId ? "You" : selectedUser.fullName}: {msg.message}
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
        <p>Please select a user to start chatting.</p>
      )}
    </div>
  );
};

export default AdminChatPage;
