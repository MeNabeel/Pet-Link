import API_URL from '@/config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, ArrowLeft, User, MapPin, PawPrint, ShieldCheck, 
  Clock, AlertCircle, RefreshCw, Search, SlidersHorizontal,
  Phone, MoreVertical, X, Paperclip, Camera, MessageSquareCode,
  ChevronRight
} from 'lucide-react';
import PetImage from '../components/PetImage';
import './PetChat.css';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

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
  // 1. TOP-LEVEL STATE DEFINITIONS
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [userConversations, setUserConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatPet, setChatPet] = useState(null);
  const [chatOwner, setChatOwner] = useState(null);

  const messagesEndRef = useRef(null);

  // 2. NORMALIZED DERIVED VARIABLES (DECLARING BEFORE HOOKS)
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

  // 3. FETCH USER CONVERSATIONS INBOX
  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/chat/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.conversations && Array.isArray(data.conversations)) {
          setUserConversations(data.conversations);
        }
      })
      .catch(err => console.error('Error fetching user conversations:', err));
  }, [userId, conversation?.id]);

  // 4. SWITCH ACTIVE CONVERSATION HANDLER
  const handleSwitchConversation = (selectedConv) => {
    if (!selectedConv || (conversation && conversation.id === selectedConv.id)) return;
    setConversation(selectedConv);
    if (selectedConv.pet) setChatPet(selectedConv.pet);
    if (selectedConv.otherUser) setChatOwner(selectedConv.otherUser);
    setLoading(true);
    setError('');
    fetch(`${API_URL}/api/chat/messages/${selectedConv.id}`)
      .then(res => res.json())
      .then(data => {
        setMessages(data.messages || []);
      })
      .catch(err => console.error('Error loading messages for selected conversation:', err))
      .finally(() => {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      });
  };

  // 5. INITIALIZE OR FETCH CONVERSATION
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
            if (latestConv.pet) setChatPet(latestConv.pet);
            if (latestConv.otherUser) setChatOwner(latestConv.otherUser);
          }
        }
      }

      if (!targetPetId || !targetOwnerId) {
        setError('No active conversation selected. Browse Marketplace to message a pet owner.');
        setLoading(false);
        return;
      }

      // Fetch pet details if missing
      if (!activePet && targetPetId) {
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
      if (!activeOwner && targetOwnerId) {
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

  // 6. POLLING FOR INCOMING MESSAGES
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

  // 7. SEND MESSAGE HANDLER
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

  // Filter conversations by search query
  const filteredConversations = userConversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const partnerName = (c.otherUser?.name || '').toLowerCase();
    const petName = (c.pet?.name || '').toLowerCase();
    const petBreed = (c.pet?.breed || '').toLowerCase();
    return partnerName.includes(q) || petName.includes(q) || petBreed.includes(q);
  });

  return (
    <div className="pet-chat-container">
      
      {/* OPTIONAL TOP NAV BAR */}
      {activeOnBack && (
        <div className="pet-chat-top-bar">
          <button type="button" className="chat-back-btn" onClick={activeOnBack}>
            <ArrowLeft size={16} />
            <span>Back to Marketplace</span>
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE GRID: INBOX CONVERSATION LIST & ACTIVE CHAT */}
      <div className="pet-chat-workspace">

        {/* LEFT PANEL: CONVERSATION LIST */}
        <aside className="pet-chat-inbox-panel">
          <div className="inbox-header-box">
            <div className="inbox-title-row">
              <div>
                <h2 className="inbox-main-title">Pet Messages</h2>
                <p className="inbox-subtitle">All your conversations with pet owners</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="inbox-search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="inbox-search-input"
                placeholder="Search owners or pets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" className="inbox-filter-btn" title="Filter conversations">
                <SlidersHorizontal size={14} />
              </button>
            </div>
          </div>

          {/* Conversation List Scroll Area */}
          <div className="inbox-cards-list">
            {userConversations.length === 0 ? (
              <div className="inbox-empty-card">
                <MessageSquareCode size={32} className="empty-icon" />
                <p className="empty-title">No Conversations</p>
                <p className="empty-desc">Message pet owners on the Marketplace to start chatting.</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="inbox-empty-card">
                <p className="empty-desc">No matching conversations found.</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conversation && conversation.id === conv.id;
                const partner = conv.otherUser || {};
                const petInfo = conv.pet || {};
                const partnerName = partner.name || 'Pet Owner';
                const petName = petInfo.name || 'Pet';
                const petBreed = petInfo.breed ? `${petInfo.breed} • ${petInfo.species || 'Pet'}` : (petInfo.species || 'Pet');
                const timeAgo = formatRelativeTime(conv.updatedAt || conv.createdAt);

                return (
                  <div
                    key={conv.id}
                    className={`conversation-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSwitchConversation(conv)}
                  >
                    {/* OWNER AVATAR (MUST represent the OWNER) */}
                    <div className="conv-avatar-wrapper">
                      <img
                        src={partner.profilePic || '/logo/logo.jpeg'}
                        alt={partnerName}
                        className="conv-owner-avatar"
                      />
                      <span className="conv-online-dot" />
                    </div>

                    <div className="conv-card-body">
                      <div className="conv-card-header-row">
                        <h4 className="conv-owner-name">{partnerName}</h4>
                        <span className="conv-time">{timeAgo}</span>
                      </div>

                      <div className="conv-pet-tag">
                        <PawPrint size={11} />
                        <span>{petName} • {petBreed}</span>
                      </div>

                      <p className="conv-last-msg">
                        {conv.lastMessage || 'Click to view message history'}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="conv-unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT PANEL: ACTIVE CHAT */}
        <main className="pet-chat-main-panel">
          
          {/* 1. CHAT HEADER */}
          <div className="chat-header-bar">
            <div className="chat-header-left">
              <div className="chat-owner-avatar-container">
                {activeOwner && activeOwner.profilePic ? (
                  <img src={activeOwner.profilePic} alt={ownerName} className="chat-header-avatar" />
                ) : (
                  <div className="chat-header-avatar-placeholder"><User size={20} /></div>
                )}
                <span className="chat-header-online-dot" />
              </div>

              <div className="chat-header-user-meta">
                <div className="chat-header-name-row">
                  <h3 className="chat-header-name">{ownerName}</h3>
                  <span className="chat-header-status-badge">● Online</span>
                </div>
                {activePet && (
                  <span className="chat-header-pet-badge">
                    <PawPrint size={12} style={{ marginRight: '4px' }} />
                    <span>{activePet.name} • {activePet.breed || activePet.species}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="chat-header-actions">
              <button 
                type="button" 
                className="header-action-btn" 
                title="Call Owner"
                onClick={() => {
                  if (activeOwner?.phone) alert(`Phone Number: ${activeOwner.phone}`);
                  else alert('Owner phone number not available.');
                }}
              >
                <Phone size={16} />
              </button>
              <button type="button" className="header-action-btn" title="More Options">
                <MoreVertical size={16} />
              </button>
              {activeOnBack && (
                <button type="button" className="header-action-btn" title="Close Chat" onClick={activeOnBack}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* CHAT BODY SCROLL AREA */}
          <div className="chat-body-scroll">
            
            {/* 2. COMPACT PET INFORMATION CARD (DIRECTLY ABOVE MESSAGE HISTORY) */}
            {activePet && (
              <div className="chat-pet-context-card">
                <div className="context-card-left">
                  <div className="context-img-wrapper">
                    <PetImage src={activePet.image} imageSettings={activePet.imageSettings} type="card" className="context-pet-img" />
                    <span className={`context-status-tag ${activePet.activeStatus ? activePet.activeStatus.toLowerCase() : 'for_sale'}`}>
                      {activePet.activeStatus === 'FOR_SALE' ? 'FOR SALE' : 'FOR ADOPTION'}
                    </span>
                  </div>

                  <div className="context-details-info">
                    <div className="context-title-row">
                      <h4 className="context-pet-name">{activePet.name}</h4>
                      <span className="context-pet-species">{activePet.breed} • {activePet.species}</span>
                    </div>

                    <div className="context-price-row">
                      {activePet.activeStatus === 'FOR_SALE' ? (
                        <span className="context-price">{activePet.price ? `${activePet.price.toLocaleString()} PKR` : 'Call for Price'}</span>
                      ) : (
                        <span className="context-free-adoption">Free Adoption</span>
                      )}
                    </div>

                    <div className="context-meta-row">
                      <span className="context-meta-item">
                        <MapPin size={12} className="icon" />
                        {activePet.city || 'Lahore'}, {activePet.province || 'Punjab'}
                      </span>
                      <span className="context-meta-divider">•</span>
                      <span className="context-meta-item">Age: {activePet.age || 'N/A'}</span>
                      <span className="context-meta-divider">•</span>
                      <span className="context-meta-item">Gender: {activePet.gender || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {onViewPetDetails && (
                  <div className="context-card-right">
                    <button
                      type="button"
                      className="context-view-btn"
                      onClick={() => onViewPetDetails(activePet._id || activePet.id)}
                    >
                      <span>View Full Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. DATE DIVIDER */}
            <div className="chat-date-divider">
              <span className="date-line" />
              <span className="date-badge">Today</span>
              <span className="date-line" />
            </div>

            {/* 4. MESSAGE HISTORY */}
            {loading ? (
              <div className="chat-state-box">
                <RefreshCw size={24} className="spinning-icon" />
                <p>Loading message history...</p>
              </div>
            ) : error ? (
              <div className="chat-state-box error">
                <AlertCircle size={24} color="#EF4444" />
                <p>{error}</p>
                <button type="button" className="retry-btn" onClick={initConversation}>Retry</button>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-state-box empty">
                <div className="empty-avatar-circle">
                  <PawPrint size={26} color="var(--color-primary)" />
                </div>
                <h4>Start the Conversation</h4>
                <p>Send a message to <strong>{ownerName}</strong> about <strong>{activePet ? activePet.name : 'this pet'}</strong>.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = String(msg.senderId) === String(userId);
                const msgTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={msg.id || msg._id} className={`chat-message-row ${isUser ? 'outgoing' : 'incoming'}`}>
                    {!isUser && (
                      <img
                        src={activeOwner?.profilePic || '/logo/logo.jpeg'}
                        alt={ownerName}
                        className="message-sender-avatar"
                      />
                    )}

                    <div className="message-bubble-wrapper">
                      <div className={`message-bubble ${isUser ? 'outgoing-bubble' : 'incoming-bubble'}`}>
                        <p className="message-text">{msg.text}</p>
                        
                        {/* Media preview if message contains mediaUrl */}
                        {msg.mediaUrl && (
                          <div className="message-media-preview">
                            <img src={msg.mediaUrl} alt="Attachment" className="message-img-attachment" />
                          </div>
                        )}
                      </div>

                      <span className="message-timestamp">
                        <Clock size={10} style={{ marginRight: '3px' }} />
                        {msgTime}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 5. MESSAGE COMPOSER */}
          <form className="chat-composer-form" onSubmit={handleSendMessage}>
            <div className="composer-container">
              <button type="button" className="composer-action-btn" title="Attach file">
                <Paperclip size={18} />
              </button>
              <button type="button" className="composer-action-btn" title="Add photo">
                <Camera size={18} />
              </button>

              <input
                type="text"
                className="composer-input"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
              />

              <button
                type="submit"
                className="composer-send-btn"
                disabled={!inputText.trim() || sending || loading}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </div>
          </form>

        </main>

      </div>
    </div>
  );
}

