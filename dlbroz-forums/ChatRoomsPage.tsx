import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Plus,
  Search,
  Users,
  Crown,
  Shield,
  Sparkles,
  Moon,
  MapPin,
  Heart,
  Home,
  Cpu,
  Eye,
  EyeOff,
  Flame,
  Gift,
  Image,
  Smile,
  MoreVertical,
  Pin,
  Reply,
  Trash2,
  Volume2,
  VolumeX,
  Settings,
  Lock,
  Zap,
  Radio,
  Mic,
  Video,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatRoom {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  roomType: 'public' | 'private' | 'vip' | 'creator';
  themeColor: string;
  memberCount: number;
  onlineCount: number;
  isNsfw: boolean;
  lastMessageAt: string;
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  messageType: 'text' | 'image' | 'gif' | 'tip' | 'system';
  content: string;
  mediaUrl?: string;
  isAnonymous: boolean;
  anonymousAlias?: string;
  tipAmountCents?: number;
  isPinned: boolean;
  createdAt: string;
  sender?: {
    username: string;
    avatarUrl?: string;
    title?: string;
    isOnline?: boolean;
  };
  reactions?: Record<string, string[]>;
  replyTo?: ChatMessage;
}

// Room icons mapping
const roomIcons: Record<string, any> = {
  Home, Moon, Crown, Heart, Eye, Cpu, MapPin, Sparkles, Shield, MessageSquare
};

export default function ChatRoomsPage() {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [tipAmount, setTipAmount] = useState('5');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock rooms data
  const mockRooms: ChatRoom[] = [
    { id: '1', name: 'The Lobby', slug: 'lobby', description: 'Main hangout for everyone', icon: 'Home', roomType: 'public', themeColor: '#00ff88', memberCount: 15420, onlineCount: 847, isNsfw: false, lastMessageAt: new Date().toISOString() },
    { id: '2', name: 'Late Night Vibes', slug: 'late-night', description: 'Chill chat after hours', icon: 'Moon', roomType: 'public', themeColor: '#9900ff', memberCount: 8934, onlineCount: 423, isNsfw: true, lastMessageAt: new Date().toISOString() },
    { id: '3', name: 'Creator Lounge', slug: 'creator-lounge', description: 'Exclusive for verified creators', icon: 'Crown', roomType: 'vip', themeColor: '#ffaa00', memberCount: 2341, onlineCount: 156, isNsfw: false, lastMessageAt: new Date().toISOString() },
    { id: '4', name: 'Hookup Central', slug: 'hookup-central', description: 'Find your next adventure', icon: 'Heart', roomType: 'public', themeColor: '#ff0066', memberCount: 12456, onlineCount: 634, isNsfw: true, lastMessageAt: new Date().toISOString() },
    { id: '5', name: 'Confessional', slug: 'confessional', description: 'Share anonymously', icon: 'Eye', roomType: 'public', themeColor: '#ff00ff', memberCount: 6789, onlineCount: 289, isNsfw: true, lastMessageAt: new Date().toISOString() },
    { id: '6', name: 'Tech Talk', slug: 'tech-talk', description: 'Geek out on gear', icon: 'Cpu', roomType: 'public', themeColor: '#00d4ff', memberCount: 3421, onlineCount: 134, isNsfw: false, lastMessageAt: new Date().toISOString() },
  ];

  // Mock messages data
  const mockMessages: ChatMessage[] = [
    { id: '1', roomId: '1', senderId: '1', messageType: 'system', content: 'Welcome to The Lobby! Be respectful and have fun. 🎉', isAnonymous: false, isPinned: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '2', roomId: '1', senderId: '2', messageType: 'text', content: 'Hey everyone! New here, what\'s good?', isAnonymous: false, isPinned: false, createdAt: new Date(Date.now() - 1800000).toISOString(), sender: { username: 'NightOwl', isOnline: true, title: 'Regular' } },
    { id: '3', roomId: '1', senderId: '3', messageType: 'text', content: 'Welcome! You\'re gonna love it here 🔥', isAnonymous: false, isPinned: false, createdAt: new Date(Date.now() - 1500000).toISOString(), sender: { username: 'CyberQueen', isOnline: true, title: 'Verified Creator' }, reactions: { '🔥': ['1', '2'], '❤️': ['4'] } },
    { id: '4', roomId: '1', senderId: '4', messageType: 'tip', content: 'Sent a tip!', tipAmountCents: 500, isAnonymous: false, isPinned: false, createdAt: new Date(Date.now() - 1200000).toISOString(), sender: { username: 'GenerousKing', isOnline: true } },
    { id: '5', roomId: '1', senderId: '5', messageType: 'text', content: 'This place is unmatched fr fr 💯', isAnonymous: true, anonymousAlias: 'ShadowFox23', isPinned: false, createdAt: new Date(Date.now() - 900000).toISOString() },
    { id: '6', roomId: '1', senderId: '6', messageType: 'image', content: '', mediaUrl: 'https://picsum.photos/400/300', isAnonymous: false, isPinned: false, createdAt: new Date(Date.now() - 600000).toISOString(), sender: { username: 'PhotoPro', isOnline: false, title: 'Creator' } },
    { id: '7', roomId: '1', senderId: '7', messageType: 'text', content: 'Anyone else vibing rn? 🌙', isAnonymous: false, isPinned: false, createdAt: new Date(Date.now() - 300000).toISOString(), sender: { username: 'MidnightDreamer', isOnline: true } },
  ];

  const currentRoom = mockRooms.find(r => r.id === selectedRoom);
  const roomMessages = mockMessages.filter(m => m.roomId === selectedRoom);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages]);

  const sendMessage = () => {
    if (!message.trim() || !selectedRoom) return;
    // In production, this would be a WebSocket emit
    toast({ title: 'Message sent!' });
    setMessage('');
    setReplyingTo(null);
  };

  const sendTip = () => {
    toast({ title: `Tip of $${tipAmount} sent!`, description: 'Thanks for supporting!' });
    setShowTipDialog(false);
    setTipAmount('5');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 flex">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Rooms Sidebar */}
      <div className="w-80 border-r border-purple-500/20 bg-black/40 backdrop-blur-xl relative z-10">
        <div className="p-4 border-b border-purple-500/20">
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <Radio className="w-6 h-6 text-purple-400" />
            CHAT ROOMS
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real-time underground hangouts</p>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search rooms..."
              className="pl-10 bg-black/50 border-purple-500/30"
            />
          </div>

          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="px-4 space-y-2">
            {mockRooms.map((room) => {
              const Icon = roomIcons[room.icon] || MessageSquare;
              const isSelected = selectedRoom === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/50'
                      : 'hover:bg-purple-500/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${room.themeColor}40, ${room.themeColor}20)` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: room.themeColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">{room.name}</span>
                        {room.isNsfw && <Badge className="bg-red-500/20 text-red-400 text-xs">18+</Badge>}
                        {room.roomType === 'vip' && <Crown className="w-4 h-4 text-yellow-400" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          {room.onlineCount.toLocaleString()} online
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {selectedRoom && currentRoom ? (
          <>
            {/* Room Header */}
            <div className="p-4 border-b border-purple-500/20 bg-black/40 backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${currentRoom.themeColor}40, ${currentRoom.themeColor}20)` }}
                >
                  {(() => {
                    const Icon = roomIcons[currentRoom.icon] || MessageSquare;
                    return <Icon className="w-6 h-6" style={{ color: currentRoom.themeColor }} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {currentRoom.name}
                    {currentRoom.isNsfw && <Badge className="bg-red-500/20 text-red-400">18+</Badge>}
                  </h2>
                  <p className="text-sm text-gray-400">{currentRoom.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Users className="w-4 h-4" />
                  <span className="text-green-400">{currentRoom.onlineCount}</span>
                  <span>/</span>
                  <span>{currentRoom.memberCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="hover:bg-purple-500/20">
                    <PhoneCall className="w-5 h-5 text-green-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-purple-500/20">
                    <Video className="w-5 h-5 text-blue-400" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-purple-500/20">
                    <Settings className="w-5 h-5 text-gray-400" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {roomMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.messageType === 'system' ? 'justify-center' : ''}`}>
                    {msg.messageType === 'system' ? (
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-sm text-purple-300">
                        {msg.content}
                      </div>
                    ) : (
                      <>
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {msg.isAnonymous ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                              <EyeOff className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <Avatar className="w-10 h-10 ring-2 ring-purple-500/50">
                              <AvatarImage src={msg.sender?.avatarUrl} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600">
                                {msg.sender?.username?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium ${msg.isAnonymous ? 'text-purple-400' : 'text-white'}`}>
                              {msg.isAnonymous ? msg.anonymousAlias : msg.sender?.username}
                            </span>
                            {msg.sender?.title && (
                              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                {msg.sender.title}
                              </Badge>
                            )}
                            {msg.isPinned && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                                <Pin className="w-3 h-3 mr-1" /> Pinned
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(msg.createdAt))} ago
                            </span>
                          </div>

                          {msg.messageType === 'tip' ? (
                            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-3 inline-block">
                              <div className="flex items-center gap-2 text-green-400">
                                <Gift className="w-5 h-5" />
                                <span className="font-bold">${(msg.tipAmountCents || 0) / 100}</span>
                                <span className="text-green-300">tip sent!</span>
                              </div>
                            </div>
                          ) : msg.messageType === 'image' ? (
                            <img
                              src={msg.mediaUrl}
                              alt=""
                              className="rounded-xl max-w-md mt-1 border border-purple-500/20"
                            />
                          ) : (
                            <p className="text-gray-200">{msg.content}</p>
                          )}

                          {/* Reactions */}
                          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {Object.entries(msg.reactions).map(([emoji, users]) => (
                                <button
                                  key={emoji}
                                  className="flex items-center gap-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-full px-2 py-0.5 text-sm transition-colors"
                                >
                                  <span>{emoji}</span>
                                  <span className="text-gray-400">{users.length}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message Actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-purple-500/20">
                            <Smile className="w-4 h-4 text-gray-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-purple-500/20">
                            <Reply className="w-4 h-4 text-gray-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-purple-500/20">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Preview */}
            {replyingTo && (
              <div className="px-4 py-2 bg-purple-500/10 border-t border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Reply className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400">Replying to</span>
                  <span className="text-purple-400">{replyingTo.sender?.username || replyingTo.anonymousAlias}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-purple-500/20 bg-black/40 backdrop-blur-xl">
              <div className="max-w-4xl mx-auto flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`hover:bg-purple-500/20 ${isAnonymous ? 'text-purple-400 bg-purple-500/20' : 'text-gray-400'}`}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                >
                  {isAnonymous ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-purple-500/20 text-gray-400">
                  <Image className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-purple-500/20 text-gray-400">
                  <Smile className="w-5 h-5" />
                </Button>
                <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-green-500/20 text-green-400">
                      <Gift className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-purple-500/30">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-white">Send a Tip</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-4 gap-2">
                        {['5', '10', '25', '50'].map((amount) => (
                          <Button
                            key={amount}
                            variant={tipAmount === amount ? 'default' : 'outline'}
                            onClick={() => setTipAmount(amount)}
                            className={tipAmount === amount ? 'bg-green-600' : ''}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                      <Input
                        type="number"
                        value={tipAmount}
                        onChange={(e) => setTipAmount(e.target.value)}
                        placeholder="Custom amount"
                        className="bg-black/50 border-purple-500/30"
                      />
                      <Button onClick={sendTip} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                        <Gift className="w-4 h-4 mr-2" />
                        Send ${tipAmount} Tip
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="flex-1 relative">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isAnonymous ? 'Type anonymously...' : 'Type a message...'}
                    className="bg-black/50 border-purple-500/30 pr-12"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              {isAnonymous && (
                <p className="text-xs text-purple-400 text-center mt-2">
                  <EyeOff className="w-3 h-3 inline mr-1" />
                  You're posting anonymously. Your identity is hidden.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-6">
                <MessageSquare className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Select a Room</h2>
              <p className="text-gray-400 max-w-md">
                Choose a chat room from the sidebar to start vibing with the community.
                Real-time, anonymous options available.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Online Users Sidebar */}
      {selectedRoom && (
        <div className="w-64 border-l border-purple-500/20 bg-black/40 backdrop-blur-xl relative z-10">
          <div className="p-4 border-b border-purple-500/20">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              Online Now
              <Badge className="bg-green-500/20 text-green-400">{currentRoom?.onlineCount}</Badge>
            </h3>
          </div>
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4 space-y-2">
              {[
                { name: 'CyberQueen', title: 'Creator', status: 'online' },
                { name: 'NightOwl', status: 'online' },
                { name: 'MidnightDreamer', status: 'online' },
                { name: 'GenerousKing', title: 'VIP', status: 'away' },
                { name: 'PhotoPro', title: 'Creator', status: 'online' },
                { name: 'ShadowHunter', status: 'online' },
                { name: 'NeonGhost', status: 'away' },
              ].map((user, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-500/10 cursor-pointer transition-colors">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    {user.title && (
                      <p className="text-xs text-purple-400">{user.title}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
