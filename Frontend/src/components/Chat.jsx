import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom'; // Import navigate for redirection

export const Chat = ({ user }) => {
  if (!user) return <div>Loading...</div>;

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate(); // Initialize navigate for redirection

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join', user._id);

    return () => newSocket.close();
  }, [user._id]);

  useEffect(() => {
    if (socket) {
      socket.on('previousMessages', (messages) => setMessages(messages));
      socket.on('message', (message) => setMessages((prev) => [...prev, message]));
      socket.on('typing', (data) => {
        setTyping(data);
        setTimeout(() => setTyping(''), 2000);
      });
      socket.on('updateOnlineUsers', (users) => setOnlineUsers(users));
    }
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket) {
      socket.emit('sendMessage', {
        userId: user._id,
        username: user.username,
        text: newMessage,
      });
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', `${user.username} is typing...`);
    }
  };

  const handleLeave = () => {
    if (socket) {
      socket.emit('leaveRoom'); // Use a custom event name
      navigate('/login'); // Redirect to login page
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Chat Header */}
      <div className="p-4 bg-gray-900 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">{user.username[0]}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold">{user.username}</h3>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleLeave}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Leave
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h4 className="text-md font-semibold">{onlineUsers.length}</h4>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.userId === user._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md p-4 rounded-lg shadow-lg ${
                message.userId === user._id
                  ? 'bg-white text-black'
                  : 'bg-gray-700 text-white'
              }`}
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <p className="text-md font-semibold">{message.username}</p>
              <p>{message.text}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {typing && (
          <div className="flex items-center space-x-2">
            <span className="text-sm italic text-gray-400">{typing}</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400"></div>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form
        onSubmit={sendMessage}
        className="p-4 bg-gray-900 border-t border-gray-700"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleTyping}
            className="flex-1 p-3 bg-gray-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
