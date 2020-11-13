package main

import (
	"github.com/puckzxz/reactroles/config"
	"github.com/puckzxz/reactroles/reactroles"
	log "github.com/sirupsen/logrus"
)

func main() {
	cfg, err := config.New()

	if err != nil {
		log.WithError(err).Panicln("Failed to get config")
	}

	rr, err := reactroles.New(cfg)

	if err != nil {
		log.WithError(err).Panicln("Failed to create ReactRole instance")
	}

	if err = rr.Start(); err != nil {
		log.WithError(err).Panicln("Exited with error")
	}
}
