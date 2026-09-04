import API_URL from '@/config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, ArrowLeft, User, MapPin, PawPrint, ShieldCheck, 
  Clock, AlertCircle, RefreshCw
} from 'lucide-react';
import PetImage from '../components/PetImage';
import './PetChat.css';

export default function PetChat({ 
  user, 
  currentUser, 
  pet, 
  initialPet, 
  owner, 
  initialOwner, 
  onBack, 
  onBackToMarketplace, 
  onViewPetDetails 
}) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  
  // Dynamic pet and owner details fetched for conversation context
  const [chatPet, setChatPet] = useState(null);
  const [chatOwner, setChatOwner] = useState(null);

  const messagesEndRef = useRef(null);

  // Normalize input props
  const activeUser = user || currentUser;
  const activePet = pet || initialPet || chatPet;
  const activeOwner = owner || initialOwner || chatOwner || (activePet && typeof activePet.owner === 'object' ? activePet.owner : null);
  const activeOnBack = onBack || onBackToMarketplace;

  const userId = activeUser && (activeUser._id || activeUser.id);
  const petId = activePet && (activePet._id || activePet.id);
  const ownerId = activeOwner ? (activeOwner._id || activeOwner.id) : (activePet ? (activePet.ownerId || (typeof activePet.owner === 'string' ? activePet.owner : activePet.owner?._id || activePet.owner?.id)) : null);
  const ownerName = activeOwner ? (activeOwner.name || 'Listing Owner') : 'Listing Owner';

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize or fetch conversation
  const initConversation = useCallback(async () => {
    if (!userId) {
      setError('Please log in to access pet messages.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      let targetPetId = petId;
      let targetOwnerId = ownerId;

      // If user opened chat without a pre-selected pet, check user's conversation inbox
      if (!targetPetId || !targetOwnerId) {
        const inboxRes = await fetch(`${API_URL}/api/chat/user/${userId}`);
        if (inboxRes.ok) {
          const inboxData = await inboxRes.json();
          if (inboxData.conversations && inboxData.conversations.length > 0) {
            const latestConv = inboxData.conversations[0];
            targetPetId = latestConv.petId;
            targetOwnerId = latestConv.senderId === userId ? latestConv.receiverId : latestConv.senderId;
            setConversation(latestConv);
          }
        }
      }

      if (!targetPetId || !targetOwnerId) {
        setError('No active conversation selected. Browse Marketplace to message a pet owner.');
        setLoading(false);
        return;
      }

      // Fetch pet details if missing
      if (!activePet) {
        try {
          const pRes = await fetch(`${API_URL}/api/pets/${targetPetId}`);
          if (pRes.ok) {
            const pData = await pRes.json();
            setChatPet(pData);
          }
        } catch (e) {
          console.error('Error loading chat pet details:', e);
        }
      }

      // Fetch owner details if missing
      if (!activeOwner) {
        try {
          const oRes = await fetch(`${API_URL}/api/auth/profile/${targetOwnerId}`);
          if (oRes.ok) {
            const oData = await oRes.json();
            setChatOwner(oData);
          }
        } catch (e) {
          console.error('Error loading chat owner details:', e);
        }
      }

      // 1. Get or Create Conversation
      const convRes = await fetch(`${API_URL}/api/chat/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId: targetOwnerId,
          petId: targetPetId
        })
      });

      if (!convRes.ok) {
        throw new Error('Failed to initialize conversation.');
      }

      const convData = await convRes.json();
      const convObj = convData.conversation;
      setConversation(convObj);

      // 2. Fetch Messages for Conversation
      if (convObj && convObj.id) {
        const msgRes = await fetch(`${API_URL}/api/chat/messages/${convObj.id}`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setMessages(msgData.messages || []);
          localStorage.setItem(`petlink_chat_${convObj.id}`, JSON.stringify(msgData.messages || []));
        } else {
          const localMsgs = localStorage.getItem(`petlink_chat_${convObj.id}`);
          if (localMsgs) setMessages(JSON.parse(localMsgs));
        }
      }
    } catch (err) {
      console.error('initConversation error:', err);
      setError('Could not connect to chat server.');
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [userId, ownerId, petId, activePet, activeOwner]);

  useEffect(() => {
    initConversation();
  }, [initConversation]);

  // Polling for incoming messages
  useEffect(() => {
    if (!conversation || !conversation.id) return;
    const interval = setInterval(async () => {
      try {
        const msgRes = await fetch(`${API_URL}/api/chat/messages/${conversation.id}`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.messages && msgData.messages.length !== messages.length) {
            setMessages(msgData.messages);
            scrollToBottom();
          }
        }
      } catch (err) {
        // Silent polling fail fallback
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [conversation, messages.length]);

  // Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !conversation || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic message addition
    const tempMsg = {
      id: `temp-${Date.now()}`,
      conversationId: conversation.id,
      senderId: userId,
      text: messageText,
      createdAt: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, tempMsg];
    setMessages(updatedMessages);
    setTimeout(scrollToBottom, 50);

    try {
      const response = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          senderId: userId,
          text: messageText
        })
      });

      if (response.ok) {
        const resData = await response.json();
        const serverMsg = resData.message;
        
        // Replace temp message with server message
        setMessages(prev => prev.map(m => m.id === tempMsg.id ? serverMsg : m));
        localStorage.setItem(`petlink_chat_${conversation.id}`, JSON.stringify(updatedMessages));
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  return (
    <div className="pet-chat-container">
      
      {/* CHAT HEADER NAV */}
      <div className="pet-chat-header-bar">
        <button type="button" className="chat-back-btn" onClick={activeOnBack}>
          <ArrowLeft size={16} />
          <span>Back to Marketplace</span>
        </button>
        <div className="chat-header-meta">
          <span className="chat-header-subtitle">Direct Inquiry Messaging</span>
        </div>
      </div>

      {/* 70% / 30% CHAT & PET DETAILS WORKSPACE */}
      <div className="pet-chat-workspace">
        
        {/* LEFT COLUMN: 70% MAIN CHAT CONVERSATION */}
        <section className="pet-chat-main-column">
          
          {/* Conversation Header Card */}
          <div className="chat-convo-header">
            <div className="chat-owner-avatar-box">
              {activeOwner && activeOwner.profilePic ? (
                <img src={activeOwner.profilePic} alt={ownerName} className="owner-avatar-img" />
              ) : (
                <User size={18} />
              )}
              <span className="status-online-dot" />
            </div>

            <div className="chat-owner-info">
              <div className="owner-name-row">
                <h3 className="owner-name-title">{ownerName}</h3>
                <span className="owner-status-badge">Available Owner</span>
              </div>
              <span className="chat-pet-ref-tag">
                <PawPrint size={11} style={{ marginRight: '4px' }} />
                Inquiry regarding <strong>{activePet ? activePet.name : 'Pet Listing'}</strong>
              </span>
            </div>
          </div>

          {/* Messages History List */}
          <div className="chat-messages-scroll-area">
            {loading ? (
              <div className="chat-loading-state">
                <RefreshCw size={24} className="spinning-icon" />
                <span>Connecting to chat session...</span>
              </div>
            ) : error ? (
              <div className="chat-error-state">
                <AlertCircle size={24} color="#EF4444" />
                <span>{error}</span>
                <button type="button" className="chat-retry-btn" onClick={initConversation}>Retry</button>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-empty-state">
                <div className="chat-empty-icon-box">
                  <PawPrint size={28} />
                </div>
                <h4>Start the Conversation</h4>
                <p>Send a message to <strong>{ownerName}</strong> about <strong>{pet ? pet.name : 'this pet'}</strong> to inquire about availability, health, or adoption details.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUserMessage = msg.senderId === userId;
                const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div 
                    key={msg.id || msg._id} 
                    className={`chat-bubble-wrapper ${isUserMessage ? 'user-side' : 'owner-side'}`}
                  >
                    <div className={`chat-bubble ${isUserMessage ? 'user-bubble' : 'owner-bubble'}`}>
                      <p className="chat-bubble-text">{msg.text}</p>
                      <span className="chat-bubble-time">
                        <Clock size={9} style={{ marginRight: '3px' }} />
                        {formattedTime}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Message Input Bar */}
          <form className="chat-input-bar" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              className="chat-input-field" 
              placeholder={`Message ${ownerName} about ${activePet ? activePet.name : 'pet'}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="chat-send-btn" 
              disabled={!inputText.trim() || sending || loading}
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </form>

        </section>

        {/* RIGHT COLUMN: 30% PET PROFILE SUMMARY */}
        {activePet && (
          <aside className="pet-chat-summary-column">
            <div className="summary-card">
              <div className="summary-media-wrapper">
                <PetImage src={activePet.image} imageSettings={activePet.imageSettings} type="card" className="summary-pet-img" />
                <span className={`summary-type-badge ${activePet.activeStatus ? activePet.activeStatus.toLowerCase() : 'for_sale'}`}>
                  {activePet.activeStatus === 'FOR_SALE' ? 'For Sale' : 'For Adoption'}
                </span>
              </div>

              <div className="summary-content">
                <div className="summary-header">
                  <h4 className="summary-pet-name">{activePet.name}</h4>
                  <span className="summary-pet-breed">{activePet.breed} • {activePet.species}</span>
                </div>

                <div className="summary-price-box">
                  {activePet.activeStatus === 'FOR_SALE' ? (
                    <span className="summary-price">{activePet.price ? `${activePet.price.toLocaleString()} PKR` : 'Call for Price'}</span>
                  ) : (
                    <span className="summary-adoption">Free Adoption</span>
                  )}
                </div>

                <div className="summary-specs-list">
                  <div className="summary-spec-item">
                    <span className="spec-label">Location:</span>
                    <span className="spec-val">
                      <MapPin size={11} style={{ marginRight: '3px' }} />
                      {activePet.city}, {activePet.province}
                    </span>
                  </div>

                  <div className="summary-spec-item">
                    <span className="spec-label">Age:</span>
                    <span className="spec-val">{activePet.age}</span>
                  </div>

                  <div className="summary-spec-item">
                    <span className="spec-label">Gender:</span>
                    <span className="spec-val">{activePet.gender}</span>
                  </div>

                  {activePet.isVaccinated && (
                    <div className="summary-spec-item">
                      <span className="spec-label">Vaccinated:</span>
                      <span className="spec-val text-emerald">
                        <ShieldCheck size={11} style={{ marginRight: '3px' }} /> Yes
                      </span>
                    </div>
                  )}
                </div>

                {activePet.aboutPet && (
                  <div className="summary-bio-box">
                    <span className="bio-label">About {activePet.name}:</span>
                    <p className="bio-text">{activePet.aboutPet}</p>
                  </div>
                )}

                {onViewPetDetails && (
                  <button 
                    type="button" 
                    className="summary-view-details-btn"
                    onClick={() => onViewPetDetails(activePet._id || activePet.id)}
                  >
                    View Full Pet Details
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}

      </div>

    </div>
  );
}
