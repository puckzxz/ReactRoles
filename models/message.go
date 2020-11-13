package models

type Message struct {
	MessageID string `bow:"key"`
	// Needed because disgord doesn't currently give the guild ID on reaction add and remove events
	GuildID   uint64
	Reactions []Reaction
}
