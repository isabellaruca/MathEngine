"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calculator, Target, TrendingUp, Award, Clock } from "lucide-react"
import { MathEngine } from "@/lib/math-engine"
import { TopicManager } from "@/lib/topic-manager"
import { ProgressTracker } from "@/lib/progress-tracker"
import { ExerciseInterface } from "@/components/exercise-interface"
import { ExamInterface } from "@/components/exam-interface"
import { ProgressDashboard } from "@/components/progress-dashboard"

export default function MathLearningTool() {
  const [currentView, setCurrentView] = useState<"home" | "topic" | "exercise" | "exam" | "progress">("home")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [mathEngine] = useState(() => new MathEngine())
  const [topicManager] = useState(() => new TopicManager())
  const [progressTracker] = useState(() => new ProgressTracker())
  const [topics, setTopics] = useState(topicManager.getAllTopics())

  useEffect(() => {
    // Initialize progress data
    const savedProgress = progressTracker.getOverallProgress()
    setTopics(topicManager.getAllTopics())
  }, [])

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId)
    setCurrentView("topic")
  }

  const handleStartExercise = () => {
    setCurrentView("exercise")
  }

  const handleStartExam = () => {
    setCurrentView("exam")
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    setSelectedTopic(null)
  }

  const handleBackToTopic = () => {
    setCurrentView("topic")
  }

  const renderHomeView = () => (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MathPro Engineering
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Domina las matemáticas desde aritmética básica hasta ecuaciones diferenciales. Una herramienta completa para
            estudiantes de ingeniería.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setCurrentView("home")} className="text-lg px-8">
              <BookOpen className="mr-2 h-5 w-5" />
              Comenzar Aprendizaje
            </Button>
            <Button size="lg" variant="outline" onClick={() => setCurrentView("progress")}>
              <TrendingUp className="mr-2 h-5 w-5" />
              Ver Progreso
            </Button>
          </div>
        </div>
      </section>

      {/* Topics Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Selecciona un Tema</h2>
            <p className="text-lg text-muted-foreground">Explora los diferentes módulos de aprendizaje</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => {
              const progress = progressTracker.getTopicProgress(topic.id)
              return (
                <Card
                  key={topic.id}
                  className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-primary/50"
                  onClick={() => handleTopicSelect(topic.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-4xl">{topic.icon}</div>
                      <Badge
                        variant={
                          progress.level === "beginner"
                            ? "destructive"
                            : progress.level === "intermediate"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {progress.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{topic.name}</CardTitle>
                    <CardDescription className="text-sm">{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span className="font-medium">{Math.round(progress.completionRate)}%</span>
                      </div>
                      <Progress value={progress.completionRate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progress.exercisesCompleted} ejercicios</span>
                        <span>{progress.averageScore}% promedio</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">Características Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <Calculator className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Ejercicios Infinitos</h3>
              <p className="text-muted-foreground">
                Generación automática de ejercicios con diferentes niveles de dificultad
              </p>
            </div>
            <div className="space-y-4">
              <Target className="h-12 w-12 text-accent mx-auto" />
              <h3 className="text-xl font-semibold">Evaluación Inteligente</h3>
              <p className="text-muted-foreground">Sistema de retroalimentación inmediata y análisis de errores</p>
            </div>
            <div className="space-y-4">
              <Award className="h-12 w-12 text-success mx-auto" />
              <h3 className="text-xl font-semibold">Progreso Personalizado</h3>
              <p className="text-muted-foreground">
                Seguimiento detallado de tu avance y recomendaciones personalizadas
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  const renderTopicView = () => {
    if (!selectedTopic) return null
    const topic = topicManager.getTopic(selectedTopic)
    if (!topic) return null

    const progress = progressTracker.getTopicProgress(selectedTopic)

    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={handleBackToHome}>
              ← Volver a Temas
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{topic.icon}</span>
              <h1 className="text-3xl font-bold">{topic.name}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Topic Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Descripción del Tema</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{topic.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Conceptos que aprenderás:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {topic.concepts.map((concept, index) => (
                        <li key={index}>{concept}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Study Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={handleStartExercise}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Modo Práctica
                    </CardTitle>
                    <CardDescription>
                      Practica ejercicios con retroalimentación inmediata y explicaciones detalladas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">Comenzar Práctica</Button>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={handleStartExam}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-accent" />
                      Modo Examen
                    </CardTitle>
                    <CardDescription>Evaluación cronometrada para medir tu progreso y conocimientos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full bg-transparent">
                      Iniciar Examen
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Progress Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tu Progreso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Completado</span>
                      <span className="font-medium">{Math.round(progress.completionRate)}%</span>
                    </div>
                    <Progress value={progress.completionRate} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">{progress.exercisesCompleted}</div>
                      <div className="text-xs text-muted-foreground">Ejercicios</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-accent">{progress.averageScore}%</div>
                      <div className="text-xs text-muted-foreground">Promedio</div>
                    </div>
                  </div>

                  <Badge
                    variant={progress.level === "advanced" ? "default" : "secondary"}
                    className="w-full justify-center"
                  >
                    Nivel: {progress.level}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tiempo total:</span>
                    <span className="text-sm font-medium">{Math.round(progress.timeSpent / 60)}min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mejor racha:</span>
                    <span className="text-sm font-medium">{progress.bestStreak}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Última práctica:</span>
                    <span className="text-sm font-medium">
                      {progress.lastActivity ? new Date(progress.lastActivity).toLocaleDateString() : "Nunca"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === "home" && renderHomeView()}
      {currentView === "topic" && renderTopicView()}
      {currentView === "exercise" && selectedTopic && (
        <ExerciseInterface
          topic={selectedTopic}
          mathEngine={mathEngine}
          progressTracker={progressTracker}
          onBack={handleBackToTopic}
        />
      )}
      {currentView === "exam" && selectedTopic && (
        <ExamInterface
          topic={selectedTopic}
          mathEngine={mathEngine}
          progressTracker={progressTracker}
          onBack={handleBackToTopic}
        />
      )}
      {currentView === "progress" && (
        <ProgressDashboard progressTracker={progressTracker} topicManager={topicManager} onBack={handleBackToHome} />
      )}
    </div>
  )
}
