package reactroles

import (
	"context"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/andersfylling/disgord/std"
	"github.com/puckzxz/reactroles/config"
	"github.com/puckzxz/reactroles/models"
	"github.com/zippoxer/bow"

	"github.com/andersfylling/disgord"
	"github.com/andersfylling/snowflake/v4"
	"github.com/sirupsen/logrus"
)

const BOW_MESSAGE_BUCKET = "messages"

type ReactRoles struct {
	c      *disgord.Client
	db     *bow.DB
	prefix string
	log    *logrus.Logger
}

func New(cfg *config.Config) (*ReactRoles, error) {
	var log = &logrus.Logger{
		Out:       os.Stderr,
		Formatter: new(logrus.TextFormatter),
		Hooks:     make(logrus.LevelHooks),
		Level:     logrus.InfoLevel,
	}

	client := disgord.New(disgord.Config{
		ProjectName: "ReactRoles",
		BotToken:    cfg.Token,
		Logger:      log,
		RejectEvents: []string{
			disgord.EvtTypingStart,

			//Requires privledged intents
			disgord.EvtPresenceUpdate,
			disgord.EvtGuildMemberAdd,
			disgord.EvtGuildMemberUpdate,
			disgord.EvtGuildMemberRemove,
		},
	})

	db, err := bow.Open("data")

	if err != nil {
		log.WithError(err).Panicln("Failed to open a connection to the database")
		return nil, err
	}

	return &ReactRoles{
		prefix: cfg.Prefix,
		c:      client,
		db:     db,
		log:    log,
	}, nil
}

func (r *ReactRoles) Start() error {
	err := func() error {
		return r.c.Gateway().StayConnectedUntilInterrupted()
	}

	defer r.db.Close()

	filter, _ := std.NewMsgFilter(context.Background(), r.c)

	filter.SetPrefix(r.prefix)

	r.c.Gateway().WithMiddleware(filter.NotByBot, filter.HasPrefix, filter.StripPrefix).MessageCreate(r.onMsg)

	r.c.Gateway().MessageReactionAdd(r.onReactAdd)

	r.c.Gateway().MessageReactionRemove(r.onReactRemove)

	return err()
}

func (r *ReactRoles) onMsg(sess disgord.Session, evt *disgord.MessageCreate) {
	member, err := r.c.Guild(evt.Message.GuildID).Member(evt.Message.Author.ID).Get()

	if err != nil {
		r.log.WithError(err).Errorln("Failed to get member")
		return
	}

	member.GuildID = evt.Message.GuildID

	perms, err := member.GetPermissions(context.Background(), r.c)

	if err != nil {
		r.log.WithError(err).Errorln("Failed to get member permissions")
		return
	}

	if perms&disgord.PermissionAdministrator != disgord.PermissionAdministrator {
		r.log.WithFields(logrus.Fields{
			"User ID":   member.UserID,
			"User Name": member.User.Username,
		}).Infoln("User did not have permission to run command")
		return
	}

	msg := evt.Message

	if len(msg.Content) == 0 {
		return
	}

	if strings.HasPrefix(msg.Content, "add") {
		msg.Content = strings.TrimPrefix(msg.Content, "add")
		msg.Content = strings.TrimSpace(msg.Content)
		r.addCommand(&sess, msg)
	} else if msg.Content == "show" {
		msg.Content = strings.TrimPrefix(msg.Content, "show")
		msg.Content = strings.TrimSpace(msg.Content)
		r.showCommand(&sess, msg)
	} else if strings.HasPrefix(msg.Content, "remove") {
		msg.Content = strings.TrimPrefix(msg.Content, "remove")
		msg.Content = strings.TrimSpace(msg.Content)
		r.removeCommand(&sess, msg)
	}
}

func (r *ReactRoles) onReactAdd(sess disgord.Session, evt *disgord.MessageReactionAdd) {
	self, err := sess.CurrentUser().Get()

	if err != nil {
		r.log.WithError(err).Errorln("Failed to get current user")
		return
	}

	if evt.UserID == self.ID {
		return
	}

	msg := &models.Message{}

	err = r.db.Bucket(BOW_MESSAGE_BUCKET).Get(evt.MessageID.String(), msg)

	if err == bow.ErrNotFound {
		return
	} else if err != nil {
		r.log.WithError(err).Errorln("Failed to retrieve message")
	}

	for _, x := range msg.Reactions {
		if x.Emoji == evt.PartialEmoji.Name {
			roles, err := sess.Guild(snowflake.NewSnowflake(msg.GuildID)).GetRoles()
			if err != nil {
				r.log.WithError(err).Errorln("Role not found")
				return
			}
			for _, y := range roles {
				if y.Name == x.Role {
					err = sess.Guild(snowflake.NewSnowflake(msg.GuildID)).Member(evt.UserID).AddRole(y.ID)
					if err != nil {
						r.log.WithError(err).Errorln("Failed to add role to guild member")
						return
					}
				}
			}
		}
	}
}

func (r *ReactRoles) onReactRemove(sess disgord.Session, evt *disgord.MessageReactionRemove) {
	self, err := sess.CurrentUser().Get()

	if err != nil {
		r.log.WithError(err).Errorln("Failed to get current user")
		return
	}

	if evt.UserID == self.ID {
		return
	}

	msg := &models.Message{}

	err = r.db.Bucket(BOW_MESSAGE_BUCKET).Get(evt.MessageID.String(), msg)

	if err == bow.ErrNotFound {
		return
	} else if err != nil {
		r.log.WithError(err).Errorln("Failed to retrieve message")
	}

	for _, x := range msg.Reactions {
		if x.Emoji == evt.PartialEmoji.Name {
			roles, err := sess.Guild(snowflake.NewSnowflake(msg.GuildID)).GetRoles()
			if err != nil {
				r.log.WithError(err).Errorln("Role not found")
				return
			}
			for _, y := range roles {
				if y.Name == x.Role {
					err = sess.Guild(snowflake.NewSnowflake(msg.GuildID)).Member(evt.UserID).RemoveRole(y.ID)
					if err != nil {
						r.log.WithError(err).Errorln("Failed to remove role from guild member")
						return
					}
				}
			}
		}
	}
}

func (r *ReactRoles) addCommand(sess *disgord.Session, msg *disgord.Message) {
	args := strings.Split(msg.Content, " ")

	// If we have less than 4 args we don't have a valid command
	if len(args) < 4 {
		if _, err := msg.Reply(
			context.Background(),
			*sess,
			fmt.Sprintf("At least **4** args are **required** to add a message, %d provided", len(args)),
		); err != nil {
			r.log.WithError(err).Errorln("Failed to send message")
		}
		return
	}

	rawChannel := args[0]

	channelId, err := strconv.ParseUint(rawChannel[2:len(rawChannel)-1], 10, 64)

	if err != nil {
		if _, err := msg.Reply(context.Background(), *sess, "Failed to parse channel ID"); err != nil {
			r.log.WithError(err).Errorln("Failed to send message")
		}
		return
	}

	if ok := snowflake.NewSnowflake(channelId).Valid(); !ok {
		if _, err := msg.Reply(context.Background(), *sess, "Channel ID was not a valid snowflake"); err != nil {
			r.log.WithError(err).Errorln("Failed to send message")
		}
		return
	}

	rawMessage, err := strconv.ParseUint(args[1], 10, 64)

	if err != nil {
		if _, err := msg.Reply(context.Background(), *sess, "Failed to parse message ID"); err != nil {
			r.log.WithError(err).Errorln("Failed to send message")
		}
		return
	}

	messageId := snowflake.NewSnowflake(rawMessage)

	if !messageId.Valid() {
		if _, err := msg.Reply(context.Background(), *sess, "Message ID was not a valid snowflake"); err != nil {
			r.log.WithError(err).Errorln("Failed to send message")
		}
		return
	}

	args = args[2:]

	if len(args)%2 != 0 {
		if _, err := msg.Reply(context.Background(), *sess, "Uneven number of emojis to roles"); err != nil {
			r.log.WithError(err).Errorln("Failed to send message")
		}
		return
	}

	message := &models.Message{
		MessageID: messageId.String(),
		GuildID:   uint64(msg.GuildID),
	}

	reactions := []models.Reaction{}

	for len(args) > 0 {
		reactions = append(reactions, models.Reaction{
			Emoji: args[0],
			Role:  args[1],
		})
		args = args[2:]
	}

	message.Reactions = reactions

	if err = r.db.Bucket(BOW_MESSAGE_BUCKET).Put(message); err != nil {
		r.log.WithError(err).Errorln("Failed to insert message")
	}

	for _, react := range message.Reactions {
		err := r.c.Channel(snowflake.NewSnowflake(channelId)).Message(messageId).Reaction(react.Emoji).Create()
		if err != nil {
			r.log.WithError(err).Errorln("Failed to react to message")
		}
	}
}

func (r *ReactRoles) removeCommand(sess *disgord.Session, msg *disgord.Message) {
	if err := r.db.Bucket(BOW_MESSAGE_BUCKET).Delete(msg.Content); err != nil {
		r.log.WithError(err).Errorln("Failed to delete message from database")
	}
}

func (r *ReactRoles) showCommand(sess *disgord.Session, msg *disgord.Message) {
	msgToSend := ""

	m := &models.Message{}

	iter := r.db.Bucket(BOW_MESSAGE_BUCKET).Iter()

	defer iter.Close()

	for iter.Next(m) {
		msgToSend += fmt.Sprintf("%s\n", m.MessageID)
		for _, x := range m.Reactions {
			msgToSend += fmt.Sprintf("\t%s - `%s`\n", x.Emoji, x.Role)
		}
	}

	if err := iter.Err(); err != nil {
		r.log.WithError(err).Errorln("Failed to iterate database")
	}

	if msgToSend == "" {
		if _, err := msg.Reply(context.Background(), *sess, "No entires in database"); err != nil {
			r.log.WithError(err).Errorln("Failed to send message")
		}
		return
	}

	if _, err := msg.Reply(context.Background(), *sess, msgToSend); err != nil {
		r.log.WithError(err).Errorln("Failed to send message")
	}
}
