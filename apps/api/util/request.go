package util

import (
	"encoding/json"
	"log"
	"net/http"
)

type ErrorResponse struct {
    Error string `json:"error"`
}

func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		log.Printf("encoding error: %s", err)
	}
}

func WriteError(w http.ResponseWriter, status int, message string) {
    WriteJSON(w, status, ErrorResponse{Error: message})
}