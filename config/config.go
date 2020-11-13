package config

import (
	"errors"
	"os"

	log "github.com/sirupsen/logrus"
)

type Config struct {
	Token  string
	Prefix string
}

func New() (*Config, error) {
	cfg := &Config{}

	cfg.Prefix = os.Getenv("PREFIX")

	cfg.Token = os.Getenv("TOKEN")

	if cfg.Prefix == "" {
		log.Errorln("No prefix in environment")
		return nil, errors.New("No prefix in environment")
	}

	if cfg.Token == "" {
		log.Errorln("No token in environment")
		return nil, errors.New("No token in environment")
	}

	return cfg, nil
}
