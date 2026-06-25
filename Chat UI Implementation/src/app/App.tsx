import { useState, useRef, useEffect } from "react";
import imgAvatar1 from "@/imports/ChatUiLight/0e3db0f8521e705a254ed3863ebfe2f6bd840e0c.png";
import imgAvatar2 from "@/imports/ChatUiLight/240124fe223ba812d97a11e67d29dadcd4350447.png";
import imgAvatar3 from "@/imports/ChatUiLight/7d853a5644583c9cb88d358a81536fb595482693.png";
import imgAvatar4 from "@/imports/ChatUiLight/1f26be0f376da475a512f048f29c985b99f91b28.png";
import imgAvatar5 from "@/imports/ChatUiLight/642fc265b6e23f6da5ea4780b2ca1891dcba98ba.png";
import imgAvatar6 from "@/imports/ChatUiLight/520480c1111fb2291ee09750a2a8cd8f59aed0d6.png";
import imgProfileLarge from "@/imports/ChatUiLight/74d0bd8029b593c592246da11e68e5ed577dedc1.png";
import imgRect1 from "@/imports/ChatUiLight/e4666e1ed56344ad3a14f916e152d6b3da860f0b.png";
import imgRect2 from "@/imports/ChatUiLight/f18d0704e40e70ec4c5b3d4754adbde024c25f25.png";
import imgRect3 from "@/imports/ChatUiLight/d2b2ccdcb8fc4b27e831e5d5a5685a1d9368905f.png";
import imgRect4 from "@/imports/ChatUiLight/6e1a5e1454d0d8637684a9d61bb14671c92828a9.png";
import imgRect5 from "@/imports/ChatUiLight/87c4f995a573fbd201b305139ef6f80659d4ce1d.png";
import imgRect6 from "@/imports/ChatUiLight/7c0d55ad6927a54da8f0bba8e4423bdfedda2b56.png";
import imgVoiceAvatar from "@/imports/ChatUiLight/1b9092d5c71a878bec6232d6b1b2519634f12ad6.png";
import imgUserLarge from "@/imports/ChatUiLight/ce3f7a197622a1b9b5b3599e1666ae37030526c9.png";

const BLUE = "#1D75DD";
const LIGHT_BLUE = "#D1E6FF";
const PALE_BLUE = "#A5CEFF";
const GRAY = "#555758";
const MUTED = "#989BA1";
const BG = "#D1E6FF";

type Message = {
  id: number;
  from: "them" | "me";
  text: string;
  time: string;
};

type Contact = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  lastMsg: string;
  time: string;
  unread?: boolean;
  active?: boolean;
  messages: Message[];
};

const initialContacts: Contact[] = [
  {
    id: 1,
    name: "Marvin McKinney",
    role: "Nursing Assistant",
    avatar: imgAvatar1,
    lastMsg: "Lorem ipsum dolor sit amet",
    time: "5m",
    messages: [
      { id: 1, from: "them", text: "Hey! Are you available for a quick sync?", time: "10:15 pm" },
      { id: 2, from: "me", text: "Sure, give me 5 minutes!", time: "10:20 pm" },
    ],
  },
  {
    id: 2,
    name: "Jacob Jones",
    role: "Marketing Coordinator",
    avatar: imgAvatar2,
    lastMsg: "Lorem ipsum dolor sit amet",
    time: "5m",
    unread: true,
    messages: [
      { id: 1, from: "them", text: "Can you review the latest campaign deck?", time: "9:00 am" },
      { id: 2, from: "me", text: "I'll take a look this afternoon.", time: "9:05 am" },
      { id: 3, from: "them", text: "Thank you, appreciate it!", time: "9:06 am" },
    ],
  },
  {
    id: 3,
    name: "Leslie Alexander",
    role: "Web Designer",
    avatar: imgAvatar3,
    lastMsg: "Lorem ipsum dolor sit amet",
    time: "5m",
    active: true,
    messages: [
      { id: 1, from: "them", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dolor mollis leo proin turpis eu hac. Tortor dolor eu at bibendum suspendisse. Feugiat mi eu, rhoncus diam consectetur libero morbi pharetra. Id tristique mi eget eget tristique orci.", time: "10:15 pm" },
      { id: 2, from: "me", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Dolor mollis leo proin turpis eu hac. Tortor dolor eu at bibendum suspendisse.", time: "12:15 pm" },
    ],
  },
  {
    id: 4,
    name: "Eleanor Pena",
    role: "Dog Trainer",
    avatar: imgAvatar4,
    lastMsg: "Lorem ipsum dolor sit amet",
    time: "5m",
    messages: [
      { id: 1, from: "them", text: "Do you have time to catch up tomorrow?", time: "3:00 pm" },
    ],
  },
  {
    id: 5,
    name: "Kathryn Murphy",
    role: "Medical Assistant",
    avatar: imgAvatar5,
    lastMsg: "Lorem ipsum dolor sit amet",
    time: "5m",
    messages: [
      { id: 1, from: "them", text: "I sent over the files, let me know if anything looks off.", time: "11:00 am" },
    ],
  },
  {
    id: 6,
    name: "Wade Warren",
    role: "Web Designer",
    avatar: imgAvatar6,
    lastMsg: "Lorem ipsum dolor sit amet",
    time: "5m",
    messages: [
      { id: 1, from: "me", text: "Hey, did you finish the wireframes?", time: "8:30 am" },
      { id: 2, from: "them", text: "Almost done, will send by EOD.", time: "8:45 am" },
    ],
  },
];

const companyContacts = [
  { name: "Acme Co.", country: "Viet Nam", time: "04:15 am", img: imgRect1 },
  { name: "Biffco Enterprises Ltd.", country: "Greece", time: "06:41 pm", img: imgRect2 },
  { name: "Binford Ltd.", country: "South Africa", time: "07:40 am", img: imgRect3 },
  { name: "Big Kahuna Burger Ltd.", country: "Palestine, State of", time: "01:34 pm", img: imgRect4 },
  { name: "Abstergo Ltd.", country: "Monaco", time: "02:34 am", img: imgRect5 },
  { name: "Barone LLC.", country: "Kiribati", time: "05:49 pm", img: imgRect6 },
];

// ─── Icons (inline SVG) ────────────────────────────────────────────────────────

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6.667 2H2v6h4.667V2ZM14 2H9.333v3.333H14V2ZM14 8H9.333v6H14V8ZM6.667 10.667H2V14h4.667v-3.333Z" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconArchive() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.333 5.333H2.667A.667.667 0 0 0 2 6v7.333c0 .369.298.667.667.667h10.666A.667.667 0 0 0 14 13.333V6a.667.667 0 0 0-.667-.667ZM2 2.667h12v2.666H2V2.667ZM6.667 8h2.666" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6.667 4H14M6.667 8H14M6.667 12H14M2.667 4h.666v2.667M2.667 6.667H4M2.667 10.667h1.12a.547.547 0 0 0 .546-.547.547.547 0 0 0-.546-.547H2.667v-.573h1.666" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChat({ color = MUTED }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M14 7.333A6 6 0 0 1 8 13.333c-.72 0-1.413-.12-2.06-.34L2 14l1.007-3.94A6 6 0 1 1 14 7.333Z" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconFileText() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M9.333 2H4a.667.667 0 0 0-.667.667v10.666c0 .369.299.667.667.667h8a.667.667 0 0 0 .667-.667V5.333L9.333 2Z" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.333 2v3.333H12.667M10.667 8.667H5.333M10.667 11.333H5.333M6.667 6H5.333" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.933 8a4.933 4.933 0 0 0-.047-.667l1.44-1.12-1.333-2.307-1.747.707A4.96 4.96 0 0 0 10.1 4.06L9.667 2h-2.4l-.433 2.06a4.96 4.96 0 0 0-1.147.554L4.007 3.906 2.674 6.213 4.113 7.333A4.96 4.96 0 0 0 4.067 8a4.96 4.96 0 0 0 .047.667L2.674 9.787l1.333 2.307 1.747-.707c.353.22.733.4 1.147.554L7.334 14h2.4l.433-2.06a4.96 4.96 0 0 0 1.147-.553l1.747.707 1.333-2.307-1.44-1.12c.033-.22.047-.44.047-.667Z" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6.667 14H3.333A1.333 1.333 0 0 1 2 12.667V3.333A1.333 1.333 0 0 1 3.333 2h3.334M10.667 11.333 14 8l-3.333-3.333M14 8H6" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke={GRAY} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7.333" cy="7.333" r="5" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="m14 14-2.867-2.867" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconMoreVertical() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5" r="1" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="19" r="1" stroke={MUTED} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconPaperclip() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13.8 7.367 8.06 13.107a3.667 3.667 0 0 1-5.18-5.18l5.74-5.74a2.444 2.444 0 0 1 3.453 3.453L6.327 11.38a1.222 1.222 0 0 1-1.727-1.727L9.867 4.38" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconSmile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.667" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.333 9.333s1 1.334 2.667 1.334c1.667 0 2.667-1.334 2.667-1.334" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6h.004M10 6h.005" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M11.917 1.083 5.958 7.042M11.917 1.083 8.083 11.917l-2.125-4.875-4.875-2.125 10.834-3.834Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5v9M1.5 6h9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="#FF353F">
      <path d="M5 0.5L6.18 3.22L9.13 3.52L7 5.47L7.63 8.38L5 6.89L2.37 8.38L3 5.47L0.87 3.52L3.82 3.22L5 0.5Z" />
    </svg>
  );
}
function IconGear() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.933 8a4.933 4.933 0 0 0-.047-.667l1.44-1.12-1.333-2.307-1.747.707A4.96 4.96 0 0 0 10.1 4.06L9.667 2h-2.4l-.433 2.06a4.96 4.96 0 0 0-1.147.554L4.007 3.906 2.674 6.213 4.113 7.333A4.96 4.96 0 0 0 4.067 8a4.96 4.96 0 0 0 .047.667L2.674 9.787l1.333 2.307 1.747-.707c.353.22.733.4 1.147.554L7.334 14h2.4l.433-2.06a4.96 4.96 0 0 0 1.147-.553l1.747.707 1.333-2.307-1.44-1.12c.033-.22.047-.44.047-.667Z" stroke={MUTED} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const navItems = [
  { icon: <IconDashboard />, label: "Dashboard" },
  { icon: <IconArchive />, label: "Product" },
  { icon: <IconList />, label: "Order", badge: 5 },
  { icon: <IconChat color={BLUE} />, label: "Chat", active: true },
  { icon: <IconFileText />, label: "Document" },
  { icon: <IconSettings />, label: "Setting" },
];

function Sidebar() {
  return (
    <div className="flex flex-col justify-between h-full bg-white rounded-tl-[10px] rounded-bl-[10px] w-[200px] shrink-0 overflow-hidden">
      <div>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#D1E6FF]">
          <div className="flex items-center gap-3">
            <div className="w-[43px] h-[43px] rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(90deg, #1D75DD 0%, #085EC4 100%)" }}>
              <span className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Lo</span>
            </div>
            <span className="text-[#555758] font-bold text-[22px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Logo</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-[10px] px-5 py-[15px] relative text-left w-full transition-colors hover:bg-[#f0f7ff] ${item.active ? "text-[#1D75DD]" : "text-[#555758]"}`}
            >
              {item.active && (
                <div className="absolute left-0 top-0 bottom-0 w-[5px] rounded-r bg-[#1D75DD]" />
              )}
              {item.icon}
              <span className="text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: item.active ? BLUE : MUTED }}>
                {item.label}
              </span>
              {item.badge && (
                <span className="ml-auto flex items-center justify-center w-[16px] h-[16px] rounded-full bg-[#FF353F] text-white text-[8px] font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <button className="flex items-center gap-[10px] px-5 py-[15px] hover:bg-[#f0f7ff] transition-colors">
        <IconLogOut />
        <span className="text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: MUTED }}>Logout</span>
      </button>
    </div>
  );
}

// ─── Contacts List ────────────────────────────────────────────────────────────

function ContactItem({ contact, selected, onClick }: { contact: Contact; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-5 py-[15px] relative transition-colors border-b border-[#D1E6FF] last:border-b-0 ${selected ? "" : "bg-white hover:bg-[#f0f7ff]"}`}
      style={selected ? { background: "linear-gradient(90deg, #1D75DD 0%, #085EC3 100%)" } : {}}
    >
      {contact.unread && !selected && (
        <div className="absolute left-[6px] top-[32px] w-[4px] h-[4px] rounded-full bg-[#1D75DD]" />
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src={contact.avatar} alt={contact.name} className="w-[32px] h-[32px] rounded-full object-cover shrink-0" />
          <div>
            <div className="text-[14px] font-medium leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: selected ? "white" : MUTED }}>
              {contact.name}
            </div>
            <div className="text-[8px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: selected ? "rgba(255,255,255,0.75)" : MUTED }}>
              {contact.role}
            </div>
          </div>
        </div>
        <span className="text-[8px] shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: selected ? "rgba(255,255,255,0.75)" : MUTED }}>
          {contact.time}
        </span>
      </div>
      <p className="text-[10px] truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: selected ? "rgba(255,255,255,0.85)" : MUTED }}>
        {contact.lastMsg}
      </p>
    </button>
  );
}

function ContactsList({ contacts, selectedId, onSelect }: {
  contacts: Contact[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white rounded-[10px] w-[260px] shrink-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: GRAY }}>Inbox</span>
          <span className="bg-[#A5CEFF] text-[#1D75DD] text-[8px] px-3 py-[3px] rounded-full" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            2 New
          </span>
        </div>
        <IconGear />
      </div>

      {/* Search */}
      <div className="px-3 pb-3 shrink-0">
        <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-full px-4 py-[10px]">
          <IconSearch />
          <span className="text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: MUTED }}>Search...</span>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {contacts.map((c) => (
          <ContactItem key={c.id} contact={c} selected={selectedId === c.id} onClick={() => onSelect(c.id)} />
        ))}
      </div>
    </div>
  );
}

// ─── Chat Area ────────────────────────────────────────────────────────────────

function ChatBubble({ msg, contact }: { msg: Message; contact: Contact }) {
  const isMe = msg.from === "me";
  return (
    <div className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      <img
        src={isMe ? imgUserLarge : contact.avatar}
        alt=""
        className="w-[32px] h-[32px] rounded-full object-cover shrink-0"
      />
      <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
        <div
          className="rounded-[5px] px-[10px] py-[10px] text-[8px] leading-[14px]"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: GRAY,
            background: isMe ? PALE_BLUE : "white",
            border: isMe ? "none" : `1px solid ${BLUE}`,
            maxWidth: "380px",
          }}
        >
          {msg.text}
        </div>
        <span className="text-[8px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: MUTED }}>
          {msg.time}
        </span>
      </div>
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex-1 h-px bg-[#989BA1] opacity-20 rounded" />
      <span className="text-[8px] shrink-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: MUTED }}>{label}</span>
      <div className="flex-1 h-px bg-[#989BA1] opacity-20 rounded" />
    </div>
  );
}

function ChatArea({ contact, messages, onSend }: {
  contact: Contact;
  messages: Message[];
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full gap-5">
      {/* Chat header */}
      <div className="bg-white rounded-[10px] px-5 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[10px]">
          <img src={contact.avatar} alt={contact.name} className="w-[32px] h-[32px] rounded-full object-cover" />
          <div>
            <div className="text-[16px] font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: MUTED }}>{contact.name}</div>
            <div className="text-[12px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: MUTED }}>{contact.role}</div>
          </div>
        </div>
        <button className="hover:opacity-70 transition-opacity">
          <IconMoreVertical />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-[10px] overflow-y-auto p-5 flex flex-col gap-5 min-h-0">
        <DateDivider label="August 21" />
        {messages.slice(0, Math.ceil(messages.length / 2)).map((msg) => (
          <ChatBubble key={msg.id} msg={msg} contact={contact} />
        ))}
        {messages.length > 1 && <DateDivider label="August 22" />}
        {messages.slice(Math.ceil(messages.length / 2)).map((msg) => (
          <ChatBubble key={msg.id} msg={msg} contact={contact} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white rounded-[3px] border border-[#DDD] px-[10px] py-[10px] flex items-center justify-between shrink-0">
        <input
          className="flex-1 text-[13px] outline-none bg-transparent"
          placeholder="Write a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: GRAY }}
        />
        <div className="flex items-center gap-3 shrink-0">
          <button className="hover:opacity-70 transition-opacity"><IconPaperclip /></button>
          <button className="hover:opacity-70 transition-opacity"><IconSmile /></button>
          <button
            onClick={handleSend}
            className="w-5 h-5 rounded-[2px] flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ background: BLUE }}
          >
            <IconSend />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Right Panel ──────────────────────────────────────────────────────────────

function RightPanel({ contact }: { contact: Contact }) {
  return (
    <div className="bg-white rounded-[10px] w-[282px] shrink-0 overflow-y-auto p-5 flex flex-col gap-5">
      {/* Profile */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-[107px] h-[107px] rounded-full flex items-center justify-center" style={{ background: PALE_BLUE }}>
            <img src={imgProfileLarge} alt={contact.name} className="w-[97px] h-[97px] rounded-full object-cover" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: GRAY }}>{contact.name}</span>
          <span className="text-[8px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: MUTED }}>{contact.role}</span>
        </div>
        <div className="flex items-center gap-1">
          <IconStar />
          <span className="text-[6px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: GRAY }}>
            4.7 <span style={{ color: MUTED }}>(Rating)</span>
          </span>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between">
        <span className="text-[14px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: GRAY }}>Lorem ipsum</span>
        <span className="text-[10px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: MUTED }}>See all</span>
      </div>

      {/* Company list */}
      <div className="flex flex-col gap-[9px]">
        {companyContacts.map((c, i) => (
          <div key={i}>
            <div className="flex items-center gap-[10px]">
              <img src={c.img} alt={c.name} className="w-[43px] h-[43px] rounded-[5px] object-cover shrink-0" />
              <div className="flex-1 flex items-center justify-between min-w-0">
                <div>
                  <div className="text-[14px] font-bold leading-tight truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: GRAY }}>{c.name}</div>
                  <div className="text-[8px]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: MUTED }}>{c.country}</div>
                </div>
                <span className="text-[10px] shrink-0 ml-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: GRAY }}>{c.time}</span>
              </div>
            </div>
            {i < companyContacts.length - 1 && (
              <div className="mt-[9px] h-px" style={{ background: LIGHT_BLUE }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <div className="flex items-center justify-between px-0 shrink-0">
      <h1 className="text-[28px] font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: GRAY }}>
        Chat
      </h1>
      <div className="flex items-center gap-4">
        <button className="bg-[#1D75DD] text-white text-[14px] font-bold rounded-[5px] px-[18px] py-[7px] flex items-center gap-2 hover:opacity-90 transition-opacity">
          <IconPlus />
          Chat
        </button>
        <button className="hover:opacity-70 transition-opacity">
          <IconBell />
        </button>
        <div className="flex items-center gap-2">
          <img src={imgUserLarge} alt="Me" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-[14px] font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: GRAY }}>Leslie Alexander</span>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [selectedId, setSelectedId] = useState(3);

  const selected = contacts.find((c) => c.id === selectedId)!;

  const handleSend = (text: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? {
              ...c,
              messages: [...c.messages, { id: Date.now(), from: "me", text, time }],
              lastMsg: text,
              time: "now",
            }
          : c
      )
    );
  };

  return (
    <div className="w-full h-screen p-5" style={{ background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="flex flex-col h-full gap-5">
        <TopBar />
        <div className="flex flex-1 gap-5 min-h-0">
          <Sidebar />
          <ContactsList contacts={contacts} selectedId={selectedId} onSelect={setSelectedId} />
          <ChatArea contact={selected} messages={selected.messages} onSend={handleSend} />
          <RightPanel contact={selected} />
        </div>
      </div>
    </div>
  );
}
