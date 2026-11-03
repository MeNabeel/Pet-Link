import API_URL from '@/config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, ArrowLeft, User, MapPin, PawPrint, ShieldCheck,
  Clock, AlertCircle, RefreshCw, Search,
  Phone, MoreVertical, X, Paperclip, Camera, MessageSquare,
  ChevronRight, Archive, Trash2, CheckCheck
} from 'lucide-react';
import './PetChat.css';

/**
 * Formats time for individual message timestamps (e.g. 8:24 PM)
 */
function formatMessageTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Formats chronological date separator labels (e.g. TODAY, YESTERDAY, 3 NOV 2026)
 */
function getMessageDateDividerLabel(dateString) {
  if (!dateString) return 'TODAY';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'TODAY';

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return 'TODAY';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) return 'YESTERDAY';

  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  }).toUpperCase();
}

/**
 * Formats relative or calendar preview time for the inbox conversation cards
 */
function formatInboxTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Determines real presence based on user account status and genuine database activity timestamps
 */
function isUserOnline(partner, conv) {
  if (!partner) return false;
  if (partner.status && partner.status.toLowerCase() === 'offline') return false;

  const candidateTimes = [
    partner.updatedAt,
    partner.lastSeen,
    conv?.updatedAt
  ].filter(Boolean).map(t => new Date(t).getTime()).filter(t => !isNaN(t));

  if (candidateTimes.length === 0) {
    return partner.status === 'Active';
  }

  const latestTime = Math.max(...candidateTimes);
  const diffMinutes = (Date.now() - latestTime) / (1000 * 60);

  // Online if activity recorded within the last 20 minutes, or status is explicitly 'Active' within 120 minutes
  return diffMinutes <= 20 || (partner.status === 'Active' && diffMinutes <= 120);
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
  // CRITICAL REQUIREMENT: Default to null so opening Pet Messages never auto-selects a random chat
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [userConversations, setUserConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatPet, setChatPet] = useState(null);
  const [chatOwner, setChatOwner] = useState(null);
  const [mobileShowChat, setMobileShowChat] = useState(Boolean(pet || initialPet));
  const [phoneNotice, setPhoneNotice] = useState(null);

  // Archive & Filter Tabs State
  const [chatTab, setChatTab] = useState('all'); // 'all' | 'archived'
  const [archivedIds, setArchivedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('petlink_archived_chats');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // Dropdown Menu & Delete Confirmation State
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteConfirmConv, setDeleteConfirmConv] = useState(null);

  const messagesEndRef = useRef(null);

  // 2. NORMALIZED DERIVED VARIABLES
  const activeUser = user || currentUser;
  const activePet = pet || initialPet || chatPet;
  const activeOwner = owner || initialOwner || chatOwner || (activePet && typeof activePet.owner === 'object' ? activePet.owner : null);
  const activeOnBack = onBack || onBackToMarketplace;

  const userId = activeUser && (activeUser._id || activeUser.id);
  const petId = activePet && (activePet._id || activePet.id);
  const ownerId = activeOwner ? (activeOwner._id || activeOwner.id) : (activePet ? (activePet.ownerId || (typeof activePet.owner === 'string' ? activePet.owner : activePet.owner?._id || activePet.owner?.id)) : null);
  const ownerName = activeOwner ? (activeOwner.name || 'Listing Owner') : 'Listing Owner';

  // Pet Image URL Resolution
  const petImgUrl = activePet?.image || (Array.isArray(activePet?.images) && activePet.images[0]) || activePet?.coverImage || activePet?.photo || null;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close dropdown on global click
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.conv-three-dots-wrapper')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

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

  // 4. SWITCH ACTIVE CONVERSATION HANDLER (Explicit User Click Only)
  const handleSwitchConversation = (selectedConv) => {
    if (!selectedConv) return;
    setMobileShowChat(true);
    if (conversation && conversation.id === selectedConv.id) return;

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

  // Close/Deselect Active Conversation -> Return to WhatsApp Web-inspired empty state
  const handleCloseActiveChat = () => {
    setConversation(null);
    setChatPet(null);
    setChatOwner(null);
    setMobileShowChat(false);
    setMessages([]);
  };

  // Archive Handler
  const handleToggleArchive = (convId, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setArchivedIds(prev => {
      const updated = prev.includes(convId) ? prev.filter(id => id !== convId) : [...prev, convId];
      localStorage.setItem('petlink_archived_chats', JSON.stringify(updated));
      return updated;
    });
  };

  // Open Delete Confirmation
  const handleOpenDeleteConfirm = (conv, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setDeleteConfirmConv(conv);
  };

  // Confirm Delete Conversation
  const confirmDeleteConversation = async () => {
    if (!deleteConfirmConv) return;
    const targetId = deleteConfirmConv.id;

    setUserConversations(prev => prev.filter(c => c.id !== targetId));
    localStorage.removeItem(`petlink_chat_${targetId}`);

    try {
      await fetch(`${API_URL}/api/chat/conversation/${targetId}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Error deleting conversation on server:', e);
    }

    if (conversation && conversation.id === targetId) {
      handleCloseActiveChat();
    }
    setDeleteConfirmConv(null);
  };

  // 5. INITIALIZE CONVERSATION ONLY WHEN PET/OWNER ARE EXPLICITLY PROVIDED AS PROPS
  const initExplicitConversation = useCallback(async () => {
    if (!userId) return;

    // Strict guard: DO NOT auto-select or pick a random chat if user opened general Pet Messages
    const explicitPetId = pet ? (pet._id || pet.id) : (initialPet ? (initialPet._id || initialPet.id) : null);
    const explicitOwnerId = owner ? (owner._id || owner.id) : (initialOwner ? (initialOwner._id || initialOwner.id) : null);

    if (!explicitPetId || !explicitOwnerId) {
      // General messages tab opened -> leave conversation empty for user selection
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Fetch pet details if missing
      if (!activePet && explicitPetId) {
        try {
          const pRes = await fetch(`${API_URL}/api/pets/${explicitPetId}`);
          if (pRes.ok) {
            const pData = await pRes.json();
            setChatPet(pData);
          }
        } catch (e) {
          console.error('Error loading chat pet details:', e);
        }
      }

      // Fetch owner details if missing
      if (!activeOwner && explicitOwnerId) {
        try {
          const oRes = await fetch(`${API_URL}/api/auth/profile/${explicitOwnerId}`);
          if (oRes.ok) {
            const oData = await oRes.json();
            setChatOwner(oData);
          }
        } catch (e) {
          console.error('Error loading chat owner details:', e);
        }
      }

      // Find or create conversation with the target pet owner
      const convRes = await fetch(`${API_URL}/api/chat/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          receiverId: explicitOwnerId,
          petId: explicitPetId
        })
      });

      if (!convRes.ok) {
        throw new Error('Failed to initialize conversation.');
      }

      const convData = await convRes.json();
      const convObj = convData.conversation;
      setConversation(convObj);
      setMobileShowChat(true);

      if (convObj && convObj.id) {
        // Unarchive if previously archived
        setArchivedIds(prev => {
          if (prev.includes(convObj.id)) {
            const updated = prev.filter(id => id !== convObj.id);
            localStorage.setItem('petlink_archived_chats', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });

        const msgRes = await fetch(`${API_URL}/api/chat/messages/${convObj.id}`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          setMessages(msgData.messages || []);
          localStorage.setItem(`petlink_chat_${convObj.id}`, JSON.stringify(msgData.messages || []));
        }
      }
    } catch (err) {
      console.error('initExplicitConversation error:', err);
      setError('Could not connect to chat server.');
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [userId, pet, initialPet, owner, initialOwner, activePet, activeOwner]);

  useEffect(() => {
    initExplicitConversation();
  }, [initExplicitConversation]);

  // 6. POLLING FOR INCOMING MESSAGES FOR ACTIVE CONVERSATION
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
    if (e) e.preventDefault();
    if (!inputText.trim() || !conversation || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic message addition with accurate client ISO timestamp
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

  // Keyboard handler for composer: Enter sends message, Shift+Enter adds newline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations by Tab ('all' vs 'archived') and Search Query
  const activeConversations = userConversations.filter(c => !archivedIds.includes(c.id));
  const archivedConversations = userConversations.filter(c => archivedIds.includes(c.id));
  const displayedByTab = chatTab === 'archived' ? archivedConversations : activeConversations;

  const filteredConversations = displayedByTab.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const partnerName = (c.otherUser?.name || '').toLowerCase();
    const petName = (c.pet?.name || '').toLowerCase();
    const petBreed = (c.pet?.breed || '').toLowerCase();
    return partnerName.includes(q) || petName.includes(q) || petBreed.includes(q);
  });

  // Calculate active partner online status
  const isPartnerOnline = isUserOnline(activeOwner, conversation);

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
      <div className={`pet-chat-workspace ${mobileShowChat && conversation ? 'show-chat-view' : 'show-inbox-view'}`}>

        {/* LEFT PANEL: CONVERSATION LIST (WHATSAPP WEB INSPIRED) */}
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
            </div>

            {/* Filter Tabs: All Chats | Archived */}
            <div className="inbox-tabs-bar">
              <button
                type="button"
                className={`inbox-tab-btn ${chatTab === 'all' ? 'active' : ''}`}
                onClick={() => setChatTab('all')}
              >
                All Chats ({activeConversations.length})
              </button>
              <button
                type="button"
                className={`inbox-tab-btn ${chatTab === 'archived' ? 'active' : ''}`}
                onClick={() => setChatTab('archived')}
              >
                Archived ({archivedConversations.length})
              </button>
            </div>
          </div>

          {/* Conversation List Scroll Area */}
          <div className="inbox-cards-list">
            {displayedByTab.length === 0 ? (
              <div className="inbox-empty-card">
                <MessageSquare size={32} className="empty-icon" />
                <p className="empty-title">
                  {chatTab === 'archived' ? 'No Archived Chats' : 'No Active Conversations'}
                </p>
                <p className="empty-desc">
                  {chatTab === 'archived'
                    ? 'Archived conversations will appear here.'
                    : 'Message pet owners on the Marketplace to start chatting.'}
                </p>
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
                const timeLabel = formatInboxTime(conv.updatedAt || conv.createdAt);
                const online = isUserOnline(partner, conv);

                return (
                  <div
                    key={conv.id}
                    className={`conversation-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSwitchConversation(conv)}
                  >
                    {/* OWNER AVATAR WITH ONLINE/OFFLINE DOT */}
                    <div className="conv-avatar-wrapper">
                      <img
                        src={partner.profilePic || partner.avatar || '/logo/logo.jpeg'}
                        alt={partnerName}
                        className="conv-owner-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/logo/logo.jpeg';
                        }}
                      />
                      <span
                        className={`conv-status-dot ${online ? 'online' : 'offline'}`}
                        title={online ? 'Online' : 'Offline'}
                      />
                    </div>

                    <div className="conv-card-body">
                      <div className="conv-card-header-row">
                        <div className="conv-name-status-group">
                          <h4 className="conv-owner-name">{partnerName}</h4>
                          <span className={`conv-status-pill ${online ? 'online' : 'offline'}`}>
                            {online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <span className="conv-time">{timeLabel}</span>
                      </div>

                      <div className="conv-pet-tag">
                        <PawPrint size={11} />
                        <span>{petName} • {petBreed}</span>
                      </div>

                      <p className="conv-last-msg">
                        {conv.lastMessage || 'Click to view message history'}
                      </p>
                    </div>

                    <div className="conv-card-right-group">
                      {conv.unreadCount > 0 && (
                        <span className="conv-unread-badge">{conv.unreadCount}</span>
                      )}

                      {/* THREE-DOT MENU BUTTON & DROPDOWN */}
                      <div className="conv-three-dots-wrapper">
                        <button
                          type="button"
                          className="conv-three-dots-btn"
                          title="More actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === conv.id ? null : conv.id);
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenuId === conv.id && (
                          <div className="conv-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="conv-dropdown-item"
                              onClick={(e) => handleToggleArchive(conv.id, e)}
                            >
                              <Archive size={14} />
                              <span>{archivedIds.includes(conv.id) ? 'Unarchive Chat' : 'Archive Chat'}</span>
                            </button>

                            <div className="conv-dropdown-divider" />

                            <button
                              type="button"
                              className="conv-dropdown-item danger"
                              onClick={(e) => handleOpenDeleteConfirm(conv, e)}
                            >
                              <Trash2 size={14} />
                              <span>Delete Chat</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT PANEL: ACTIVE CHAT OR WHATSAPP-WEB INSPIRED EMPTY STATE */}
        {!conversation ? (
          <main className="pet-chat-empty-panel">
            <div className="chat-empty-container">
              <div className="chat-empty-icon-circle">
                <MessageSquare size={44} strokeWidth={1.8} color="#0066CC" />
              </div>
              <h2 className="chat-empty-title">Your messages</h2>
              <p className="chat-empty-subtitle">
                Select a conversation from the left to view messages and connect with pet owners.
              </p>

              <div className="chat-empty-guidelines">
                <div className="chat-empty-pill">
                  <PawPrint size={14} color="#0066CC" />
                  <span>Verified pet listings and inquiries</span>
                </div>
                <div className="chat-empty-pill">
                  <ShieldCheck size={14} color="#10B981" />
                  <span>Real-time communication & safe adoption coordination</span>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <main className="pet-chat-main-panel">

            {/* 1. CHAT HEADER */}
            <div className="chat-header-bar">
              <div className="chat-header-left">
                <button
                  type="button"
                  className="mobile-back-to-inbox-btn"
                  onClick={handleCloseActiveChat}
                  title="Back to messages inbox"
                  aria-label="Back to inbox"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="chat-owner-avatar-container">
                  {activeOwner && (activeOwner.profilePic || activeOwner.avatar) ? (
                    <img
                      src={activeOwner.profilePic || activeOwner.avatar}
                      alt={ownerName}
                      className="chat-header-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/logo/logo.jpeg';
                      }}
                    />
                  ) : (
                    <div className="chat-header-avatar-placeholder"><User size={20} /></div>
                  )}
                  <span
                    className={`chat-header-status-dot ${isPartnerOnline ? 'online' : 'offline'}`}
                    title={isPartnerOnline ? 'Online' : 'Offline'}
                  />
                </div>

                <div className="chat-header-user-meta">
                  <div className="chat-header-name-row">
                    <h3 className="chat-header-name">{ownerName}</h3>
                    <span className={`chat-header-status-indicator ${isPartnerOnline ? 'online' : 'offline'}`}>
                      <span className="dot" />
                      {isPartnerOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  {activePet && (
                    <button
                      type="button"
                      className="chat-header-pet-badge clickable"
                      onClick={() => onViewPetDetails && onViewPetDetails(activePet._id || activePet.id)}
                      title="View Pet Details"
                    >
                      <PawPrint size={12} style={{ marginRight: '4px' }} />
                      <span>{activePet.name} • {activePet.breed || activePet.species}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="chat-header-actions">
                <button
                  type="button"
                  className="header-action-btn"
                  title="Call Owner"
                  onClick={() => {
                    if (activeOwner?.phone) {
                      setPhoneNotice(`Contact Number: ${activeOwner.phone}`);
                      setTimeout(() => setPhoneNotice(null), 6000);
                    } else {
                      setPhoneNotice('Owner phone number not listed.');
                      setTimeout(() => setPhoneNotice(null), 4000);
                    }
                  }}
                >
                  <Phone size={16} />
                </button>
                <button
                  type="button"
                  className="header-action-btn"
                  title="Close conversation"
                  onClick={handleCloseActiveChat}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Phone notification banner if triggered */}
            {phoneNotice && (
              <div className="chat-phone-banner">
                <span>{phoneNotice}</span>
                <button type="button" onClick={() => setPhoneNotice(null)}>×</button>
              </div>
            )}

            {/* CHAT BODY SCROLL AREA */}
            <div className="chat-body-scroll">

              {/* 2. COMPACT PET CONTEXT CARD */}
              {activePet && (
                <div className="chat-pet-context-card">
                  <div className="context-card-left">
                    <div className="context-img-wrapper">
                      <img
                        src={petImgUrl || '/logo/logo.jpeg'}
                        alt={activePet.name || 'Pet'}
                        className="context-pet-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/logo/logo.jpeg';
                        }}
                      />
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
                          {activePet.city || 'Pakistan'}, {activePet.province || ''}
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
                        <span>View Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 3. MESSAGE HISTORY WITH REAL CHRONOLOGICAL DATE SEPARATORS */}
              {loading ? (
                <div className="chat-state-box">
                  <RefreshCw size={24} className="spinning-icon" />
                  <p>Loading message history...</p>
                </div>
              ) : error ? (
                <div className="chat-state-box error">
                  <AlertCircle size={24} color="#EF4444" />
                  <p>{error}</p>
                  <button type="button" className="retry-btn" onClick={initExplicitConversation}>Retry</button>
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
                messages.map((msg, index) => {
                  const isUser = String(msg.senderId) === String(userId);
                  const msgTime = formatMessageTime(msg.createdAt);
                  const currentDateDivider = getMessageDateDividerLabel(msg.createdAt);
                  const prevDateDivider = index > 0 ? getMessageDateDividerLabel(messages[index - 1].createdAt) : null;
                  const showDateDivider = index === 0 || currentDateDivider !== prevDateDivider;

                  return (
                    <React.Fragment key={msg.id || msg._id || index}>
                      {showDateDivider && (
                        <div className="chat-date-divider">
                          <span className="date-line" />
                          <span className="date-badge">{currentDateDivider}</span>
                          <span className="date-line" />
                        </div>
                      )}

                      <div className={`chat-message-row ${isUser ? 'outgoing' : 'incoming'}`}>
                        {!isUser && (
                          <img
                            src={activeOwner?.profilePic || activeOwner?.avatar || '/logo/logo.jpeg'}
                            alt={ownerName}
                            className="message-sender-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/logo/logo.jpeg';
                            }}
                          />
                        )}

                        <div className="message-bubble-wrapper">
                          <div className={`message-bubble ${isUser ? 'outgoing-bubble' : 'incoming-bubble'}`}>
                            <p className="message-text">{msg.text}</p>

                            {msg.mediaUrl && (
                              <div className="message-media-preview">
                                <img src={msg.mediaUrl} alt="Attachment" className="message-img-attachment" />
                              </div>
                            )}

                            <div className="bubble-footer">
                              <span className="message-timestamp">
                                {msgTime}
                              </span>
                              {isUser && (
                                <CheckCheck size={13} className="read-receipt-icon" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 4. MESSAGE COMPOSER */}
            <form className="chat-composer-form" onSubmit={handleSendMessage}>
              <div className="composer-container">
                <button type="button" className="composer-action-btn" title="Attach file">
                  <Paperclip size={18} />
                </button>
                <button type="button" className="composer-action-btn" title="Add photo">
                  <Camera size={18} />
                </button>

                <textarea
                  rows={1}
                  className="composer-input"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />

                <button
                  type="submit"
                  className="composer-send-btn"
                  disabled={!inputText.trim() || sending || loading}
                  title="Send message"
                >
                  <Send size={15} />
                  <span>Send</span>
                </button>
              </div>
            </form>

          </main>
        )}

      </div>

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmConv && (
        <div className="chat-modal-overlay" onClick={() => setDeleteConfirmConv(null)}>
          <div className="chat-modal-box" onClick={(e) => e.stopPropagation()}>
            <h4 className="chat-modal-title">Delete Conversation</h4>
            <p className="chat-modal-desc">
              Are you sure you want to delete your conversation with <strong>{deleteConfirmConv.otherUser?.name || 'this owner'}</strong> regarding <strong>{deleteConfirmConv.pet?.name || 'this pet'}</strong>?
            </p>
            <div className="chat-modal-actions">
              <button
                type="button"
                className="modal-btn cancel"
                onClick={() => setDeleteConfirmConv(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn danger"
                onClick={confirmDeleteConversation}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
