package main

import (
	log "github.com/Sirupsen/logrus"
	"github.com/codegangsta/negroni"
)

func main() {
	log.Info("Starting generator")
	n := negroni.Classic()
	n.Run(":3030")
}
