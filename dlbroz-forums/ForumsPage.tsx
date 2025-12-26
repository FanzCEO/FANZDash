import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  Plus,
  Search,
  TrendingUp,
  Clock,
  Eye,
  Heart,
  Pin,
  Lock,
  Flame,
  MessageSquare,
  Users,
  Crown,
  Shield,
  Sparkles,
  Moon,
  MapPin,
  ShoppingBag,
  HelpCircle,
  Cpu,
  ChevronRight,
  EyeOff,
  Zap,
  Star,
  Award,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Category icons mapping
const categoryIcons: Record<string, any> = {
  MessageCircle, Users, Sparkles, Cpu, Moon, MapPin, Eye, Flame, ShoppingBag, HelpCircle
};

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  threadCount: number;
  postCount: number;
  isNsfw: boolean;
  lastPostAt: string;
  lastPostUser?: { username: string; avatarUrl?: string };
}

interface ForumThread {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  isAnonymous: boolean;
  anonymousAlias?: string;
  viewCount: number;
  replyCount: number;
  likeCount: number;
  isNsfw: boolean;
  tags: string[];
  createdAt: string;
  lastReplyAt?: string;
  author?: {
    id: string;
    username: string;
    avatarUrl?: string;
    reputation?: number;
    title?: string;
  };
}

export default function ForumsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewThreadDialog, setShowNewThreadDialog] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    categoryId: '',
    isAnonymous: false,
    isNsfw: false,
    tags: '',
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch categories
  const { data: categories = [] } = useQuery<ForumCategory[]>({
    queryKey: ['/api/forums/categories'],
  });

  // Fetch threads
  const { data: threads = [], isLoading } = useQuery<ForumThread[]>({
    queryKey: ['/api/forums/threads', selectedCategory, searchQuery],
  });

  // Create thread mutation
  const createThread = useMutation({
    mutationFn: async (data: typeof newThread) => {
      const res = await fetch('/api/forums/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forums/threads'] });
      setShowNewThreadDialog(false);
      setNewThread({ title: '', content: '', categoryId: '', isAnonymous: false, isNsfw: false, tags: '' });
      toast({ title: 'Thread created!', description: 'Your thread is now live.' });
    },
  });

  // Mock data for demo
  const mockCategories: ForumCategory[] = [
    { id: '1', name: 'General Discussion', slug: 'general', description: 'Talk about anything', icon: 'MessageCircle', color: '#00ff88', threadCount: 1247, postCount: 15683, isNsfw: false, lastPostAt: new Date().toISOString() },
    { id: '2', name: 'Creator Corner', slug: 'creator-corner', description: 'Tips and tricks for creators', icon: 'Sparkles', color: '#ff00ff', threadCount: 892, postCount: 8934, isNsfw: false, lastPostAt: new Date().toISOString() },
    { id: '3', name: 'After Dark', slug: 'after-dark', description: 'NSFW discussions', icon: 'Moon', color: '#ff0066', threadCount: 2341, postCount: 34521, isNsfw: true, lastPostAt: new Date().toISOString() },
    { id: '4', name: 'Hookups & Meetups', slug: 'hookups', description: 'Connect locally', icon: 'MapPin', color: '#ff3366', threadCount: 1893, postCount: 12456, isNsfw: true, lastPostAt: new Date().toISOString() },
    { id: '5', name: 'Confessions', slug: 'confessions', description: 'Share anonymously', icon: 'Eye', color: '#9900ff', threadCount: 3421, postCount: 28934, isNsfw: true, lastPostAt: new Date().toISOString() },
    { id: '6', name: 'Tech & Gear', slug: 'tech-gear', description: 'Equipment discussions', icon: 'Cpu', color: '#00d4ff', threadCount: 567, postCount: 4521, isNsfw: false, lastPostAt: new Date().toISOString() },
  ];

  const mockThreads: ForumThread[] = [
    { id: '1', categoryId: '1', title: '🔥 Welcome to the Underground - Read First!', slug: 'welcome', content: 'Welcome to DLBroz...', isPinned: true, isLocked: false, isAnonymous: false, viewCount: 15420, replyCount: 234, likeCount: 892, isNsfw: false, tags: ['welcome', 'rules'], createdAt: new Date().toISOString(), author: { id: '1', username: 'Admin', reputation: 9999, title: 'Founder' } },
    { id: '2', categoryId: '3', title: 'Anonymous confession: I matched with my coworker on here...', slug: 'confession-1', content: 'So this happened...', isPinned: false, isLocked: false, isAnonymous: true, anonymousAlias: 'ShadowPanda42', viewCount: 8934, replyCount: 156, likeCount: 423, isNsfw: true, tags: ['confession', 'story'], createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', categoryId: '2', title: 'Best camera settings for low light content?', slug: 'camera-settings', content: 'Looking for advice...', isPinned: false, isLocked: false, isAnonymous: false, viewCount: 2341, replyCount: 67, likeCount: 89, isNsfw: false, tags: ['camera', 'tips'], createdAt: new Date(Date.now() - 7200000).toISOString(), author: { id: '2', username: 'CreatorPro', reputation: 2450, title: 'Verified Creator' } },
    { id: '4', categoryId: '4', title: 'Anyone in LA this weekend? 👀', slug: 'la-meetup', content: 'Looking to connect...', isPinned: false, isLocked: false, isAnonymous: false, viewCount: 1567, replyCount: 45, likeCount: 67, isNsfw: true, tags: ['meetup', 'LA'], createdAt: new Date(Date.now() - 10800000).toISOString(), author: { id: '3', username: 'NightOwl', reputation: 890, title: 'Regular' } },
  ];

  const displayCategories = categories.length > 0 ? categories : mockCategories;
  const displayThreads = threads.length > 0 ? threads : mockThreads;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <MessageSquare className="w-10 h-10 text-purple-400" />
              THE UNDERGROUND
            </h1>
            <p className="text-gray-400 mt-1 text-lg">Where the real conversations happen</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/50 border-purple-500/30 focus:border-purple-500 w-64"
              />
            </div>
            <Dialog open={showNewThreadDialog} onOpenChange={setShowNewThreadDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/25">
                  <Plus className="w-4 h-4 mr-2" />
                  New Thread
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-purple-500/30 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Start a Discussion
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={newThread.categoryId} onValueChange={(v) => setNewThread({ ...newThread, categoryId: v })}>
                      <SelectTrigger className="bg-black/50 border-purple-500/30">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <span className="flex items-center gap-2">
                              {cat.isNsfw && <Badge className="bg-red-500/20 text-red-400 text-xs">18+</Badge>}
                              {cat.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="What's on your mind?"
                      value={newThread.title}
                      onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                      className="bg-black/50 border-purple-500/30"
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newThread.content}
                      onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                      className="bg-black/50 border-purple-500/30 min-h-32"
                    />
                  </div>
                  <div>
                    <Label>Tags (comma separated)</Label>
                    <Input
                      placeholder="tips, question, story"
                      value={newThread.tags}
                      onChange={(e) => setNewThread({ ...newThread, tags: e.target.value })}
                      className="bg-black/50 border-purple-500/30"
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newThread.isAnonymous}
                        onCheckedChange={(v) => setNewThread({ ...newThread, isAnonymous: v })}
                      />
                      <Label className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4" /> Post Anonymously
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newThread.isNsfw}
                        onCheckedChange={(v) => setNewThread({ ...newThread, isNsfw: v })}
                      />
                      <Label className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-400" /> NSFW Content
                      </Label>
                    </div>
                  </div>
                  <Button
                    onClick={() => createThread.mutate(newThread)}
                    disabled={!newThread.title || !newThread.content || !newThread.categoryId}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Post Thread
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Active Threads', value: '12.4K', icon: MessageSquare, color: 'from-purple-500 to-purple-600' },
            { label: 'Online Now', value: '1,847', icon: Users, color: 'from-green-500 to-green-600' },
            { label: 'Posts Today', value: '3,291', icon: TrendingUp, color: 'from-pink-500 to-pink-600' },
            { label: 'Your Reputation', value: '2,450', icon: Star, color: 'from-yellow-500 to-orange-500' },
          ].map((stat, i) => (
            <Card key={i} className="bg-black/40 border-purple-500/20 backdrop-blur-xl">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Categories Sidebar */}
          <div className="col-span-3 space-y-4">
            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-purple-400">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'ghost'}
                  className={`w-full justify-start ${selectedCategory === null ? 'bg-purple-600' : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  All Threads
                </Button>
                {displayCategories.map((cat) => {
                  const Icon = categoryIcons[cat.icon] || MessageCircle;
                  return (
                    <Button
                      key={cat.id}
                      variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                      className={`w-full justify-start ${selectedCategory === cat.id ? 'bg-purple-600' : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      <Icon className="w-4 h-4 mr-2" style={{ color: cat.color }} />
                      {cat.name}
                      {cat.isNsfw && <Badge className="ml-auto bg-red-500/20 text-red-400 text-xs">18+</Badge>}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="bg-black/40 border-purple-500/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-400 flex items-center gap-2">
                  <Crown className="w-5 h-5" /> Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'NightKing', points: 15420, avatar: '👑' },
                  { name: 'ShadowQueen', points: 12890, avatar: '🔥' },
                  { name: 'CyberWolf', points: 9840, avatar: '🐺' },
                  { name: 'NeonDreamer', points: 8920, avatar: '✨' },
                  { name: 'DarkPhoenix', points: 7650, avatar: '🦅' },
                ].map((user, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-500/10 transition-colors">
                    <span className="text-2xl">{user.avatar}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.points.toLocaleString()} pts</p>
                    </div>
                    <Badge className={`${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'}`}>
                      #{i + 1}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Threads List */}
          <div className="col-span-9 space-y-4">
            <Tabs defaultValue="hot" className="w-full">
              <TabsList className="bg-black/50 border border-purple-500/20">
                <TabsTrigger value="hot" className="data-[state=active]:bg-purple-600">
                  <Flame className="w-4 h-4 mr-2" /> Hot
                </TabsTrigger>
                <TabsTrigger value="new" className="data-[state=active]:bg-purple-600">
                  <Clock className="w-4 h-4 mr-2" /> New
                </TabsTrigger>
                <TabsTrigger value="top" className="data-[state=active]:bg-purple-600">
                  <TrendingUp className="w-4 h-4 mr-2" /> Top
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {displayThreads.map((thread) => (
              <Card
                key={thread.id}
                className={`bg-black/40 border-purple-500/20 backdrop-blur-xl hover:border-purple-500/50 transition-all cursor-pointer group ${thread.isPinned ? 'ring-1 ring-yellow-500/50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0">
                      {thread.isAnonymous ? (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                          <EyeOff className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <Avatar className="w-12 h-12 ring-2 ring-purple-500/50">
                          <AvatarImage src={thread.author?.avatarUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600">
                            {thread.author?.username?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.isPinned && (
                          <Badge className="bg-yellow-500/20 text-yellow-400">
                            <Pin className="w-3 h-3 mr-1" /> Pinned
                          </Badge>
                        )}
                        {thread.isLocked && (
                          <Badge className="bg-red-500/20 text-red-400">
                            <Lock className="w-3 h-3 mr-1" /> Locked
                          </Badge>
                        )}
                        {thread.isNsfw && (
                          <Badge className="bg-red-500/20 text-red-400">18+</Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                        {thread.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          {thread.isAnonymous ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              {thread.anonymousAlias || 'Anonymous'}
                            </>
                          ) : (
                            <>
                              <span className="text-purple-400">{thread.author?.username}</span>
                              {thread.author?.title && (
                                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                                  {thread.author.title}
                                </Badge>
                              )}
                            </>
                          )}
                        </span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(thread.createdAt))} ago</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {thread.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-purple-500/30 text-gray-400">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-2 text-sm text-gray-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" /> {thread.viewCount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" /> {thread.replyCount}
                        </span>
                        <span className="flex items-center gap-1 text-pink-400">
                          <Heart className="w-4 h-4" /> {thread.likeCount}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
