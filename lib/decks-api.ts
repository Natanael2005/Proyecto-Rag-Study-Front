import { ApiRequestError } from "@/lib/auth-api"

export type DeckCard = {
  id: string
  deck_id: string
  front_text: string
  back_text: string
  is_seen?: boolean
  created_at?: string
}

export type Deck = {
  id: string
  user_id?: string
  organization_id: string
  document_id?: string | null
  title: string
  created_at?: string
  card_count?: number
  cards?: DeckCard[]
}

export type CreateDeckPayload = {
  title: string
  organization_id: string
}

export type CreateDeckFromDocumentPayload = CreateDeckPayload & {
  document_id: string
  num_cards: number
}

export type CreateCardsPayload = {
  cards: Array<{
    front_text: string
    back_text: string
  }>
}

export type UpdateCardPayload = {
  front_text?: string | null
  back_text?: string | null
}

export type LlmEditCardPayload = {
  instruction: string
}

export type LlmEditProposal = {
  front_text: string
  back_text: string
}

export type CardView = {
  user_id: string
  flashcard_id: string
  viewed_at: string
}

async function parseResponseData(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null)
  }

  return response.text().catch(() => null)
}

function getErrorMessage(data: unknown, fallbackMessage: string) {
  if (typeof data === "string" && data.trim() !== "") {
    return data
  }

  const errorData = data as
    | {
        detail?: string | { msg?: string }[]
        message?: string
        error?: string
      }
    | null

  if (typeof errorData?.detail === "string") {
    return errorData.detail
  }

  if (Array.isArray(errorData?.detail) && errorData.detail.length > 0) {
    return errorData.detail[0].msg ?? fallbackMessage
  }

  return errorData?.message || errorData?.error || fallbackMessage
}

async function requestDecks(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers)

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(endpoint, {
    ...options,
    credentials: "include",
    headers,
  })
  const data = await parseResponseData(response)

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(data, "No se pudo completar la accion de decks."),
      response.status,
      data
    )
  }

  return data
}

function getDeckEndpoint(deckId: string) {
  return `/api/decks/${encodeURIComponent(deckId)}`
}

export function getDecks(organizationId?: string) {
  const searchParams = new URLSearchParams()

  if (organizationId) {
    searchParams.set("organization_id", organizationId)
  }

  const query = searchParams.toString()

  return requestDecks(`/api/decks${query ? `?${query}` : ""}`, {
    method: "GET",
  })
}

export function createDeck(payload: CreateDeckPayload) {
  return requestDecks("/api/decks", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function createDeckFromDocument(payload: CreateDeckFromDocumentPayload) {
  return requestDecks("/api/decks/from-document", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function getDeck(deckId: string) {
  return requestDecks(getDeckEndpoint(deckId), {
    method: "GET",
  })
}

export function deleteDeck(deckId: string) {
  return requestDecks(getDeckEndpoint(deckId), {
    method: "DELETE",
  })
}

function getCardsEndpoint(deckId: string) {
  return `${getDeckEndpoint(deckId)}/cards`
}

function getCardEndpoint(deckId: string, cardId: string) {
  return `${getCardsEndpoint(deckId)}/${encodeURIComponent(cardId)}`
}

export function createCards(deckId: string, payload: CreateCardsPayload) {
  return requestDecks(getCardsEndpoint(deckId), {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateCard(
  deckId: string,
  cardId: string,
  payload: UpdateCardPayload
) {
  return requestDecks(getCardEndpoint(deckId, cardId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function deleteCard(deckId: string, cardId: string) {
  return requestDecks(getCardEndpoint(deckId, cardId), {
    method: "DELETE",
  })
}

export function suggestCardEdit(
  deckId: string,
  cardId: string,
  payload: LlmEditCardPayload
) {
  return requestDecks(`${getCardEndpoint(deckId, cardId)}/llm-edit`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function markCardAsViewed(deckId: string, cardId: string) {
  return requestDecks(`${getCardEndpoint(deckId, cardId)}/views`, {
    method: "POST",
  })
}

export function getCardViews(deckId: string, cardId: string) {
  return requestDecks(`${getCardEndpoint(deckId, cardId)}/views`, {
    method: "GET",
  })
}

export function getUnseenCards(deckId: string) {
  return requestDecks(`${getDeckEndpoint(deckId)}/unseen`, {
    method: "GET",
  })
}
