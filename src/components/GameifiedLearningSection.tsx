import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy,
  Zap,
  Target,
  Star,
  Award,
  Flame,
  Crown,
  Gift,
  Gamepad2,
  Medal,
  Sparkles,
  TrendingUp,
  Calendar,
  Users,
  Brain
} from "lucide-react";
import { toast } from "sonner";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  expiresAt: Date;
}

interface GameifiedLearningProps {
  onSectionChange: (section: string) => void;
}

export const GameifiedLearningSection = ({ onSectionChange }: GameifiedLearningProps) => {
  const [currentView, setCurrentView] = useState<"dashboard" | "achievements" | "challenges" | "leaderboard">("dashboard");
  const [userLevel, setUserLevel] = useState(12);
  const [userXP, setUserXP] = useState(2750);
  const [totalPoints, setTotalPoints] = useState(15420);
  const [streak, setStreak] = useState(8);
  const [rank, setRank] = useState(3);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "First Steps",
      description: "Complete your first study session",
      icon: "🎯",
      points: 100,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 86400000),
      rarity: "common"
    },
    {
      id: "2", 
      title: "Speed Demon",
      description: "Answer 10 questions in under 60 seconds",
      icon: "⚡",
      points: 250,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 3 * 86400000),
      rarity: "rare"
    },
    {
      id: "3",
      title: "Perfect Score",
      description: "Get 100% on any exam",
      icon: "🏆",
      points: 500,
      unlocked: true,
      unlockedAt: new Date(Date.now() - 1 * 86400000),
      rarity: "epic"
    },
    {
      id: "4",
      title: "Knowledge Master",
      description: "Complete 100 study sessions",
      icon: "👑",
      points: 1000,
      unlocked: false,
      rarity: "legendary"
    },
    {
      id: "5",
      title: "Streak Warrior",
      description: "Maintain a 30-day study streak",
      icon: "🔥",
      points: 750,
      unlocked: false,
      rarity: "epic"
    }
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: "1",
      title: "Daily Scholar",
      description: "Complete 3 study sessions today",
      type: "daily",
      target: 3,
      current: 1,
      reward: 150,
      completed: false,
      expiresAt: new Date(Date.now() + 86400000)
    },
    {
      id: "2",
      title: "Question Master",
      description: "Answer 50 questions this week",
      type: "weekly", 
      target: 50,
      current: 23,
      reward: 500,
      completed: false,
      expiresAt: new Date(Date.now() + 7 * 86400000)
    },
    {
      id: "3",
      title: "Perfect Week",
      description: "Get 90%+ accuracy on all exams this week",
      type: "weekly",
      target: 5,
      current: 2,
      reward: 750,
      completed: false,
      expiresAt: new Date(Date.now() + 7 * 86400000)
    }
  ]);

  const [leaderboard] = useState([
    { rank: 1, name: "Alex Chen", points: 18750, level: 15, streak: 12 },
    { rank: 2, name: "Sarah Johnson", points: 16890, level: 14, streak: 9 },
    { rank: 3, name: "You", points: totalPoints, level: userLevel, streak: streak },
    { rank: 4, name: "Mike Williams", points: 14200, level: 12, streak: 6 },
    { rank: 5, name: "Emma Davis", points: 13850, level: 11, streak: 15 }
  ]);

  const nextLevelXP = userLevel * 250;
  const currentLevelXP = userXP % 250;
  const xpProgress = (currentLevelXP / nextLevelXP) * 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-500 border-gray-500";
      case "rare": return "text-blue-500 border-blue-500";
      case "epic": return "text-purple-500 border-purple-500";
      case "legendary": return "text-yellow-500 border-yellow-500";
      default: return "text-gray-500 border-gray-500";
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-500/10";
      case "rare": return "bg-blue-500/10";
      case "epic": return "bg-purple-500/10";
      case "legendary": return "bg-yellow-500/10";
      default: return "bg-gray-500/10";
    }
  };

  const formatTimeRemaining = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const completeChallenge = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completed: true, current: challenge.target }
        : challenge
    ));
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      setTotalPoints(prev => prev + challenge.reward);
      setUserXP(prev => prev + challenge.reward);
      toast.success("🎉 Challenge Completed!", {
        description: `Earned ${challenge.reward} XP points!`
      });
    }
  };

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen bg-gradient-cosmic p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text animate-fade-in">
              Learning Arena
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-in" style={{animationDelay: '0.2s'}}>
              Level up your knowledge and compete with others!
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
            {[
              { key: "dashboard", label: "Dashboard", icon: Gamepad2 },
              { key: "achievements", label: "Achievements", icon: Trophy },
              { key: "challenges", label: "Challenges", icon: Target },
              { key: "leaderboard", label: "Leaderboard", icon: Crown }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={currentView === key ? "cosmic" : "outline"}
                onClick={() => setCurrentView(key as any)}
                className="px-6"
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>

          {/* Player Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="glass cosmic-glow animate-scale-in md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-cosmic-purple/20 rounded-full">
                    <Crown className="h-8 w-8 text-cosmic-purple" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-bold">Level {userLevel}</h3>
                      <Badge variant="outline" className="text-cosmic-purple border-cosmic-purple">
                        Rank #{rank}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{currentLevelXP} / {nextLevelXP} XP</span>
                        <span>{Math.round(xpProgress)}%</span>
                      </div>
                      <Progress value={xpProgress} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass cosmic-glow animate-scale-in" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-cosmic-orange mb-2">{totalPoints.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Points</div>
                <Star className="h-8 w-8 mx-auto mt-2 text-cosmic-orange" />
              </CardContent>
            </Card>

            <Card className="glass cosmic-glow animate-scale-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-cosmic-red mb-2">{streak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
                <Flame className="h-8 w-8 mx-auto mt-2 text-cosmic-red" />
              </CardContent>
            </Card>

            <Card className="glass cosmic-glow animate-scale-in" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-cosmic-green mb-2">
                  {achievements.filter(a => a.unlocked).length}
                </div>
                <div className="text-sm text-muted-foreground">Achievements</div>
                <Medal className="h-8 w-8 mx-auto mt-2 text-cosmic-green" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card className="glass animate-fade-in" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-cosmic-orange" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievements.filter(a => a.unlocked).slice(0, 3).map((achievement, index) => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 animate-fade-in ${getRarityBg(achievement.rarity)} ${getRarityColor(achievement.rarity)}`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-4xl">{achievement.icon}</div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm opacity-80">{achievement.description}</p>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                          {achievement.rarity}
                        </Badge>
                        <Badge variant="outline" className="text-cosmic-orange border-cosmic-orange">
                          +{achievement.points} XP
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card className="glass animate-fade-in" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-cosmic-blue" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.filter(c => !c.completed).map((challenge, index) => (
                  <div 
                    key={challenge.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-all duration-300 animate-fade-in"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {challenge.title}
                          <Badge variant="outline" className={
                            challenge.type === "daily" ? "text-green-500 border-green-500" :
                            challenge.type === "weekly" ? "text-blue-500 border-blue-500" :
                            "text-purple-500 border-purple-500"
                          }>
                            {challenge.type}
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-cosmic-orange">+{challenge.reward} XP</div>
                        <div className="text-xs text-muted-foreground">
                          {formatTimeRemaining(challenge.expiresAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {challenge.current} / {challenge.target}</span>
                        <span>{Math.round((challenge.current / challenge.target) * 100)}%</span>
                      </div>
                      <Progress value={(challenge.current / challenge.target) * 100} className="h-2" />
                    </div>

                    {challenge.current >= challenge.target && (
                      <Button 
                        onClick={() => completeChallenge(challenge.id)}
                        className="w-full mt-3"
                        variant="cosmic"
                      >
                        <Gift className="h-4 w-4 mr-2" />
                        Claim Reward
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mini Leaderboard */}
          <Card className="glass animate-fade-in" style={{animationDelay: '0.6s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-cosmic-yellow" />
                Top Learners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((player, index) => (
                  <div 
                    key={player.rank}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 animate-fade-in ${
                      player.name === "You" ? "bg-cosmic-purple/20 border border-cosmic-purple/50" : "hover:bg-accent/50"
                    }`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        player.rank === 1 ? "bg-yellow-500 text-white" :
                        player.rank === 2 ? "bg-gray-400 text-white" :
                        player.rank === 3 ? "bg-orange-500 text-white" :
                        "bg-gray-200 text-gray-700"
                      }`}>
                        {player.rank}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2">
                          {player.name}
                          {player.name === "You" && <Badge variant="outline" className="text-cosmic-purple border-cosmic-purple text-xs">You</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Level {player.level} • {player.streak} day streak
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-cosmic-orange">{player.points.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Other views...
  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-6xl mx-auto">
        <Button onClick={() => setCurrentView("dashboard")} className="mb-6">
          ← Back to Dashboard
        </Button>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">
            {currentView === "achievements" && "Achievements Gallery"}
            {currentView === "challenges" && "Challenge Center"}
            {currentView === "leaderboard" && "Global Leaderboard"}
          </h2>
          <p className="text-muted-foreground">
            This view is coming soon! Switch back to dashboard for now.
          </p>
        </div>
      </div>
    </div>
  );
};
