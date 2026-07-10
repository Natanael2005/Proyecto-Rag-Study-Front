"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  Check,
  Copy,
  Edit3,
  Eye,
  FileText,
  Layers3,
  Loader2,
  Mail,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  School,
  Sparkles,
  Trash2,
  UserCheck,
  UserX,
  UsersRound,
} from "lucide-react"
import {
  deleteOrganization,
  getMyOrganizations,
  getOrganizationInvites,
  getOrganizationMembers,
  getOrganizationQr,
  getOrganizationWaitlist,
  inviteOrganizationMember,
  updateOrganization,
  updateOrganizationMemberStatus,
  type Organization,
  type OrganizationInvite,
  type OrganizationMember,
} from "@/lib/organizations-api"
import {
  createCards,
  createDeck,
  createDeckFromDocument,
  deleteCard,
  deleteDeck,
  getCardViews,
  getDecks,
  getDeck,
  getUnseenCards,
  markCardAsViewed,
  suggestCardEdit,
  updateCard,
  type CardView,
  type Deck,
  type DeckCard,
  type LlmEditProposal,
} from "@/lib/decks-api"
import {
  createQuiz,
  finishQuizAttempt,
  getQuiz,
  getQuizzes,
  saveQuizAnswer,
  startQuizAttempt,
  type Quiz,
  type QuizAttempt,
  type QuizAttemptResult,
  type QuizQuestion,
} from "@/lib/quizzes-api"
import { getDocuments } from "@/lib/documents-api"
import { getCurrentUser, type AuthUser } from "@/lib/auth-api"

type OrganizationDetailProps = {
  organizationId: string
}

type ApiRecord = Record<string, unknown>

type DetailTab = "decks" | "quizzes" | "members" | "invites" | "settings"

type LibraryDocument = {
  id: string
  name: string
  status?: string
}

type QuizQuestionForm = {
  id: string
  question: string
  options: string[]
  correct_answer: string
  explanation: string
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : undefined
}

function getBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined
}

function pickArray(data: unknown, keys: string[]) {
  if (Array.isArray(data)) {
    return data
  }

  if (!isRecord(data)) {
    return []
  }

  return keys.map((key) => data[key]).find(Array.isArray) ?? []
}

function normalizeOrganization(item: unknown, index: number): Organization {
  if (!isRecord(item)) {
    return {
      id: String(index),
      name: `Salon ${index + 1}`,
    }
  }

  return {
    id: getString(item.id) || getString(item.organization_id) || String(index),
    name: getString(item.name) || `Salon ${index + 1}`,
    description: getString(item.description),
    subject: getString(item.subject),
    career_id: getNumber(item.career_id),
    created_by: getString(item.created_by),
    join_code: getString(item.join_code),
    created_at: getString(item.created_at),
  }
}

function normalizeOrganizations(data: unknown) {
  return pickArray(data, [
    "organizations",
    "organizaciones",
    "salones",
    "data",
    "items",
    "results",
  ]).map(normalizeOrganization)
}

function normalizeMember(item: unknown, index: number): OrganizationMember {
  if (!isRecord(item)) {
    return {
      organization_id: "",
      user_id: String(index),
    }
  }

  return {
    organization_id: getString(item.organization_id),
    user_id: getString(item.user_id) || getString(item.id) || String(index),
    role: getString(item.role),
    status: getString(item.status),
    joined_at: getString(item.joined_at),
    first_name: getString(item.first_name),
    last_name: getString(item.last_name),
    email: getString(item.email),
  }
}

function normalizeMembers(data: unknown) {
  return pickArray(data, ["members", "miembros", "data", "items", "results"]).map(
    normalizeMember
  )
}

function normalizeInvite(item: unknown, index: number): OrganizationInvite {
  if (!isRecord(item)) {
    return {
      id: String(index),
      organization_id: "",
      email: "",
    }
  }

  return {
    id: getString(item.id) || String(index),
    organization_id: getString(item.organization_id),
    email: getString(item.email),
    invited_by: getString(item.invited_by),
    status: getString(item.status),
    created_at: getString(item.created_at),
  }
}

function normalizeInvites(data: unknown) {
  return pickArray(data, ["invites", "invitations", "data", "items", "results"]).map(
    normalizeInvite
  )
}

function normalizeDeck(item: unknown, index: number): Deck {
  if (!isRecord(item)) {
    return {
      id: String(index),
      organization_id: "",
      title: `Deck ${index + 1}`,
    }
  }

  const cards = pickArray(item.cards, []).map((card, cardIndex) => {
    if (!isRecord(card)) {
      return {
        id: String(cardIndex),
        deck_id: getString(item.id),
        front_text: "",
        back_text: "",
      }
    }

    return {
      id: getString(card.id) || String(cardIndex),
      deck_id: getString(card.deck_id) || getString(item.id),
      front_text: getString(card.front_text),
      back_text: getString(card.back_text),
      is_seen: typeof card.is_seen === "boolean" ? card.is_seen : undefined,
      created_at: getString(card.created_at),
    }
  })

  return {
    id: getString(item.id) || String(index),
    user_id: getString(item.user_id),
    organization_id: getString(item.organization_id),
    document_id: getString(item.document_id) || null,
    title: getString(item.title) || `Deck ${index + 1}`,
    created_at: getString(item.created_at),
    card_count: getNumber(item.card_count),
    cards,
  }
}

function normalizeDecks(data: unknown) {
  return pickArray(data, ["decks", "mazos", "data", "items", "results"]).map(
    normalizeDeck
  )
}

function normalizeDeckCard(item: unknown, index: number): DeckCard {
  if (!isRecord(item)) {
    return {
      id: String(index),
      deck_id: "",
      front_text: "",
      back_text: "",
    }
  }

  return {
    id: getString(item.id) || String(index),
    deck_id: getString(item.deck_id),
    front_text: getString(item.front_text),
    back_text: getString(item.back_text),
    is_seen: typeof item.is_seen === "boolean" ? item.is_seen : undefined,
    created_at: getString(item.created_at),
  }
}

function normalizeDeckCards(data: unknown) {
  return pickArray(data, ["cards", "flashcards", "data", "items", "results"]).map(
    normalizeDeckCard
  )
}

function normalizeCardView(item: unknown, index: number): CardView {
  if (!isRecord(item)) {
    return {
      user_id: String(index),
      flashcard_id: "",
      viewed_at: "",
    }
  }

  return {
    user_id: getString(item.user_id) || String(index),
    flashcard_id: getString(item.flashcard_id),
    viewed_at: getString(item.viewed_at),
  }
}

function normalizeCardViews(data: unknown) {
  return pickArray(data, ["views", "vistas", "data", "items", "results"]).map(
    normalizeCardView
  )
}

function normalizeOrganizationDecks(data: unknown, organizationId: string) {
  return normalizeDecks(data).filter(
    (deck) => !deck.organization_id || deck.organization_id === organizationId
  )
}

function normalizeDocument(document: unknown, index: number): LibraryDocument {
  if (!isRecord(document)) {
    return {
      id: String(index),
      name: `Documento ${index + 1}`,
    }
  }

  return {
    id:
      getString(document.id) ||
      getString(document.document_id) ||
      getString(document.uuid) ||
      String(index),
    name:
      getString(document.title) ||
      getString(document.name) ||
      getString(document.filename) ||
      getString(document.file_name) ||
      `Documento ${index + 1}`,
    status: getString(document.status),
  }
}

function normalizeDocuments(data: unknown) {
  return pickArray(data, [
    "documents",
    "documentos",
    "data",
    "items",
    "results",
  ]).map(normalizeDocument)
}

function normalizeQuizQuestion(item: unknown, index: number): QuizQuestion {
  if (!isRecord(item)) {
    return {
      id: String(index),
      question: `Pregunta ${index + 1}`,
      options: [],
    }
  }

  return {
    id: getString(item.id) || getString(item.question_id) || String(index),
    quiz_id: getString(item.quiz_id),
    question: getString(item.question),
    options: pickArray(item.options, []).map((option) => getString(option)),
    correct_answer: getString(item.correct_answer),
    explanation: getString(item.explanation),
  }
}

function normalizeQuiz(item: unknown, index: number): Quiz {
  if (!isRecord(item)) {
    return {
      id: String(index),
      title: `Quiz ${index + 1}`,
      questions: [],
    }
  }

  const questions = pickArray(item.questions, [
    "questions",
    "preguntas",
    "data",
    "items",
    "results",
  ]).map(normalizeQuizQuestion)

  return {
    id: getString(item.id) || String(index),
    user_id: getString(item.user_id),
    document_id: getString(item.document_id) || null,
    title: getString(item.title) || `Quiz ${index + 1}`,
    created_at: getString(item.created_at),
    question_count: getNumber(item.question_count) ?? questions.length,
    answers_revealed: getBoolean(item.answers_revealed),
    questions,
  }
}

function normalizeQuizzes(data: unknown) {
  return pickArray(data, ["quizzes", "quiz", "data", "items", "results"]).map(
    normalizeQuiz
  )
}

function normalizeQuizAttempt(data: unknown): QuizAttempt {
  const item = isRecord(data)
    ? isRecord(data.attempt)
      ? data.attempt
      : data
    : {}

  return {
    id: getString(item.id) || getString(item.attempt_id),
    quiz_id: getString(item.quiz_id),
    user_id: getString(item.user_id),
    status: getString(item.status),
    score: getNumber(item.score),
    created_at: getString(item.created_at),
  }
}

function normalizeQuizResult(data: unknown): QuizAttemptResult | null {
  if (!isRecord(data)) return null

  const results = pickArray(data.results, [
    "results",
    "preguntas",
    "data",
    "items",
  ]).map((item, index) => {
    if (!isRecord(item)) {
      return {
        question_id: String(index),
        question: `Pregunta ${index + 1}`,
        options: [],
        correct_answer: "",
        user_answer: "",
        is_correct: false,
        explanation: "",
      }
    }

    return {
      question_id: getString(item.question_id) || String(index),
      question: getString(item.question),
      options: pickArray(item.options, []).map((option) => getString(option)),
      correct_answer: getString(item.correct_answer),
      user_answer: getString(item.user_answer),
      is_correct: getBoolean(item.is_correct) ?? false,
      explanation: getString(item.explanation),
    }
  })

  return {
    attempt_id: getString(data.attempt_id),
    quiz_id: getString(data.quiz_id),
    status: getString(data.status),
    score: getNumber(data.score) ?? 0,
    correct_count: getNumber(data.correct_count) ?? 0,
    total_questions: getNumber(data.total_questions) ?? results.length,
    answered_count: getNumber(data.answered_count) ?? 0,
    results,
  }
}

function getDeckCardCount(deck: Deck) {
  return deck.card_count ?? deck.cards?.length ?? 0
}

function getQuizQuestionCount(quiz: Quiz) {
  return quiz.question_count ?? quiz.questions?.length ?? 0
}

function createEmptyQuizQuestionForm(id = "quiz-question-1"): QuizQuestionForm {
  return {
    id,
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
  }
}

function formatDate(value?: string) {
  if (!value) return "Sin fecha"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getQrValue(data: unknown) {
  if (typeof data === "string") {
    return data
  }

  if (!isRecord(data)) {
    return ""
  }

  return (
    getString(data.qr_image_url) ||
    getString(data.qr_url) ||
    getString(data.url) ||
    getString(data.image_url) ||
    getString(data.qr)
  )
}

function getMemberName(member: OrganizationMember) {
  const fullName = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim()

  return fullName || member.email || member.user_id
}

function getStatusLabel(status?: string) {
  if (status === "accepted") return "Aceptado"
  if (status === "pending") return "Pendiente"
  if (status === "rejected") return "Rechazado"

  return status || "Sin estatus"
}

const detailTabs: Array<{ id: DetailTab; label: string; teacherOnly?: boolean }> = [
  { id: "decks", label: "Decks" },
  { id: "quizzes", label: "Quizzes" },
  { id: "members", label: "Miembros" },
  { id: "invites", label: "Invitaciones", teacherOnly: true },
  { id: "settings", label: "Ajustes", teacherOnly: true },
]

export function OrganizationDetail({ organizationId }: OrganizationDetailProps) {
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [waitlist, setWaitlist] = useState<OrganizationMember[]>([])
  const [invites, setInvites] = useState<OrganizationInvite[]>([])
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [savedQuizAnswers, setSavedQuizAnswers] = useState<Record<string, boolean>>(
    {}
  )
  const [quizResult, setQuizResult] = useState<QuizAttemptResult | null>(null)
  const [unseenCards, setUnseenCards] = useState<DeckCard[]>([])
  const [cardViewsById, setCardViewsById] = useState<Record<string, CardView[]>>(
    {}
  )
  const [documents, setDocuments] = useState<LibraryDocument[]>([])
  const [qrValue, setQrValue] = useState("")
  const [activeTab, setActiveTab] = useState<DetailTab>("decks")
  const [deckTitle, setDeckTitle] = useState("")
  const [aiDeckTitle, setAiDeckTitle] = useState("")
  const [aiDocumentId, setAiDocumentId] = useState("")
  const [aiCardCount, setAiCardCount] = useState(10)
  const [quizTitle, setQuizTitle] = useState("")
  const [quizDocumentId, setQuizDocumentId] = useState("")
  const [quizQuestionForms, setQuizQuestionForms] = useState<
    QuizQuestionForm[]
  >([createEmptyQuizQuestionForm()])
  const [cardFront, setCardFront] = useState("")
  const [cardBack, setCardBack] = useState("")
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editingCardFront, setEditingCardFront] = useState("")
  const [editingCardBack, setEditingCardBack] = useState("")
  const [aiEditCardId, setAiEditCardId] = useState<string | null>(null)
  const [aiEditInstruction, setAiEditInstruction] = useState("")
  const [aiEditProposal, setAiEditProposal] = useState<LlmEditProposal | null>(
    null
  )
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    subject: "",
  })
  const [inviteEmail, setInviteEmail] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDecks, setIsLoadingDecks] = useState(false)
  const [isLoadingDeckDetail, setIsLoadingDeckDetail] = useState(false)
  const [isLoadingUnseenCards, setIsLoadingUnseenCards] = useState(false)
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false)
  const [isLoadingQuizDetail, setIsLoadingQuizDetail] = useState(false)
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false)
  const [isStartingQuizAttempt, setIsStartingQuizAttempt] = useState(false)
  const [isFinishingQuizAttempt, setIsFinishingQuizAttempt] = useState(false)
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [isCreatingAiDeck, setIsCreatingAiDeck] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [mutatingStudentId, setMutatingStudentId] = useState<string | null>(null)
  const [mutatingDeckId, setMutatingDeckId] = useState<string | null>(null)
  const [mutatingCardId, setMutatingCardId] = useState<string | null>(null)
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null)
  const [loadingViewsCardId, setLoadingViewsCardId] = useState<string | null>(
    null
  )
  const [suggestingCardId, setSuggestingCardId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const acceptedMembers = useMemo(
    () =>
      members.filter(
        (member) => member.status !== "pending" && member.status !== "rejected"
      ),
    [members]
  )
  const readyDocuments = useMemo(
    () =>
      documents.filter((document) => {
        const status = document.status?.toLowerCase()

        return !status || status === "listo" || status === "ready"
      }),
    [documents]
  )
  const selectedCards = selectedDeck?.cards ?? []
  const selectedQuizQuestions = selectedQuiz?.questions ?? []
  const explicitlySeenCardCount = selectedCards.filter((card) => card.is_seen).length
  const viewedByMeCount = isLoadingUnseenCards
    ? explicitlySeenCardCount
    : Math.max(explicitlySeenCardCount, selectedCards.length - unseenCards.length)
  const isTeacher = currentUser?.role === "teacher"
  const visibleTabs = useMemo(
    () => detailTabs.filter((tab) => !tab.teacherOnly || isTeacher),
    [isTeacher]
  )

  const loadDetailData = useCallback(async () => {
    const [
      currentUserData,
      organizationsData,
      membersData,
      decksData,
      quizzesData,
      documentsData,
    ] = await Promise.all([
      getCurrentUser(),
      getMyOrganizations(),
      getOrganizationMembers(organizationId),
      getDecks(organizationId).catch(() => []),
      getQuizzes().catch(() => []),
      getDocuments().catch(() => []),
    ])
    const canManageOrganization = currentUserData.role === "teacher"
    const [waitlistData, invitesData, qrData] = canManageOrganization
      ? await Promise.all([
          getOrganizationWaitlist(organizationId).catch(() => []),
          getOrganizationInvites(organizationId).catch(() => []),
          getOrganizationQr(organizationId).catch(() => ""),
        ])
      : [[], [], ""]
    const organizationList = normalizeOrganizations(organizationsData)
    const activeOrganization =
      organizationList.find((item) => item.id === organizationId) ?? null

    return {
      currentUser: currentUserData,
      organization: activeOrganization,
      members: normalizeMembers(membersData),
      waitlist: normalizeMembers(waitlistData),
      invites: normalizeInvites(invitesData),
      decks: normalizeOrganizationDecks(decksData, organizationId),
      quizzes: normalizeQuizzes(quizzesData),
      documents: normalizeDocuments(documentsData),
      qrValue: getQrValue(qrData),
    }
  }, [organizationId])

  const applyDetailData = useCallback((data: Awaited<ReturnType<typeof loadDetailData>>) => {
    setCurrentUser(data.currentUser)
    setOrganization(data.organization)
    setEditForm({
      name: data.organization?.name ?? "",
      description: data.organization?.description ?? "",
      subject: data.organization?.subject ?? "",
    })
    setMembers(data.members)
    setWaitlist(data.waitlist)
    setInvites(data.invites)
    setDecks(data.decks)
    setQuizzes(data.quizzes)
    setDocuments(data.documents)
    setQrValue(data.qrValue)
  }, [])

  const loadDetail = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await loadDetailData()

      applyDetailData(data)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cargar el salon."

      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadInitialDetail = async () => {
      try {
        const data = await loadDetailData()

        if (!isMounted) return

        applyDetailData(data)
      } catch (error) {
        if (!isMounted) return

        const message =
          error instanceof Error
            ? error.message
            : "No se pudo cargar el salon."

        setError(message)
      } finally {
        if (!isMounted) return

        setIsLoading(false)
      }
    }

    void loadInitialDetail()

    return () => {
      isMounted = false
    }
  }, [applyDetailData, loadDetailData])

  const handleCopyCode = async () => {
    if (!organization?.join_code) return

    await navigator.clipboard.writeText(organization.join_code)
    setSuccessMessage("Codigo copiado al portapapeles.")
  }

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const email = inviteEmail.trim()

    if (!email) return

    try {
      setIsMutating(true)
      setError(null)
      setSuccessMessage(null)

      await inviteOrganizationMember(organizationId, email)
      setInviteEmail("")
      setSuccessMessage("Invitacion enviada correctamente.")
      const data = await getOrganizationInvites(organizationId)
      setInvites(normalizeInvites(data))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar la invitacion."

      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleRefreshDecks = async () => {
    try {
      setIsLoadingDecks(true)
      setError(null)

      const [decksData, documentsData] = await Promise.all([
        getDecks(organizationId),
        getDocuments().catch(() => []),
      ])

      setDecks(normalizeOrganizationDecks(decksData, organizationId))
      setDocuments(normalizeDocuments(documentsData))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar los decks."

      setError(message)
    } finally {
      setIsLoadingDecks(false)
    }
  }

  const handleCreateDeck = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = deckTitle.trim()

    if (!title) return

    try {
      setIsMutating(true)
      setError(null)
      setSuccessMessage(null)

      await createDeck({
        title,
        organization_id: organizationId,
      })
      setDeckTitle("")
      setSuccessMessage("Deck creado correctamente.")
      await handleRefreshDecks()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear el deck."

      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleCreateAiDeck = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = aiDeckTitle.trim()

    if (!title || !aiDocumentId) return

    try {
      setIsCreatingAiDeck(true)
      setError(null)
      setSuccessMessage(null)

      await createDeckFromDocument({
        title,
        organization_id: organizationId,
        document_id: aiDocumentId,
        num_cards: aiCardCount,
      })
      setAiDeckTitle("")
      setAiDocumentId("")
      setAiCardCount(10)
      setSuccessMessage("Deck generado con IA correctamente.")
      await handleRefreshDecks()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar el deck con IA."

      setError(message)
    } finally {
      setIsCreatingAiDeck(false)
    }
  }

  const handleDeleteDeck = async (deckId: string) => {
    const shouldDelete = window.confirm(
      "Eliminar este deck tambien eliminara sus cards."
    )

    if (!shouldDelete) return

    try {
      setMutatingDeckId(deckId)
      setError(null)
      setSuccessMessage(null)

      await deleteDeck(deckId)
      setDecks((currentDecks) =>
        currentDecks.filter((deck) => deck.id !== deckId)
      )
      if (selectedDeck?.id === deckId) {
        setSelectedDeck(null)
      }
      setSuccessMessage("Deck eliminado correctamente.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar el deck."

      setError(message)
    } finally {
      setMutatingDeckId(null)
    }
  }

  const loadDeckDetail = async (deckId: string) => {
    setIsLoadingDeckDetail(true)
    setError(null)

    try {
      const deckData = await getDeck(deckId)
      const detailedDeck = normalizeDeck(deckData, 0)

      setSelectedDeck(detailedDeck)
      setDecks((currentDecks) =>
        currentDecks.map((deck) =>
          deck.id === detailedDeck.id
            ? {
                ...deck,
                card_count: getDeckCardCount(detailedDeck),
                cards: detailedDeck.cards,
              }
            : deck
        )
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las cards del deck."

      setError(message)
    } finally {
      setIsLoadingDeckDetail(false)
    }
  }

  const loadUnseenDeckCards = async (deckId: string) => {
    setIsLoadingUnseenCards(true)

    try {
      const unseenData = await getUnseenCards(deckId)
      const nextUnseenCards = normalizeDeckCards(unseenData)
      const unseenCardIds = new Set(nextUnseenCards.map((card) => card.id))

      setUnseenCards(nextUnseenCards)
      setSelectedDeck((currentDeck) => {
        if (!currentDeck || currentDeck.id !== deckId || !currentDeck.cards) {
          return currentDeck
        }

        return {
          ...currentDeck,
          cards: currentDeck.cards.map((card) => ({
            ...card,
            is_seen: card.is_seen || !unseenCardIds.has(card.id),
          })),
        }
      })
    } catch {
      setUnseenCards([])
    } finally {
      setIsLoadingUnseenCards(false)
    }
  }

  const handleOpenDeck = async (deck: Deck) => {
    setSelectedDeck(deck)
    setUnseenCards([])
    setCardViewsById({})
    setEditingCardId(null)
    setAiEditCardId(null)
    setAiEditProposal(null)
    await Promise.all([loadDeckDetail(deck.id), loadUnseenDeckCards(deck.id)])
  }

  const handleBackToDecks = () => {
    setSelectedDeck(null)
    setUnseenCards([])
    setCardViewsById({})
    setEditingCardId(null)
    setAiEditCardId(null)
    setAiEditProposal(null)
  }

  const handleRefreshQuizzes = async () => {
    try {
      setIsLoadingQuizzes(true)
      setError(null)

      const [quizzesData, documentsData] = await Promise.all([
        getQuizzes(),
        getDocuments().catch(() => []),
      ])

      setQuizzes(normalizeQuizzes(quizzesData))
      setDocuments(normalizeDocuments(documentsData))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los quizzes."

      setError(message)
    } finally {
      setIsLoadingQuizzes(false)
    }
  }

  const handleQuizQuestionChange = (
    questionId: string,
    field: "question" | "correct_answer" | "explanation",
    value: string
  ) => {
    setQuizQuestionForms((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId ? { ...question, [field]: value } : question
      )
    )
  }

  const handleQuizOptionChange = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    setQuizQuestionForms((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option, index) =>
                index === optionIndex ? value : option
              ),
            }
          : question
      )
    )
  }

  const handleAddQuizQuestion = () => {
    const nextId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `quiz-question-${Date.now()}`

    setQuizQuestionForms((currentQuestions) => [
      ...currentQuestions,
      createEmptyQuizQuestionForm(nextId),
    ])
  }

  const handleRemoveQuizQuestion = (questionId: string) => {
    setQuizQuestionForms((currentQuestions) =>
      currentQuestions.length <= 1
        ? currentQuestions
        : currentQuestions.filter((question) => question.id !== questionId)
    )
  }

  const handleCreateQuiz = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = quizTitle.trim()
    const questions = quizQuestionForms.map((question) => {
      const options = question.options.map((option) => option.trim())

      return {
        question: question.question.trim(),
        options,
        correct_answer: question.correct_answer.trim(),
        explanation: question.explanation.trim(),
      }
    })

    const hasInvalidQuestion = questions.some(
      (question) =>
        !question.question ||
        question.options.filter(Boolean).length < 2 ||
        !question.correct_answer ||
        !question.options.includes(question.correct_answer)
    )

    if (!title || hasInvalidQuestion) {
      setError(
        "Completa el titulo, preguntas, al menos dos opciones y una respuesta correcta que exista entre las opciones."
      )
      return
    }

    try {
      setIsCreatingQuiz(true)
      setError(null)
      setSuccessMessage(null)

      await createQuiz({
        title,
        ...(quizDocumentId ? { document_id: quizDocumentId } : {}),
        questions: questions.map((question) => ({
          ...question,
          options: question.options.filter(Boolean),
        })),
      })

      setQuizTitle("")
      setQuizDocumentId("")
      setQuizQuestionForms([createEmptyQuizQuestionForm()])
      setSuccessMessage("Quiz creado correctamente.")
      await handleRefreshQuizzes()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear el quiz."

      setError(message)
    } finally {
      setIsCreatingQuiz(false)
    }
  }

  const loadQuizDetail = async (quizId: string) => {
    setIsLoadingQuizDetail(true)
    setError(null)

    try {
      const quizData = await getQuiz(quizId)
      const detailedQuiz = normalizeQuiz(quizData, 0)

      setSelectedQuiz(detailedQuiz)
      setQuizzes((currentQuizzes) =>
        currentQuizzes.map((quiz) =>
          quiz.id === detailedQuiz.id
            ? {
                ...quiz,
                question_count: getQuizQuestionCount(detailedQuiz),
                questions: detailedQuiz.questions,
              }
            : quiz
        )
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las preguntas del quiz."

      setError(message)
    } finally {
      setIsLoadingQuizDetail(false)
    }
  }

  const handleOpenQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setQuizAttempt(null)
    setQuizAnswers({})
    setSavedQuizAnswers({})
    setQuizResult(null)
    await loadQuizDetail(quiz.id)
  }

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null)
    setQuizAttempt(null)
    setQuizAnswers({})
    setSavedQuizAnswers({})
    setQuizResult(null)
  }

  const handleStartQuizAttempt = async () => {
    if (!selectedQuiz) return

    try {
      setIsStartingQuizAttempt(true)
      setError(null)
      setSuccessMessage(null)

      const attemptData = await startQuizAttempt(selectedQuiz.id)

      setQuizAttempt(normalizeQuizAttempt(attemptData))
      setQuizAnswers({})
      setSavedQuizAnswers({})
      setQuizResult(null)
      setSuccessMessage("Intento iniciado. Responde y guarda cada pregunta.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar el intento."

      setError(message)
    } finally {
      setIsStartingQuizAttempt(false)
    }
  }

  const handleSaveQuizAnswer = async (questionId: string) => {
    if (!quizAttempt) return

    const userAnswer = quizAnswers[questionId]

    if (!userAnswer) return

    try {
      setSavingQuestionId(questionId)
      setError(null)
      setSuccessMessage(null)

      await saveQuizAnswer(quizAttempt.id, {
        question_id: questionId,
        user_answer: userAnswer,
      })

      setSavedQuizAnswers((currentAnswers) => ({
        ...currentAnswers,
        [questionId]: true,
      }))
      setSuccessMessage("Respuesta guardada.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo guardar la respuesta."

      setError(message)
    } finally {
      setSavingQuestionId(null)
    }
  }

  const handleFinishQuizAttempt = async () => {
    if (!quizAttempt) return

    try {
      setIsFinishingQuizAttempt(true)
      setError(null)
      setSuccessMessage(null)

      const resultData = await finishQuizAttempt(quizAttempt.id)

      setQuizResult(normalizeQuizResult(resultData))
      setQuizAttempt((currentAttempt) =>
        currentAttempt ? { ...currentAttempt, status: "finished" } : currentAttempt
      )
      setSuccessMessage("Quiz finalizado.")
      if (selectedQuiz) {
        await loadQuizDetail(selectedQuiz.id)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo finalizar el quiz."

      setError(message)
    } finally {
      setIsFinishingQuizAttempt(false)
    }
  }

  const handleCreateCard = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const front = cardFront.trim()
    const back = cardBack.trim()

    if (!selectedDeck || !front || !back) return

    try {
      setIsCreatingCard(true)
      setError(null)
      setSuccessMessage(null)

      await createCards(selectedDeck.id, {
        cards: [
          {
            front_text: front,
            back_text: back,
          },
        ],
      })
      setCardFront("")
      setCardBack("")
      setSuccessMessage("Card creada correctamente.")
      await loadDeckDetail(selectedDeck.id)
      await loadUnseenDeckCards(selectedDeck.id)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear la card."

      setError(message)
    } finally {
      setIsCreatingCard(false)
    }
  }

  const handleStartEditCard = (card: DeckCard) => {
    setEditingCardId(card.id)
    setEditingCardFront(card.front_text)
    setEditingCardBack(card.back_text)
    setAiEditCardId(null)
    setAiEditInstruction("")
    setAiEditProposal(null)
  }

  const handleToggleAiEditCard = (cardId: string) => {
    if (aiEditCardId === cardId) {
      setAiEditCardId(null)
      setAiEditInstruction("")
      setAiEditProposal(null)
      return
    }

    setAiEditCardId(cardId)
    setAiEditInstruction("")
    setAiEditProposal(null)
    setEditingCardId(null)
  }

  const handleUpdateCard = async (cardId: string) => {
    if (!selectedDeck) return

    const front = editingCardFront.trim()
    const back = editingCardBack.trim()

    if (!front || !back) return

    try {
      setMutatingCardId(cardId)
      setError(null)
      setSuccessMessage(null)

      await updateCard(selectedDeck.id, cardId, {
        front_text: front,
        back_text: back,
      })
      setEditingCardId(null)
      setSuccessMessage("Card actualizada correctamente.")
      await loadDeckDetail(selectedDeck.id)
      await loadUnseenDeckCards(selectedDeck.id)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar la card."

      setError(message)
    } finally {
      setMutatingCardId(null)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!selectedDeck) return

    const shouldDelete = window.confirm("Eliminar esta card del deck.")

    if (!shouldDelete) return

    try {
      setMutatingCardId(cardId)
      setError(null)
      setSuccessMessage(null)

      await deleteCard(selectedDeck.id, cardId)
      setSuccessMessage("Card eliminada correctamente.")
      await loadDeckDetail(selectedDeck.id)
      await loadUnseenDeckCards(selectedDeck.id)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar la card."

      setError(message)
    } finally {
      setMutatingCardId(null)
    }
  }

  const handleMarkCardViewed = async (cardId: string) => {
    if (!selectedDeck) return

    try {
      setMutatingCardId(cardId)
      await markCardAsViewed(selectedDeck.id, cardId)
      setSelectedDeck((currentDeck) => {
        if (!currentDeck || currentDeck.id !== selectedDeck.id || !currentDeck.cards) {
          return currentDeck
        }

        return {
          ...currentDeck,
          cards: currentDeck.cards.map((card) =>
            card.id === cardId ? { ...card, is_seen: true } : card
          ),
        }
      })
      setUnseenCards((currentCards) =>
        currentCards.filter((card) => card.id !== cardId)
      )
      await loadDeckDetail(selectedDeck.id)
      await loadUnseenDeckCards(selectedDeck.id)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo marcar como vista."

      setError(message)
    } finally {
      setMutatingCardId(null)
    }
  }

  const handleSuggestCardEdit = async (cardId: string) => {
    if (!selectedDeck || !aiEditInstruction.trim()) return

    try {
      setSuggestingCardId(cardId)
      setError(null)
      setAiEditProposal(null)

      const proposal = await suggestCardEdit(selectedDeck.id, cardId, {
        instruction: aiEditInstruction.trim(),
      })

      if (isRecord(proposal)) {
        setAiEditProposal({
          front_text: getString(proposal.front_text),
          back_text: getString(proposal.back_text),
        })
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar la propuesta con IA."

      setError(message)
    } finally {
      setSuggestingCardId(null)
    }
  }

  const handleLoadCardViews = async (cardId: string) => {
    if (!selectedDeck) return
    if (cardViewsById[cardId]) {
      setCardViewsById((currentViews) => {
        const nextViews = { ...currentViews }

        delete nextViews[cardId]

        return nextViews
      })
      return
    }

    try {
      setLoadingViewsCardId(cardId)
      setError(null)

      const viewsData = await getCardViews(selectedDeck.id, cardId)

      setCardViewsById((currentViews) => ({
        ...currentViews,
        [cardId]: normalizeCardViews(viewsData),
      }))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron consultar las vistas de la card."

      setError(message)
    } finally {
      setLoadingViewsCardId(null)
    }
  }

  const handleApplyAiProposal = async () => {
    if (!selectedDeck || !aiEditCardId || !aiEditProposal) return

    try {
      setMutatingCardId(aiEditCardId)
      setError(null)
      setSuccessMessage(null)

      await updateCard(selectedDeck.id, aiEditCardId, {
        front_text: aiEditProposal.front_text,
        back_text: aiEditProposal.back_text,
      })
      setAiEditCardId(null)
      setAiEditInstruction("")
      setAiEditProposal(null)
      setSuccessMessage("Propuesta aplicada correctamente.")
      await loadDeckDetail(selectedDeck.id)
      await loadUnseenDeckCards(selectedDeck.id)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo aplicar la propuesta."

      setError(message)
    } finally {
      setMutatingCardId(null)
    }
  }

  const handleMemberStatus = async (
    studentId: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      setMutatingStudentId(studentId)
      setError(null)
      setSuccessMessage(null)

      await updateOrganizationMemberStatus(organizationId, studentId, { status })
      setSuccessMessage(
        status === "accepted" ? "Alumno aceptado." : "Alumno rechazado."
      )
      const [membersData, waitlistData] = await Promise.all([
        getOrganizationMembers(organizationId),
        getOrganizationWaitlist(organizationId).catch(() => []),
      ])
      setMembers(normalizeMembers(membersData))
      setWaitlist(normalizeMembers(waitlistData))
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar al alumno."

      setError(message)
    } finally {
      setMutatingStudentId(null)
    }
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setIsMutating(true)
      setError(null)
      setSuccessMessage(null)

      await updateOrganization(organizationId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        subject: editForm.subject.trim(),
      })
      setSuccessMessage("Salon actualizado correctamente.")
      await loadDetail()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el salon."

      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "Eliminar este salon tambien eliminara sus miembros e invitaciones."
    )

    if (!shouldDelete) return

    try {
      setIsMutating(true)
      await deleteOrganization(organizationId)
      router.push("/dashboard/organizaciones")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar el salon."

      setError(message)
    } finally {
      setIsMutating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando salon...
      </div>
    )
  }

  return (
    <section className="flex h-[calc(100vh-4rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mb-6">
        <Link
          href="/dashboard/organizaciones"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Volver a salones
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Salon</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              {organization?.name ?? "Salon"}
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              {organization?.description || "Sin descripcion."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                {organization?.subject || "Sin asignatura"}
              </span>
              {organization?.join_code && (
                <button
                  type="button"
                  onClick={() => void handleCopyCode()}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {organization.join_code}
                </button>
              )}
            </div>
          </div>

          <div
            className={`grid gap-3 text-sm ${
              isTeacher ? "grid-cols-2 lg:min-w-56" : "grid-cols-1 lg:min-w-32"
            }`}
          >
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-slate-500">Miembros</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {acceptedMembers.length}
              </p>
            </div>
            {isTeacher && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Espera</p>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {waitlist.length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "decks" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Layers3 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-950">
                Decks del salon
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Crea mazos vacios para agregar cards manualmente o genera decks
                con IA usando los documentos de tu biblioteca.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleRefreshDecks()}
              disabled={isLoadingDecks}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingDecks ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>

          <div className="h-[36rem] space-y-5 overflow-y-auto border-t border-slate-100 bg-slate-50/40 p-5">
            <div
              className={`gap-4 xl:grid-cols-2 ${
                selectedDeck ? "hidden" : "grid"
              }`}
            >
              <form
                onSubmit={handleCreateDeck}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">Deck vacio</h3>
                    <p className="text-sm text-slate-500">
                      Solo necesita un nombre. Las cards se agregaran despues.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    value={deckTitle}
                    onChange={(event) => setDeckTitle(event.target.value)}
                    placeholder="Nombre del deck"
                    className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="submit"
                    disabled={!deckTitle.trim() || isMutating}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {isMutating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Crear
                  </button>
                </div>
              </form>

              <form
                onSubmit={handleCreateAiDeck}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">Deck con IA</h3>
                    <p className="text-sm text-slate-500">
                      Usa un documento procesado de Biblioteca para generar
                      cards automaticamente.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_7rem_auto]">
                  <input
                    type="text"
                    value={aiDeckTitle}
                    onChange={(event) => setAiDeckTitle(event.target.value)}
                    placeholder="Nombre del deck"
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <select
                    value={aiDocumentId}
                    onChange={(event) => setAiDocumentId(event.target.value)}
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Documento</option>
                    {readyDocuments.map((document) => (
                      <option key={document.id} value={document.id}>
                        {document.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={aiCardCount}
                    onChange={(event) =>
                      setAiCardCount(Number(event.target.value) || 1)
                    }
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    aria-label="Cantidad de cards"
                  />
                  <button
                    type="submit"
                    disabled={
                      !aiDeckTitle.trim() || !aiDocumentId || isCreatingAiDeck
                    }
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {isCreatingAiDeck ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    Generar
                  </button>
                </div>

                {readyDocuments.length === 0 && (
                  <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    No hay documentos listos en Biblioteca para generar decks con
                    IA.
                  </p>
                )}
              </form>
            </div>

            {selectedDeck && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={handleBackToDecks}
                      className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Volver a decks
                    </button>
                    <p className="text-sm font-medium text-blue-600">Deck</p>
                    <h3 className="text-xl font-semibold text-slate-950">
                      {selectedDeck.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedCards.length} card(s) en este deck.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-600">
                        {isLoadingUnseenCards
                          ? "Calculando vistas..."
                          : `${viewedByMeCount} vistas por mi`}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                        {isLoadingUnseenCards
                          ? "Calculando pendientes..."
                          : `${unseenCards.length} sin ver`}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadDeckDetail(selectedDeck.id)}
                    disabled={isLoadingDeckDetail}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        isLoadingDeckDetail ? "animate-spin" : ""
                      }`}
                    />
                    Refrescar cards
                  </button>
                </div>

                <form
                  onSubmit={handleCreateCard}
                  className="grid gap-3 border-b border-slate-100 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <input
                    value={cardFront}
                    onChange={(event) => setCardFront(event.target.value)}
                    placeholder="Frente de la card"
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <input
                    value={cardBack}
                    onChange={(event) => setCardBack(event.target.value)}
                    placeholder="Reverso de la card"
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="submit"
                    disabled={
                      !cardFront.trim() || !cardBack.trim() || isCreatingCard
                    }
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {isCreatingCard ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Agregar card
                  </button>
                </form>

                <div className="border-b border-slate-100 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-slate-950">
                        Cards sin ver
                      </h4>
                      <p className="text-sm text-slate-500">
                        Pendientes para el usuario actual en este deck.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void loadUnseenDeckCards(selectedDeck.id)}
                      disabled={isLoadingUnseenCards}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          isLoadingUnseenCards ? "animate-spin" : ""
                        }`}
                      />
                      Actualizar
                    </button>
                  </div>

                  {isLoadingUnseenCards ? (
                    <p className="mt-3 text-sm text-slate-500">
                      Cargando cards pendientes...
                    </p>
                  ) : unseenCards.length > 0 ? (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {unseenCards.map((card) => (
                        <div
                          key={card.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <p className="line-clamp-1 text-sm font-semibold text-slate-950">
                            {card.front_text}
                          </p>
                          <p className="line-clamp-1 text-xs text-slate-500">
                            {card.back_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                      No tienes cards pendientes por ver en este deck.
                    </p>
                  )}
                </div>

                {isLoadingDeckDetail ? (
                  <div className="flex min-h-40 items-center justify-center text-sm text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando cards...
                  </div>
                ) : selectedCards.length > 0 ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {selectedCards.map((card, index) => {
                      const isEditing = editingCardId === card.id
                      const isAiEditing = aiEditCardId === card.id
                      const isShowingViews = Boolean(cardViewsById[card.id])
                      const isBusy = mutatingCardId === card.id

                      return (
                        <article
                          key={card.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase text-blue-600">
                                Card {index + 1}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {card.is_seen ? "Vista" : "Pendiente"}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => void handleMarkCardViewed(card.id)}
                                disabled={isBusy}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Marcar card como vista"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleLoadCardViews(card.id)}
                                disabled={loadingViewsCardId === card.id}
                                className={`rounded-lg p-2 transition hover:bg-white hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${
                                  isShowingViews
                                    ? "bg-white text-blue-600"
                                    : "text-slate-500"
                                }`}
                                aria-label="Ver usuarios que vieron la card"
                              >
                                {loadingViewsCardId === card.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UsersRound className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStartEditCard(card)}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-blue-600"
                                aria-label="Editar card"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleAiEditCard(card.id)}
                                className={`rounded-lg p-2 transition hover:bg-white hover:text-blue-600 ${
                                  isAiEditing
                                    ? "bg-white text-blue-600"
                                    : "text-slate-500"
                                }`}
                                aria-label="Proponer edicion con IA"
                              >
                                <Sparkles className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteCard(card.id)}
                                disabled={isBusy}
                                className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Eliminar card"
                              >
                                {isBusy ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          {isEditing ? (
                            <div className="space-y-3">
                              <textarea
                                value={editingCardFront}
                                onChange={(event) =>
                                  setEditingCardFront(event.target.value)
                                }
                                className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                              <textarea
                                value={editingCardBack}
                                onChange={(event) =>
                                  setEditingCardBack(event.target.value)
                                }
                                className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingCardId(null)}
                                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleUpdateCard(card.id)}
                                  disabled={
                                    !editingCardFront.trim() ||
                                    !editingCardBack.trim() ||
                                    isBusy
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                >
                                  {isBusy && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  )}
                                  Guardar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid gap-3 md:grid-cols-2">
                              <div className="rounded-xl bg-white p-3">
                                <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                                  Frente
                                </p>
                                <p className="whitespace-pre-wrap text-sm text-slate-950">
                                  {card.front_text}
                                </p>
                              </div>
                              <div className="rounded-xl bg-white p-3">
                                <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
                                  Reverso
                                </p>
                                <p className="whitespace-pre-wrap text-sm text-slate-950">
                                  {card.back_text}
                                </p>
                              </div>
                            </div>
                          )}

                          {isAiEditing && (
                            <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3">
                              <label className="text-xs font-semibold uppercase text-slate-500">
                                Edicion con IA
                              </label>
                              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                                <input
                                  value={aiEditInstruction}
                                  onChange={(event) =>
                                    setAiEditInstruction(event.target.value)
                                  }
                                  placeholder="Ej. hazla mas corta"
                                  className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleSuggestCardEdit(card.id)
                                  }
                                  disabled={
                                    !aiEditInstruction.trim() ||
                                    suggestingCardId === card.id
                                  }
                                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                >
                                  {suggestingCardId === card.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-4 w-4" />
                                  )}
                                  Proponer
                                </button>
                              </div>

                              {aiEditProposal && (
                                <div className="mt-3 space-y-3 rounded-xl bg-blue-50 p-3">
                                  <div>
                                    <p className="text-xs font-semibold uppercase text-blue-600">
                                      Frente propuesto
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-950">
                                      {aiEditProposal.front_text}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold uppercase text-blue-600">
                                      Reverso propuesto
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-950">
                                      {aiEditProposal.back_text}
                                    </p>
                                  </div>
                                  <div className="flex justify-end">
                                    <button
                                      type="button"
                                      onClick={() => void handleApplyAiProposal()}
                                      disabled={isBusy}
                                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                                    >
                                      {isBusy && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      )}
                                      Aplicar propuesta
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {cardViewsById[card.id] && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                              <p className="text-xs font-semibold uppercase text-slate-500">
                                Usuarios que vieron esta card
                              </p>
                              {cardViewsById[card.id].length > 0 ? (
                                <div className="mt-2 space-y-2">
                                  {cardViewsById[card.id].map((view) => (
                                    <div
                                      key={`${view.user_id}-${view.viewed_at}`}
                                      className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"
                                    >
                                      <p className="font-semibold text-slate-950">
                                        {view.user_id}
                                      </p>
                                      <p>{formatDate(view.viewed_at)}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="mt-2 text-sm text-slate-500">
                                  Aun nadie ha marcado esta card como vista.
                                </p>
                              )}
                            </div>
                          )}
                        </article>
                      )
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <h4 className="font-semibold text-slate-950">
                      Este deck aun no tiene cards
                    </h4>
                    <p className="mt-2 text-sm text-slate-500">
                      Agrega una card manualmente desde el formulario superior.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!selectedDeck && (isLoadingDecks ? (
              <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando decks...
              </div>
            ) : decks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {decks.map((deck) => (
                  <article
                    key={deck.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteDeck(deck.id)}
                        disabled={mutatingDeckId === deck.id}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`Eliminar deck ${deck.title}`}
                      >
                        {mutatingDeckId === deck.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-950">
                      {deck.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {getDeckCardCount(deck)} card(s)
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Creado: {formatDate(deck.created_at)}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleOpenDeck(deck)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                    >
                      <BookOpen className="h-4 w-4" />
                      Ver cards
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <School className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Aun no hay decks
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
                  Crea un deck vacio escribiendo solo el nombre. Para crear uno
                  con IA, elige un documento de Biblioteca y la cantidad de cards.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "quizzes" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-950">
                Quizzes del salon
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Crea quizzes con preguntas de opcion multiple, abre un intento y
                revisa el resultado al finalizar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleRefreshQuizzes()}
              disabled={isLoadingQuizzes}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoadingQuizzes ? "animate-spin" : ""}`}
              />
              Actualizar
            </button>
          </div>

          <div className="h-[36rem] space-y-5 overflow-y-auto border-t border-slate-100 bg-slate-50/40 p-5">
            {!selectedQuiz && (
              <form
                onSubmit={handleCreateQuiz}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      Crear quiz manual
                    </h3>
                    <p className="text-sm text-slate-500">
                      Define el titulo y las preguntas que resolveran los
                      miembros. Puedes asociar un documento si aplica.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(event) => setQuizTitle(event.target.value)}
                    placeholder="Titulo del quiz"
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                  <select
                    value={quizDocumentId}
                    onChange={(event) => setQuizDocumentId(event.target.value)}
                    className="min-h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Documento opcional</option>
                    {readyDocuments.map((document) => (
                      <option key={document.id} value={document.id}>
                        {document.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 space-y-3">
                  {quizQuestionForms.map((question, questionIndex) => (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">
                          Pregunta {questionIndex + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuizQuestion(question.id)}
                          disabled={quizQuestionForms.length <= 1}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="Quitar pregunta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <textarea
                        value={question.question}
                        onChange={(event) =>
                          handleQuizQuestionChange(
                            question.id,
                            "question",
                            event.target.value
                          )
                        }
                        placeholder="Escribe la pregunta"
                        className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {question.options.map((option, optionIndex) => (
                          <input
                            key={`${question.id}-option-${optionIndex}`}
                            value={option}
                            onChange={(event) =>
                              handleQuizOptionChange(
                                question.id,
                                optionIndex,
                                event.target.value
                              )
                            }
                            placeholder={`Opcion ${optionIndex + 1}`}
                            className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />
                        ))}
                      </div>

                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        <input
                          value={question.correct_answer}
                          onChange={(event) =>
                            handleQuizQuestionChange(
                              question.id,
                              "correct_answer",
                              event.target.value
                            )
                          }
                          placeholder="Respuesta correcta exacta"
                          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                        <input
                          value={question.explanation}
                          onChange={(event) =>
                            handleQuizQuestionChange(
                              question.id,
                              "explanation",
                              event.target.value
                            )
                          }
                          placeholder="Explicacion opcional"
                          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={handleAddQuizQuestion}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar pregunta
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingQuiz}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {isCreatingQuiz ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Crear quiz
                  </button>
                </div>

                {readyDocuments.length === 0 && (
                  <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    No hay documentos listos en Biblioteca, pero puedes crear el
                    quiz manual sin asociarlo a un documento.
                  </p>
                )}
              </form>
            )}

            {selectedQuiz && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={handleBackToQuizzes}
                      className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Volver a quizzes
                    </button>
                    <p className="text-sm font-medium text-blue-600">Quiz</p>
                    <h3 className="text-xl font-semibold text-slate-950">
                      {selectedQuiz.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedQuizQuestions.length} pregunta(s). Creado:{" "}
                      {formatDate(selectedQuiz.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void loadQuizDetail(selectedQuiz.id)}
                      disabled={isLoadingQuizDetail}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          isLoadingQuizDetail ? "animate-spin" : ""
                        }`}
                      />
                      Refrescar
                    </button>
                    {!quizAttempt && !quizResult && (
                      <button
                        type="button"
                        onClick={() => void handleStartQuizAttempt()}
                        disabled={
                          isStartingQuizAttempt ||
                          selectedQuizQuestions.length === 0
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        {isStartingQuizAttempt ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Iniciar intento
                      </button>
                    )}
                  </div>
                </div>

                {isLoadingQuizDetail ? (
                  <div className="flex min-h-40 items-center justify-center text-sm text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando quiz...
                  </div>
                ) : selectedQuizQuestions.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {selectedQuizQuestions.map((question, index) => {
                      const resultItem = quizResult?.results.find(
                        (item) => item.question_id === question.id
                      )
                      const selectedAnswer =
                        quizAnswers[question.id] ?? resultItem?.user_answer ?? ""
                      const canAnswer = Boolean(quizAttempt) && !quizResult

                      return (
                        <article
                          key={question.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase text-blue-600">
                                Pregunta {index + 1}
                              </p>
                              <h4 className="mt-1 font-semibold text-slate-950">
                                {question.question}
                              </h4>
                            </div>
                            {resultItem && (
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  resultItem.is_correct
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {resultItem.is_correct
                                  ? "Correcta"
                                  : "Incorrecta"}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 grid gap-2">
                            {question.options.map((option) => (
                              <label
                                key={`${question.id}-${option}`}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                                  selectedAnswer === option
                                    ? "border-blue-300 bg-blue-50 text-blue-700"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-question-${question.id}`}
                                  value={option}
                                  checked={selectedAnswer === option}
                                  disabled={!canAnswer}
                                  onChange={(event) =>
                                    setQuizAnswers((currentAnswers) => ({
                                      ...currentAnswers,
                                      [question.id]: event.target.value,
                                    }))
                                  }
                                  className="h-4 w-4 accent-blue-600"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>

                          {resultItem ? (
                            <div className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">
                              <p>
                                <span className="font-semibold text-slate-950">
                                  Tu respuesta:
                                </span>{" "}
                                {resultItem.user_answer || "Sin responder"}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-950">
                                  Correcta:
                                </span>{" "}
                                {resultItem.correct_answer}
                              </p>
                              {resultItem.explanation && (
                                <p className="mt-2">{resultItem.explanation}</p>
                              )}
                            </div>
                          ) : (
                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleSaveQuizAnswer(question.id)
                                }
                                disabled={
                                  !canAnswer ||
                                  !selectedAnswer ||
                                  savingQuestionId === question.id
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {savingQuestionId === question.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                {savedQuizAnswers[question.id]
                                  ? "Guardada"
                                  : "Guardar respuesta"}
                              </button>
                            </div>
                          )}
                        </article>
                      )
                    })}

                    {quizAttempt && !quizResult && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => void handleFinishQuizAttempt()}
                          disabled={isFinishingQuizAttempt}
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                          {isFinishingQuizAttempt ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                          Finalizar quiz
                        </button>
                      </div>
                    )}

                    {quizResult && (
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-blue-700">
                          Resultado
                        </p>
                        <h4 className="mt-1 text-2xl font-bold text-slate-950">
                          {quizResult.score} puntos
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">
                          {quizResult.correct_count} correctas de{" "}
                          {quizResult.total_questions}. Respondidas:{" "}
                          {quizResult.answered_count}.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                    <h4 className="font-semibold text-slate-950">
                      Este quiz aun no tiene preguntas
                    </h4>
                    <p className="mt-2 text-sm text-slate-500">
                      Crea un quiz con al menos una pregunta para poder iniciar
                      un intento.
                    </p>
                  </div>
                )}
              </div>
            )}

            {!selectedQuiz && (isLoadingQuizzes ? (
              <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cargando quizzes...
              </div>
            ) : quizzes.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {quizzes.map((quiz) => (
                  <article
                    key={quiz.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Check className="h-5 w-5" />
                    </div>
                    <h3 className="line-clamp-2 text-lg font-semibold text-slate-950">
                      {quiz.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {getQuizQuestionCount(quiz)} pregunta(s)
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Creado: {formatDate(quiz.created_at)}
                    </p>
                    <button
                      type="button"
                      onClick={() => void handleOpenQuiz(quiz)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
                    >
                      <Check className="h-4 w-4" />
                      Ver quiz
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <School className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Aun no hay quizzes
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
                  Crea un quiz manual con sus preguntas y opciones para que los
                  miembros puedan contestarlo.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div
          className={`grid gap-4 ${
            isTeacher ? "xl:grid-cols-[minmax(0,1fr)_24rem]" : ""
          }`}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <UsersRound className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-950">Miembros</h2>
            </div>
            <div className="space-y-2">
              {acceptedMembers.length > 0 ? (
                acceptedMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {getMemberName(member)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {member.email || member.user_id}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {member.role || "member"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Todavia no hay miembros aceptados.
                </p>
              )}
            </div>
          </div>

          {isTeacher && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-slate-950">Lista de espera</h2>
              </div>
              <div className="space-y-2">
                {waitlist.length > 0 ? (
                  waitlist.map((member) => (
                    <div
                      key={member.user_id}
                      className="rounded-xl border border-slate-100 p-3"
                    >
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {getMemberName(member)}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {member.email || member.user_id}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void handleMemberStatus(member.user_id, "accepted")
                          }
                          disabled={mutatingStudentId === member.user_id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-60"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Aceptar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void handleMemberStatus(member.user_id, "rejected")
                          }
                          disabled={mutatingStudentId === member.user_id}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    No hay solicitudes pendientes.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isTeacher && activeTab === "invites" && (
        <div className="grid gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-950">Invitar alumno</h2>
            </div>
            <form onSubmit={handleInvite} className="space-y-3">
              <input
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
              <button
                type="submit"
                disabled={!inviteEmail.trim() || isMutating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isMutating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Enviar invitacion
              </button>
            </form>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <QrCode className="h-4 w-4 text-blue-600" />
                Codigo QR
              </div>
              {qrValue ? (
                <div className="space-y-3">
                  <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4">
                    <Image
                      src={qrValue}
                      alt={`Codigo QR para unirse al salon ${
                        organization?.name ?? ""
                      }`}
                      width={192}
                      height={192}
                      unoptimized
                      className="h-48 w-48 rounded-lg object-contain"
                    />
                  </div>
                  {organization?.join_code && (
                    <div className="rounded-xl bg-white px-3 py-2 text-center">
                      <p className="text-xs font-medium text-slate-500">
                        Codigo de union
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {organization.join_code}
                      </p>
                    </div>
                  )}
                  <a
                    href={qrValue}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Abrir imagen del QR
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  El backend no devolvio una URL de QR para este salon.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-950">
              Historial de invitaciones
            </h2>
            <div className="space-y-2">
              {invites.length > 0 ? (
                invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {invite.email}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {invite.created_at || "Sin fecha"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {getStatusLabel(invite.status)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  No hay invitaciones registradas.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {isTeacher && activeTab === "settings" && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <form
            onSubmit={handleSave}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 font-semibold text-slate-950">Editar salon</h2>
            <div className="grid gap-3">
              <input
                value={editForm.name}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Nombre"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
              <input
                value={editForm.subject}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    subject: event.target.value,
                  }))
                }
                placeholder="Asignatura"
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
              <textarea
                value={editForm.description}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Descripcion"
                rows={4}
                className="resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/20"
              />
            </div>
            <button
              type="submit"
              disabled={isMutating}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar cambios
            </button>
          </form>

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-red-600">Zona de riesgo</h2>
            <p className="mt-2 text-sm text-slate-500">
              Eliminar el salon borra miembros e invitaciones asociadas.
            </p>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={isMutating}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar salon
            </button>
          </div>
        </div>
      )}
      </div>
    </section>
  )
}
