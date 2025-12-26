import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Search,
  Shield,
  Users,
  FileCheck,
  AlertTriangle,
  Eye,
  Lock,
  Globe,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  FileText,
  CheckCircle2,
  Scale,
  UserCheck,
} from "lucide-react";

interface KBArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  icon: string;
  lastUpdated: string;
}

interface KBCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  articleCount: number;
  articles: KBArticle[];
}

// Knowledge Base categories matching the markdown files
const kbCategories: KBCategory[] = [
  {
    id: "compliance",
    name: "Compliance & Legal",
    description: "2257 compliance, GDPR, DSA regulations and legal requirements",
    icon: Shield,
    articleCount: 5,
    articles: [
      { id: "1", title: "2257 Compliance Guide", slug: "2257-compliance", category: "compliance", excerpt: "Complete guide to 18 U.S.C. § 2257 compliance requirements", content: "", icon: "Shield", lastUpdated: "2025-12-23" },
      { id: "2", title: "Compliance Overview", slug: "compliance-overview", category: "compliance", excerpt: "Understanding platform compliance requirements", content: "", icon: "CheckCircle2", lastUpdated: "2025-12-23" },
      { id: "3", title: "GDPR User Rights", slug: "gdpr-user-rights", category: "compliance", excerpt: "GDPR data protection and user rights", content: "", icon: "Lock", lastUpdated: "2025-12-23" },
      { id: "4", title: "DSA Complaints", slug: "dsa-complaints", category: "compliance", excerpt: "Digital Services Act complaint handling", content: "", icon: "Scale", lastUpdated: "2025-12-23" },
      { id: "5", title: "Troubleshooting Compliance", slug: "troubleshooting-compliance", category: "compliance", excerpt: "Common compliance issues and solutions", content: "", icon: "HelpCircle", lastUpdated: "2025-12-23" },
    ],
  },
  {
    id: "verification",
    name: "Age & Identity Verification",
    description: "Age verification, creator verification, and identity checks",
    icon: UserCheck,
    articleCount: 2,
    articles: [
      { id: "6", title: "Age Verification Guide", slug: "age-verification-guide", category: "verification", excerpt: "Complete guide to age verification systems", content: "", icon: "UserCheck", lastUpdated: "2025-12-23" },
      { id: "7", title: "Creator Guidelines", slug: "creator-guidelines", category: "verification", excerpt: "Guidelines for content creators", content: "", icon: "Users", lastUpdated: "2025-12-23" },
    ],
  },
  {
    id: "moderation",
    name: "Content Moderation",
    description: "Moderation tools, CSAM detection, and content policies",
    icon: Eye,
    articleCount: 3,
    articles: [
      { id: "8", title: "Moderator Handbook", slug: "moderator-handbook", category: "moderation", excerpt: "Complete handbook for platform moderators", content: "", icon: "Eye", lastUpdated: "2025-12-23" },
      { id: "9", title: "CSAM Detection Guide", slug: "csam-detection-guide", category: "moderation", excerpt: "CSAM detection and reporting procedures", content: "", icon: "AlertTriangle", lastUpdated: "2025-12-23" },
      { id: "10", title: "Prohibited Content", slug: "prohibited-content", category: "moderation", excerpt: "List of prohibited content types", content: "", icon: "Shield", lastUpdated: "2025-12-23" },
    ],
  },
  {
    id: "platform",
    name: "Platform & API",
    description: "Platform settings, API keys, and upload compliance",
    icon: Globe,
    articleCount: 2,
    articles: [
      { id: "11", title: "API Keys Setup", slug: "api-keys-setup", category: "platform", excerpt: "Setting up and managing API keys", content: "", icon: "Lock", lastUpdated: "2025-12-23" },
      { id: "12", title: "Platform Upload Compliance", slug: "platform-upload-compliance", category: "platform", excerpt: "Content upload requirements and compliance", content: "", icon: "FileCheck", lastUpdated: "2025-12-23" },
    ],
  },
];

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch article content when selected
  const { data: articleContent, isLoading: articleLoading } = useQuery({
    queryKey: ["/api/kb/article", selectedArticle?.slug],
    enabled: !!selectedArticle,
  });

  // Filter articles based on search
  const filteredCategories = kbCategories.map(cat => ({
    ...cat,
    articles: cat.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => selectedCategory === "all" || cat.id === selectedCategory);

  const totalArticles = kbCategories.reduce((acc, cat) => acc + cat.articles.length, 0);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-900 to-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold cyber-text-glow flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-cyan-400" />
            Knowledge Base
          </h1>
          <p className="text-gray-400 mt-1">
            Compliance guides, documentation, and platform help - {totalArticles} articles
          </p>
        </div>
        <Badge variant="outline" className="text-cyan-400 border-cyan-400">
          Integrated KB
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card className="bg-black/40 border-primary/20">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black/60 border-primary/30 focus:border-cyan-400"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="bg-black/60">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
                <TabsTrigger value="moderation">Moderation</TabsTrigger>
                <TabsTrigger value="platform">Platform</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories and Articles List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <Card key={category.id} className="bg-black/40 border-primary/20 hover:border-cyan-400/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{category.name}</CardTitle>
                      <CardDescription className="text-xs">{category.articleCount} articles</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {category.articles.map((article) => (
                      <Button
                        key={article.id}
                        variant="ghost"
                        className={`w-full justify-start text-left h-auto py-2 px-3 ${
                          selectedArticle?.id === article.id
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                            : "text-gray-300 hover:text-white hover:bg-primary/10"
                        }`}
                        onClick={() => setSelectedArticle(article)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate text-sm">{article.title}</span>
                          <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Article Content */}
        <div className="lg:col-span-2">
          <Card className="bg-black/40 border-primary/20 min-h-[600px]">
            {selectedArticle ? (
              <>
                <CardHeader className="border-b border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-cyan-400" />
                        {selectedArticle.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Last updated: {selectedArticle.lastUpdated}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-amber-400 border-amber-400">
                      {selectedArticle.category.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-[500px] pr-4">
                    {articleLoading ? (
                      <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-cyan max-w-none">
                        <p className="text-gray-300 text-lg mb-4">{selectedArticle.excerpt}</p>
                        {articleContent ? (
                          <div dangerouslySetInnerHTML={{ __html: articleContent }} />
                        ) : (
                          <div className="space-y-4 text-gray-400">
                            <p>Loading article content from the knowledge base...</p>
                            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                              <p className="text-cyan-400 text-sm">
                                This article is loaded from the integrated Fanz Knowledge Base.
                                All content stays within the dashboard for seamless navigation.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center h-[600px] text-center">
                <BookOpen className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  Select an Article
                </h3>
                <p className="text-gray-500 max-w-md">
                  Choose an article from the categories on the left to view its content.
                  All knowledge base content is displayed within the dashboard.
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-primary/20 hover:border-cyan-400/50 transition-colors cursor-pointer"
              onClick={() => setSelectedArticle(kbCategories[0].articles[0])}>
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <p className="font-medium text-white">2257 Compliance</p>
              <p className="text-xs text-gray-400">Required reading</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-primary/20 hover:border-cyan-400/50 transition-colors cursor-pointer"
              onClick={() => setSelectedArticle(kbCategories[2].articles[1])}>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <div>
              <p className="font-medium text-white">CSAM Detection</p>
              <p className="text-xs text-gray-400">Critical procedures</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-primary/20 hover:border-cyan-400/50 transition-colors cursor-pointer"
              onClick={() => setSelectedArticle(kbCategories[2].articles[0])}>
          <CardContent className="p-4 flex items-center gap-3">
            <Eye className="w-8 h-8 text-cyan-400" />
            <div>
              <p className="font-medium text-white">Moderator Guide</p>
              <p className="text-xs text-gray-400">For moderators</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-primary/20 hover:border-cyan-400/50 transition-colors cursor-pointer"
              onClick={() => setSelectedArticle(kbCategories[1].articles[1])}>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-purple-400" />
            <div>
              <p className="font-medium text-white">Creator Guidelines</p>
              <p className="text-xs text-gray-400">For creators</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
